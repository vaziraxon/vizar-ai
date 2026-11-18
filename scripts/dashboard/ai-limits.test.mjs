import { test } from "node:test";
import assert from "node:assert/strict";
import {
  VOICE_WEEKLY_SECONDS,
  chargedSeconds,
  closingTime,
  isStale,
  remainingVoiceSeconds,
  tashkentDayStart,
  tashkentMonthStart,
  tashkentNextWeekStart,
  tashkentWeekStart,
} from "../../src/lib/ai/limits.ts";
import { claudeCost, realtimeMiniTokenCost, voicePlanPerMinute, voiceSessionCost } from "../../src/lib/ai/pricing.ts";

const iso = (s) => new Date(s).toISOString();

test("the day starts at 00:00 Tashkent (19:00 UTC the day before)", () => {
  assert.equal(iso(tashkentDayStart(new Date("2026-11-11T10:00:00Z"))), "2026-11-10T19:00:00.000Z");
  // 20:30 UTC is already 01:30 the next day in Tashkent
  assert.equal(iso(tashkentDayStart(new Date("2026-11-11T20:30:00Z"))), "2026-11-11T19:00:00.000Z");
});

test("the week starts on Monday 00:00 Tashkent and resets the next Monday", () => {
  // Wednesday 11 Nov 2026 → Monday 9 Nov 00:00 Tashkent
  assert.equal(iso(tashkentWeekStart(new Date("2026-11-11T10:00:00Z"))), "2026-11-08T19:00:00.000Z");
  assert.equal(iso(tashkentNextWeekStart(new Date("2026-11-11T10:00:00Z"))), "2026-11-15T19:00:00.000Z");
  // Sunday 23:59 Tashkent still belongs to the old week, Monday 00:00 to the new one
  assert.equal(iso(tashkentWeekStart(new Date("2026-11-15T18:59:00Z"))), "2026-11-08T19:00:00.000Z");
  assert.equal(iso(tashkentWeekStart(new Date("2026-11-15T19:00:00Z"))), "2026-11-15T19:00:00.000Z");
});

test("the budget month starts on the 1st, 00:00 Tashkent", () => {
  assert.equal(iso(tashkentMonthStart(new Date("2026-11-11T10:00:00Z"))), "2026-10-31T19:00:00.000Z");
  assert.equal(iso(tashkentMonthStart(new Date("2026-11-30T19:30:00Z"))), "2026-11-30T19:00:00.000Z");
});

const session = (start, minutes, extra = {}) => ({
  started_at: start,
  deadline_at: new Date(Date.parse(start) + 15 * 60_000).toISOString(),
  last_seen_at: start,
  ended_at: new Date(Date.parse(start) + minutes * 60_000).toISOString(),
  seconds_used: Math.round(minutes * 60),
  ...extra,
});

test("6 minutes used leaves 9; minutes from last week don't count", () => {
  const now = new Date("2026-11-11T10:00:00Z");
  assert.equal(remainingVoiceSeconds([], now), VOICE_WEEKLY_SECONDS);
  assert.equal(remainingVoiceSeconds([session("2026-11-10T08:00:00Z", 6)], now), 9 * 60);
  assert.equal(remainingVoiceSeconds([session("2026-11-07T08:00:00Z", 15), session("2026-11-10T08:00:00Z", 6)], now), 9 * 60);
  // Used up: never negative
  assert.equal(remainingVoiceSeconds([session("2026-11-10T08:00:00Z", 15), session("2026-11-10T09:00:00Z", 3)], now), 0);
});

test("an open session counts wall-clock time, capped at its deadline", () => {
  const open = { started_at: "2026-11-11T10:00:00Z", deadline_at: "2026-11-11T10:05:00Z", last_seen_at: "2026-11-11T10:02:00Z", ended_at: null, seconds_used: null };
  assert.equal(chargedSeconds(open, new Date("2026-11-11T10:02:00Z")), 120);
  assert.equal(chargedSeconds(open, new Date("2026-11-11T11:00:00Z")), 300);
  assert.equal(remainingVoiceSeconds([open], new Date("2026-11-11T10:02:00Z")), VOICE_WEEKLY_SECONDS - 120);
});

test("a browser that stops checking in is stale and is charged up to its last check-in plus grace", () => {
  const open = { started_at: "2026-11-11T10:00:00Z", deadline_at: "2026-11-11T10:15:00Z", last_seen_at: "2026-11-11T10:03:00Z", ended_at: null, seconds_used: null };
  assert.equal(isStale(open, new Date("2026-11-11T10:03:20Z")), false);
  assert.equal(isStale(open, new Date("2026-11-11T10:03:30Z")), true);
  assert.equal(iso(closingTime(open, new Date("2026-11-11T10:09:00Z"))), "2026-11-11T10:03:25.000Z");
  // Past the deadline: stale, closed at the deadline
  const late = { ...open, last_seen_at: "2026-11-11T10:14:59Z" };
  assert.equal(isStale(late, new Date("2026-11-11T10:15:00Z")), true);
  assert.equal(iso(closingTime(late, new Date("2026-11-11T10:16:00Z"))), "2026-11-11T10:15:00.000Z");
});

test("Claude cost follows the Opus 5.5 price list", () => {
  // 10k in at $4/M + 1k out at $20/M = 0.04 + 0.02
  assert.equal(claudeCost("claude-opus-5-5", { input_tokens: 10_000, output_tokens: 1_000 }).toFixed(4), "0.0600");
  assert.equal(claudeCost("claude-opus-5-5", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 100_000 }).toFixed(4), "0.0200");
});

test("voice cost: gpt-live-1 per second, realtime mini by tokens within a cap", () => {
  assert.equal(voiceSessionCost("gpt-live-1", 15 * 60).toFixed(2), "0.75");
  assert.equal(voiceSessionCost("gpt-live-1", 6 * 60).toFixed(2), "0.30");
  assert.equal(voicePlanPerMinute("gpt-live-1"), 0.05);
  const usage = { audio_in: 6000, audio_cached: 40000, audio_out: 9000, text_in: 3000, text_cached: 0, text_out: 500 };
  const tokens = realtimeMiniTokenCost(usage);
  assert.equal(voiceSessionCost("gpt-realtime-2.1-mini", 15 * 60, usage), tokens);
  // No report: planning rate; a tampered huge report: capped
  assert.equal(voiceSessionCost("gpt-realtime-2.1-mini", 60).toFixed(2), "0.08");
  assert.equal(voiceSessionCost("gpt-realtime-2.1-mini", 60, { ...usage, audio_out: 1e9 }).toFixed(2), "0.20");
});
