/**
 * What each paid AI call costs, in US dollars, from the providers' published
 * price lists (checked 2026-11-11):
 *   Anthropic — platform.claude.com pricing (per 1M tokens)
 *   OpenAI    — developers.openai.com/api/docs/pricing
 * Used to count spending against the admin's monthly budget. These are our
 * own estimates of the bill, not the provider's invoice.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */

export const CLAUDE_MODEL = "claude-opus-5-5";
export const VOICE_MODELS = ["gpt-realtime-2.1-mini", "gpt-live-1"] as const;
export type VoiceModel = (typeof VOICE_MODELS)[number];
export const isVoiceModel = (v: unknown): v is VoiceModel => typeof v === "string" && (VOICE_MODELS as readonly string[]).includes(v);

/** $ per 1M tokens */
const CLAUDE_PRICES: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
};

export interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

/** Cost of one Claude response from its usage block (unknown models priced as Opus 5.5) */
export function claudeCost(model: string, usage: ClaudeUsage): number {
  const p = CLAUDE_PRICES[model] ?? CLAUDE_PRICES[CLAUDE_MODEL]!;
  const perToken = (rate: number, tokens: number | null | undefined) => (rate * Math.max(0, tokens ?? 0)) / 1_000_000;
  return (
    perToken(p.input, usage.input_tokens) +
    perToken(p.output, usage.output_tokens) +
    perToken(p.cacheRead, usage.cache_read_input_tokens) +
    perToken(p.cacheWrite, usage.cache_creation_input_tokens)
  );
}

/** gpt-live-1: $0.05 per minute, billed per second (no tools or backend model are used) */
const LIVE_PER_MINUTE = 0.05;

/**
 * gpt-realtime-2.1-mini is billed per token ($10 / $20 per 1M audio tokens
 * in / out, $0.30 cached), so its per-minute cost depends on how much each
 * side talks. Budget planning uses a deliberately high rate; the measured
 * cost (from the session's own usage report) replaces it when available,
 * within a sanity cap so a tampered report can't distort the budget.
 */
export const REALTIME_MINI_PLAN_PER_MINUTE = 0.08;
const REALTIME_MINI_CAP_PER_MINUTE = 0.2;
const REALTIME_MINI_PRICES = {
  audioIn: 10,
  audioCached: 0.3,
  audioOut: 20,
  textIn: 0.6,
  textCached: 0.06,
  textOut: 2.4,
};

/** Token counts summed from the session's `response.done` usage reports */
export interface RealtimeUsage {
  audio_in: number;
  audio_cached: number;
  audio_out: number;
  text_in: number;
  text_cached: number;
  text_out: number;
}

export function realtimeMiniTokenCost(u: RealtimeUsage): number {
  const p = REALTIME_MINI_PRICES;
  const m = (rate: number, n: number) => (rate * Math.max(0, n || 0)) / 1_000_000;
  return (
    m(p.audioIn, u.audio_in) + m(p.audioCached, u.audio_cached) + m(p.audioOut, u.audio_out) +
    m(p.textIn, u.text_in) + m(p.textCached, u.text_cached) + m(p.textOut, u.text_out)
  );
}

/** Highest cost we plan for, per minute — used for the budget check before a session */
export function voicePlanPerMinute(model: VoiceModel): number {
  return model === "gpt-live-1" ? LIVE_PER_MINUTE : REALTIME_MINI_PLAN_PER_MINUTE;
}

/** The cost we record for a finished voice session */
export function voiceSessionCost(model: VoiceModel, seconds: number, reported?: RealtimeUsage | null): number {
  const minutes = Math.max(0, seconds) / 60;
  if (model === "gpt-live-1") return minutes * LIVE_PER_MINUTE;
  if (!reported) return minutes * REALTIME_MINI_PLAN_PER_MINUTE;
  return Math.min(realtimeMiniTokenCost(reported), minutes * REALTIME_MINI_CAP_PER_MINUTE);
}
