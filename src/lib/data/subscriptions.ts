import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { subscriptionRequestCancelSchema, subscriptionRequestSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import type { Database } from "@/types/database";

export type SubscriptionRequestRow = Database["public"]["Tables"]["subscription_requests"]["Row"];

export interface MySubscription {
  plan: string;
  startsAt: string;
  expiresAt: string;
}

/** The plan that is active right now (my_active_subscription), or null. */
export async function getMyActiveSubscription(): Promise<DataResult<MySubscription | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  // The RPC isn't in the generated types; same function the library uses (lib/knowledge/access.ts)
  const { data, error } = await (ctx.supabase as unknown as SupabaseClient).rpc("my_active_subscription");
  if (error) return genericDbError();
  const row = ((data ?? []) as { plan: string; starts_at: string; expires_at: string }[])[0];
  return { ok: true, data: row ? { plan: row.plan, startsAt: row.starts_at, expiresAt: row.expires_at } : null };
}

export async function listMySubscriptionRequests(): Promise<DataResult<SubscriptionRequestRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("subscription_requests")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

/**
 * Saves a plan request for a site editor (see /admin/subscriptions). There is
 * no online payment yet: the editor contacts the user, takes the payment and
 * approves the request, which opens the library for the plan's period.
 */
export async function requestSubscription(input: unknown): Promise<DataResult<SubscriptionRequestRow>> {
  const parsed = subscriptionRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "db_error", error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri." };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const limit = await rateLimit(`subscription-request:${ctx.userId}`, 5, 24 * 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, reason: "db_error", error: "Bugun juda ko'p so'rov yubordingiz. Ertaga qayta urinib ko'ring." };
  }

  // One open request at a time keeps the editor's list clear
  const open = await ctx.supabase
    .from("subscription_requests")
    .select("id")
    .eq("user_id", ctx.userId)
    .eq("status", "pending")
    .limit(1);
  if (open.error) return genericDbError();
  if (open.data && open.data.length > 0) {
    return { ok: false, reason: "db_error", error: "Sizda ko'rib chiqilayotgan so'rov bor. Uni bekor qilib, yangisini yuborishingiz mumkin." };
  }

  const { data, error } = await ctx.supabase
    .from("subscription_requests")
    .insert({ user_id: ctx.userId, plan: parsed.data.plan, contact: parsed.data.contact, message: parsed.data.message })
    .select("*")
    .single();

  if (error) return genericDbError();

  await ctx.supabase.from("notifications").insert({
    user_id: ctx.userId,
    type: "subscription",
    title: "Obuna so'rovi yuborildi",
    message: "To'lov bo'yicha siz yozgan aloqa orqali bog'lanamiz.",
  });

  return { ok: true, data };
}

export async function cancelSubscriptionRequest(input: unknown): Promise<DataResult<SubscriptionRequestRow>> {
  const parsed = subscriptionRequestCancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "db_error", error: "Noto'g'ri so'rov." };

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("subscription_requests")
    .update({ status: "cancelled" })
    .eq("id", parsed.data.requestId)
    .eq("user_id", ctx.userId)
    .eq("status", "pending")
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
