import "server-only";
import { PLAYBOOK_COUNTRIES } from "@/data/interview-playbook";
import { adminDb, getAiSettings, isBetaUser, monthSpend, recordUsage, type AdminDb } from "@/lib/ai/beta";
import {
  VOICE_MIN_START_SECONDS,
  VOICE_WEEKLY_SECONDS,
  closingTime,
  isStale,
  remainingVoiceSeconds,
  tashkentNextWeekStart,
  tashkentWeekStart,
} from "@/lib/ai/limits";
import { voicePlanPerMinute, voiceSessionCost, type RealtimeUsage, type VoiceModel } from "@/lib/ai/pricing";
import { evaluateInterview, type TranscriptTurn, type VoiceEvaluation } from "@/lib/voice/evaluate";
import { buildInterviewerInstructions, type VisaKind, type VoiceLang, type VoiceLevel } from "@/lib/voice/instructions";
import { hangupVoiceCall, startVoiceCall, voiceConfigured } from "@/lib/voice/providers";

/**
 * Voice interview sessions, counted on the server (supabase/ai_beta.sql):
 *  - 15 minutes a week per user (Monday 00:00 Tashkent), wall-clock time
 *  - one open session per user (a unique index in the database)
 *  - the browser checks in every 10 s; a silent browser, a closed tab or a
 *    session past its deadline is closed by the server, which also hangs up
 *    the OpenAI call — any request (status, start, check-in, the sweep job)
 *    runs that clean-up first
 *  - a refresh, a second tab or a reconnect starts nothing new while the old
 *    session is alive, and minutes already used stay used
 */

const COLUMNS =
  "id, user_id, model, remote_id, destination, visa_kind, language, level, started_at, deadline_at, last_seen_at, ended_at, end_reason, seconds_used, cost_usd, evaluation";

export interface VoiceSessionRow {
  id: string;
  user_id: string;
  model: VoiceModel;
  remote_id: string | null;
  destination: string;
  visa_kind: VisaKind;
  language: VoiceLang;
  level: VoiceLevel;
  started_at: string;
  deadline_at: string;
  last_seen_at: string;
  ended_at: string | null;
  end_reason: string | null;
  seconds_used: number | null;
  cost_usd: number | null;
  evaluation: VoiceEvaluation | null;
}

export type VoiceDenied =
  | "not_configured"
  | "not_beta"
  | "disabled"
  | "budget"
  | "week_limit"
  | "active_elsewhere"
  | "bad_request"
  | "provider_error"
  | "not_found";

const secondsBetween = (a: number, b: number) => Math.max(0, Math.round((b - a) / 1000));

/** Marks a session ended (once), hangs up the OpenAI call and logs the cost */
async function closeSession(db: AdminDb, row: VoiceSessionRow, end: Date, reason: string, reported?: RealtimeUsage | null) {
  const seconds = secondsBetween(Date.parse(row.started_at), Math.min(end.getTime(), Date.parse(row.deadline_at)));
  const cost = voiceSessionCost(row.model, seconds, row.model === "gpt-realtime-2.1-mini" ? reported : null);
  const { data } = await db
    .from("voice_sessions")
    .update({ ended_at: end.toISOString(), end_reason: reason, seconds_used: seconds, cost_usd: Number(cost.toFixed(6)) })
    .eq("id", row.id)
    .is("ended_at", null)
    .select("id")
    .maybeSingle();
  // Someone else (another request, the sweep) closed it first
  if (!data) return;
  await hangupVoiceCall(row.model, row.remote_id);
  if (row.remote_id) {
    await recordUsage(db, { user_id: row.user_id, provider: "openai", feature: "voice_session", model: row.model, seconds, cost_usd: cost });
  }
}

/** Closes every open session whose browser went silent or whose time ran out */
export async function sweepStaleSessions(db: AdminDb, now = new Date(), userId?: string) {
  let query = db.from("voice_sessions").select(COLUMNS).is("ended_at", null).limit(100);
  if (userId) query = query.eq("user_id", userId);
  const { data } = await query.returns<VoiceSessionRow[]>();
  for (const row of data ?? []) {
    if (!isStale(row, now)) continue;
    const reason = now.getTime() >= Date.parse(row.deadline_at) ? "time_up" : "connection_lost";
    await closeSession(db, row, closingTime(row, now), reason);
  }
}

async function weekRows(db: AdminDb, userId: string, now: Date) {
  const { data } = await db
    .from("voice_sessions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .gte("started_at", tashkentWeekStart(now).toISOString())
    .order("started_at", { ascending: false })
    .returns<VoiceSessionRow[]>();
  return data ?? [];
}

export interface VoiceStatus {
  configured: boolean;
  beta: boolean;
  enabled: boolean;
  model: VoiceModel;
  weeklySeconds: number;
  remainingSeconds: number;
  resetsAt: string;
  active: { id: string; deadlineAt: string } | null;
  history: {
    id: string;
    startedAt: string;
    seconds: number;
    destination: string;
    level: VoiceLevel;
    language: VoiceLang;
    overall: number | null;
    endReason: string | null;
  }[];
}

export async function getVoiceStatus(userId: string): Promise<VoiceStatus> {
  const now = new Date();
  const db = adminDb();
  const base: VoiceStatus = {
    configured: false,
    beta: false,
    enabled: false,
    model: "gpt-realtime-2.1-mini",
    weeklySeconds: VOICE_WEEKLY_SECONDS,
    remainingSeconds: 0,
    resetsAt: tashkentNextWeekStart(now).toISOString(),
    active: null,
    history: [],
  };
  if (!db) return base;
  const [settings, beta] = await Promise.all([getAiSettings(db), isBetaUser(db, userId)]);
  await sweepStaleSessions(db, now, userId);
  const rows = await weekRows(db, userId, now);
  const { data: past } = await db
    .from("voice_sessions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(12)
    .returns<VoiceSessionRow[]>();
  const open = rows.find((r) => !r.ended_at);
  return {
    ...base,
    configured: voiceConfigured(),
    beta,
    enabled: settings.voice_enabled,
    model: settings.voice_model,
    remainingSeconds: remainingVoiceSeconds(rows, now),
    active: open ? { id: open.id, deadlineAt: open.deadline_at } : null,
    history: (past ?? []).map((r) => ({
      id: r.id,
      startedAt: r.started_at,
      seconds: r.seconds_used ?? 0,
      destination: r.destination,
      level: r.level,
      language: r.language,
      overall: r.evaluation?.overall ?? null,
      endReason: r.end_reason,
    })),
  };
}

/** Up to 12 playbook questions for the country and level, in the interview language */
async function playbookQuestions(db: AdminDb, country: string, level: VoiceLevel, lang: VoiceLang): Promise<string[]> {
  const column = `question_${lang}`;
  const { data } = await db
    .from("interview_questions")
    .select(column)
    .eq("country_code", country)
    .eq("level", level)
    .order("sort_order")
    .limit(80);
  const all = ((data ?? []) as unknown as Record<string, string | null>[])
    .map((r) => r[column])
    .filter((q): q is string => Boolean(q));
  // A different mix each session
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  return all.slice(0, 12);
}

export async function startVoiceSession(
  userId: string,
  input: { sdp: string; country: string; visaKind: VisaKind; language: VoiceLang; level: VoiceLevel }
): Promise<
  | { ok: true; sessionId: string; answerSdp: string; remainingSeconds: number; deadlineAt: string; model: VoiceModel }
  | { ok: false; reason: VoiceDenied }
> {
  const db = adminDb();
  if (!db || !voiceConfigured()) return { ok: false, reason: "not_configured" };
  const country = PLAYBOOK_COUNTRIES.find((c) => c.code === input.country);
  if (!country) return { ok: false, reason: "bad_request" };

  const now = new Date();
  const [settings, beta] = await Promise.all([getAiSettings(db), isBetaUser(db, userId)]);
  if (!beta) return { ok: false, reason: "not_beta" };
  if (!settings.voice_enabled) return { ok: false, reason: "disabled" };

  await sweepStaleSessions(db, now);
  const rows = await weekRows(db, userId, now);
  if (rows.some((r) => !r.ended_at)) return { ok: false, reason: "active_elsewhere" };
  const remaining = remainingVoiceSeconds(rows, now);
  if (remaining < VOICE_MIN_START_SECONDS) return { ok: false, reason: "week_limit" };

  const spend = await monthSpend(db, now);
  const planned = (remaining / 60) * voicePlanPerMinute(settings.voice_model);
  if (spend.total + planned > settings.monthly_budget_usd) return { ok: false, reason: "budget" };

  const deadline = new Date(now.getTime() + remaining * 1000);
  const { data: row, error } = await db
    .from("voice_sessions")
    .insert({
      user_id: userId,
      model: settings.voice_model,
      destination: country.code,
      visa_kind: input.visaKind,
      language: input.language,
      level: input.level,
      started_at: now.toISOString(),
      deadline_at: deadline.toISOString(),
      last_seen_at: now.toISOString(),
    })
    .select(COLUMNS)
    .single<VoiceSessionRow>();
  // 23505: another tab claimed the one open session at the same moment
  if (error || !row) return { ok: false, reason: error?.code === "23505" ? "active_elsewhere" : "provider_error" };

  try {
    const instructions = buildInterviewerInstructions({
      countryName: country.name[input.language],
      visaLabel: country.visa,
      visaKind: input.visaKind,
      language: input.language,
      level: input.level,
      questions: await playbookQuestions(db, country.code, input.level, input.language),
    });
    const call = await startVoiceCall({ model: settings.voice_model, sdp: input.sdp, instructions, language: input.language });
    await db.from("voice_sessions").update({ remote_id: call.remoteId }).eq("id", row.id);
    return { ok: true, sessionId: row.id, answerSdp: call.answerSdp, remainingSeconds: remaining, deadlineAt: row.deadline_at, model: settings.voice_model };
  } catch (error) {
    console.error("[voice] start failed", error instanceof Error ? error.message : error);
    await db
      .from("voice_sessions")
      .update({ ended_at: new Date().toISOString(), end_reason: "start_failed", seconds_used: 0, cost_usd: 0 })
      .eq("id", row.id)
      .is("ended_at", null);
    return { ok: false, reason: "provider_error" };
  }
}

async function ownRow(db: AdminDb, userId: string, sessionId: string) {
  const { data } = await db
    .from("voice_sessions")
    .select(COLUMNS)
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle<VoiceSessionRow>();
  return data;
}

/** The browser's check-in every 10 s: keeps the session alive, ends it at the deadline */
export async function heartbeatVoiceSession(userId: string, sessionId: string) {
  const db = adminDb();
  if (!db) return { ok: false as const, reason: "not_configured" as VoiceDenied };
  const now = new Date();
  const row = await ownRow(db, userId, sessionId);
  if (!row) return { ok: false as const, reason: "not_found" as VoiceDenied };
  if (row.ended_at) return { ok: true as const, ended: true, reason: row.end_reason, remainingSeconds: 0 };
  if (isStale(row, now)) {
    const reason = now.getTime() >= Date.parse(row.deadline_at) ? "time_up" : "connection_lost";
    await closeSession(db, row, closingTime(row, now), reason);
    return { ok: true as const, ended: true, reason, remainingSeconds: 0 };
  }
  await db.from("voice_sessions").update({ last_seen_at: now.toISOString() }).eq("id", row.id).is("ended_at", null);
  // Clean up other users' abandoned sessions too (cheap; at most 25 beta users)
  await sweepStaleSessions(db, now);
  return { ok: true as const, ended: false, reason: null, remainingSeconds: secondsBetween(now.getTime(), Date.parse(row.deadline_at)) };
}

/** The user ends the session (or the browser does at the deadline); then the evaluation */
export async function endVoiceSession(
  userId: string,
  sessionId: string,
  input: { transcript: TranscriptTurn[]; usage: RealtimeUsage | null }
): Promise<{ ok: true; secondsUsed: number; evaluation: VoiceEvaluation | null; evaluationSkipped?: string } | { ok: false; reason: VoiceDenied }> {
  const db = adminDb();
  if (!db) return { ok: false, reason: "not_configured" };
  const now = new Date();
  let row = await ownRow(db, userId, sessionId);
  if (!row) return { ok: false, reason: "not_found" };
  if (!row.ended_at) {
    const end = isStale(row, now) ? closingTime(row, now) : now;
    await closeSession(db, row, end, "user_end", input.usage);
    row = (await ownRow(db, userId, sessionId)) ?? row;
  }
  const secondsUsed = row.seconds_used ?? 0;
  if (row.evaluation) return { ok: true, secondsUsed, evaluation: row.evaluation };

  // The evaluation is one Claude call, inside the monthly budget
  const applicantTurns = input.transcript.filter((t) => t.role === "applicant" && t.text.trim().length > 3);
  if (applicantTurns.length < 2) return { ok: true, secondsUsed, evaluation: null, evaluationSkipped: "too_short" };
  if (!process.env.ANTHROPIC_API_KEY?.trim()) return { ok: true, secondsUsed, evaluation: null, evaluationSkipped: "not_configured" };
  const settings = await getAiSettings(db);
  if (!settings.claude_enabled || (await monthSpend(db, now)).total >= settings.monthly_budget_usd) {
    return { ok: true, secondsUsed, evaluation: null, evaluationSkipped: "budget" };
  }
  const country = PLAYBOOK_COUNTRIES.find((c) => c.code === row!.destination);
  try {
    const result = await evaluateInterview({
      transcript: input.transcript,
      language: row.language,
      countryName: country?.name.en ?? row.destination,
      visaLabel: country?.visa ?? row.visa_kind,
      level: row.level,
    });
    await recordUsage(db, {
      user_id: userId,
      provider: "anthropic",
      feature: "voice_eval",
      model: result.model,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      cost_usd: result.costUsd,
    });
    if (result.evaluation) {
      await db.from("voice_sessions").update({ evaluation: result.evaluation }).eq("id", row.id).is("evaluation", null);
    }
    return { ok: true, secondsUsed, evaluation: result.evaluation, evaluationSkipped: result.evaluation ? undefined : "failed" };
  } catch (error) {
    console.error("[voice] evaluation failed", error instanceof Error ? error.message : error);
    return { ok: true, secondsUsed, evaluation: null, evaluationSkipped: "failed" };
  }
}

/** For the sweep job: is this the token stored in ai_settings */
export async function sweepTokenMatches(db: AdminDb, token: string | null): Promise<boolean> {
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return false;
  const { data } = await db.from("ai_settings").select("sweep_token").eq("id", 1).maybeSingle();
  return Boolean(data && data.sweep_token === token);
}
