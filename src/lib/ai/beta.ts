import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { CLAUDE_DAILY_LIMIT, tashkentDayStart, tashkentMonthStart } from "@/lib/ai/limits";
import { isVoiceModel, type VoiceModel } from "@/lib/ai/pricing";

/**
 * The free AI beta's gate, kept on the server (supabase/ai_beta.sql):
 * only invited users (at most 25), Claude 20 written requests a day, and a
 * monthly budget for all paid AI calls. Every paid call is logged in
 * ai_usage with its estimated cost. Reads and writes use the service role;
 * nothing here trusts the browser.
 */

// The generated database types don't include the beta tables yet
export type AdminDb = SupabaseClient<any, any, any>;

export function adminDb(): AdminDb | null {
  return createAdminClient() as AdminDb | null;
}

export interface AiSettings {
  monthly_budget_usd: number;
  claude_enabled: boolean;
  voice_enabled: boolean;
  voice_model: VoiceModel;
}

const DEFAULT_SETTINGS: AiSettings = {
  monthly_budget_usd: 0,
  claude_enabled: false,
  voice_enabled: false,
  voice_model: "gpt-realtime-2.1-mini",
};

/** The admin's settings; everything off when the table isn't there yet */
export async function getAiSettings(db: AdminDb): Promise<AiSettings> {
  const { data } = await db
    .from("ai_settings")
    .select("monthly_budget_usd, claude_enabled, voice_enabled, voice_model")
    .eq("id", 1)
    .maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  return {
    monthly_budget_usd: Number(data.monthly_budget_usd) || 0,
    claude_enabled: Boolean(data.claude_enabled),
    voice_enabled: Boolean(data.voice_enabled),
    voice_model: isVoiceModel(data.voice_model) ? data.voice_model : DEFAULT_SETTINGS.voice_model,
  };
}

export async function isBetaUser(db: AdminDb, userId: string): Promise<boolean> {
  const { data } = await db.from("ai_beta_users").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

/** Spent this month (Tashkent), in total and per provider */
export async function monthSpend(db: AdminDb, now = new Date()) {
  const { data } = await db
    .from("ai_usage")
    .select("provider, cost_usd")
    .gte("created_at", tashkentMonthStart(now).toISOString());
  const spend = { total: 0, anthropic: 0, openai: 0 };
  for (const row of data ?? []) {
    const cost = Number(row.cost_usd) || 0;
    spend.total += cost;
    if (row.provider === "anthropic") spend.anthropic += cost;
    if (row.provider === "openai") spend.openai += cost;
  }
  return spend;
}

export type ClaudeFeature = "kb_answer" | "doc_advice";
export type ClaudeDenied = "not_configured" | "not_beta" | "disabled" | "budget" | "daily_limit";

/** Uzbek source text shown instead of an AI answer */
export const CLAUDE_DENIED_NOTICE: Record<ClaudeDenied, string> = {
  not_configured: "AI javoblari hozircha ulanmagan. Savolingiz bo‘yicha kitobdan eng mos bo‘limlar va rasmiy manbalar ko‘rsatiladi.",
  not_beta: "AI maslahatchi hozir yopiq beta sinovida — faqat taklif qilingan 25 foydalanuvchi uchun. Kitobdan eng mos bo‘limlar ko‘rsatildi.",
  disabled: "AI maslahatchi vaqtincha to‘xtatilgan. Kitobdan eng mos bo‘limlar ko‘rsatildi.",
  budget: "AI beta sinovining oylik limiti tugadi. Kitobdan eng mos bo‘limlar ko‘rsatildi.",
  daily_limit: "Bugungi 20 ta AI so‘rov limiti tugadi — ertaga soat 00:00 da (Toshkent) yangilanadi. Kitobdan eng mos bo‘limlar ko‘rsatildi.",
};

export type ClaudeTicket = { ok: true; db: AdminDb; usageId: number; usedToday: number } | { ok: false; reason: ClaudeDenied };

/**
 * Reserves one of today's 20 requests before calling Claude: a usage row is
 * written first and counted, so parallel requests can't slip past the limit.
 * Call finishClaude() with the response's usage, or cancelClaude() if no
 * call was made.
 */
export async function reserveClaude(userId: string, feature: ClaudeFeature, model: string): Promise<ClaudeTicket> {
  const db = adminDb();
  if (!db || !process.env.ANTHROPIC_API_KEY?.trim()) return { ok: false, reason: "not_configured" };
  const settings = await getAiSettings(db);
  if (!(await isBetaUser(db, userId))) return { ok: false, reason: "not_beta" };
  if (!settings.claude_enabled) return { ok: false, reason: "disabled" };
  if ((await monthSpend(db)).total >= settings.monthly_budget_usd) return { ok: false, reason: "budget" };

  const { data: row, error } = await db
    .from("ai_usage")
    .insert({ user_id: userId, provider: "anthropic", feature, model })
    .select("id")
    .single();
  if (error || !row) return { ok: false, reason: "not_configured" };

  const { count } = await db
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("provider", "anthropic")
    .in("feature", ["kb_answer", "doc_advice"])
    .gte("created_at", tashkentDayStart(new Date()).toISOString());
  if ((count ?? 0) > CLAUDE_DAILY_LIMIT) {
    await db.from("ai_usage").delete().eq("id", row.id);
    return { ok: false, reason: "daily_limit" };
  }
  return { ok: true, db, usageId: row.id, usedToday: count ?? 1 };
}

export async function finishClaude(
  ticket: Extract<ClaudeTicket, { ok: true }>,
  result: { model: string; inputTokens: number; outputTokens: number; costUsd: number }
) {
  await ticket.db
    .from("ai_usage")
    .update({
      model: result.model.slice(0, 60),
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      cost_usd: Number(result.costUsd.toFixed(6)),
    })
    .eq("id", ticket.usageId);
}

/** No call reached the provider (it failed before sending): give the request back */
export async function cancelClaude(ticket: Extract<ClaudeTicket, { ok: true }>) {
  await ticket.db.from("ai_usage").delete().eq("id", ticket.usageId);
}

/** Logs a paid call that isn't one of the user's 20 daily requests (voice minutes, voice evaluation) */
export async function recordUsage(
  db: AdminDb,
  row: {
    user_id: string;
    provider: "anthropic" | "openai";
    feature: "voice_session" | "voice_eval";
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    seconds?: number;
    cost_usd: number;
  }
) {
  await db.from("ai_usage").insert({ ...row, cost_usd: Number(row.cost_usd.toFixed(6)) });
}

/** For pages: is the signed-in user in the AI beta (false when signed out or not set up) */
export async function signedInUserInBeta(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const db = adminDb();
  return db ? isBetaUser(db, userId) : false;
}
