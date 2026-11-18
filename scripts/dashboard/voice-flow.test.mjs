// Mock end-to-end tests of the AI beta server logic (src/lib/voice/sessions.ts,
// src/lib/ai/beta.ts): in-memory database, fake OpenAI and Claude — no
// network, no real users, no cost. Run with the other dashboard tests.
import { register } from "node:module";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

register("./fakes/loader.mjs", import.meta.url);

process.env.ANTHROPIC_API_KEY = "test-not-a-real-key";

const { db } = await import("./fakes/admin.mjs");
const { calls } = await import("./fakes/providers.mjs");
const { evals } = await import("./fakes/evaluate.mjs");
const sessions = await import("../../src/lib/voice/sessions.ts");
const beta = await import("../../src/lib/ai/beta.ts");

const USER = "aaaaaaaa-0000-0000-0000-000000000001";
const OTHER = "bbbbbbbb-0000-0000-0000-000000000002";
const START = { sdp: "v=0\r\no=offer", country: "us", visaKind: "tourist", language: "en", level: "medium" };
const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();
const openRow = (user) => db.tables.voice_sessions.find((r) => r.user_id === user && !r.ended_at);

/** Moves an open session back in time, as if it started `minutes` ago */
function age(row, minutes, { lastSeen = minutes } = {}) {
  const shift = minutes * 60_000;
  row.started_at = new Date(Date.parse(row.started_at) - shift).toISOString();
  row.deadline_at = new Date(Date.parse(row.deadline_at) - shift).toISOString();
  row.last_seen_at = minutesAgo(lastSeen);
}

beforeEach(() => {
  db.reset();
  calls.started.length = 0;
  calls.hungUp.length = 0;
  calls.failNextStart = false;
  evals.count = 0;
  db.tables.ai_beta_users.push({ user_id: USER, note: null, added_at: new Date().toISOString() });
  db.tables.interview_questions.push(
    ...Array.from({ length: 20 }, (_, i) => ({ country_code: "us", level: "medium", sort_order: i, question_en: `What is your plan ${i}?` }))
  );
});

test("a user outside the beta can't start, and the status says so", async () => {
  const res = await sessions.startVoiceSession(OTHER, START);
  assert.deepEqual(res, { ok: false, reason: "not_beta" });
  const status = await sessions.getVoiceStatus(OTHER);
  assert.equal(status.beta, false);
  assert.equal(calls.started.length, 0);
});

test("start: 15:00 available, playbook questions and safety rules go to the interviewer", async () => {
  const res = await sessions.startVoiceSession(USER, START);
  assert.equal(res.ok, true);
  assert.equal(res.remainingSeconds, 900);
  assert.equal(res.answerSdp.startsWith("v=0"), true);
  assert.equal(calls.started.length, 1);
  const instructions = calls.started[0].instructions;
  assert.match(instructions, /What is your plan \d+\?/);
  assert.match(instructions, /Never ask for a passport number/);
  assert.equal(openRow(USER).remote_id, "rtc_fake_1");
});

test("a second tab, a refresh or a reconnect can't open a second session", async () => {
  assert.equal((await sessions.startVoiceSession(USER, START)).ok, true);
  assert.deepEqual(await sessions.startVoiceSession(USER, START), { ok: false, reason: "active_elsewhere" });
  assert.equal(calls.started.length, 1);
});

test("6 minutes of talk leave 9; the call is hung up and its cost logged", async () => {
  const res = await sessions.startVoiceSession(USER, START);
  age(openRow(USER), 6, { lastSeen: 0 });
  const end = await sessions.endVoiceSession(USER, res.sessionId, { transcript: [], usage: null });
  assert.equal(end.ok, true);
  assert.ok(Math.abs(end.secondsUsed - 360) <= 2, `secondsUsed ${end.secondsUsed}`);
  assert.deepEqual(calls.hungUp, [{ model: "gpt-realtime-2.1-mini", remoteId: "rtc_fake_1" }]);
  const status = await sessions.getVoiceStatus(USER);
  assert.ok(Math.abs(status.remainingSeconds - 540) <= 2, `remaining ${status.remainingSeconds}`);
  const usage = db.tables.ai_usage.filter((u) => u.feature === "voice_session");
  assert.equal(usage.length, 1);
  assert.equal(usage[0].provider, "openai");
  // A new session gets only what is left this week
  const next = await sessions.startVoiceSession(USER, START);
  assert.ok(Math.abs(next.remainingSeconds - 540) <= 2);
});

test("a closed tab (no check-ins) is closed by the server and charged only up to its last check-in + 25 s", async () => {
  await sessions.startVoiceSession(USER, START);
  age(openRow(USER), 5, { lastSeen: 3 }); // started 5 min ago, last check-in 3 min ago
  const status = await sessions.getVoiceStatus(USER);
  assert.equal(status.active, null);
  const row = db.tables.voice_sessions[0];
  assert.equal(row.end_reason, "connection_lost");
  assert.ok(Math.abs(row.seconds_used - (120 + 25)) <= 2, `seconds_used ${row.seconds_used}`);
  assert.equal(calls.hungUp.length, 1);
});

test("at the deadline the check-in ends the session and hangs up; the time is capped", async () => {
  const res = await sessions.startVoiceSession(USER, START);
  age(openRow(USER), 16, { lastSeen: 0 }); // 15-minute deadline passed a minute ago
  const beat = await sessions.heartbeatVoiceSession(USER, res.sessionId);
  assert.equal(beat.ended, true);
  assert.equal(beat.reason, "time_up");
  assert.equal(db.tables.voice_sessions[0].seconds_used, 900);
  assert.equal(calls.hungUp.length, 1);
  // The week is used up: no new session until Monday
  assert.deepEqual(await sessions.startVoiceSession(USER, START), { ok: false, reason: "week_limit" });
});

test("check-ins keep a live session open and report the server's remaining time", async () => {
  const res = await sessions.startVoiceSession(USER, START);
  age(openRow(USER), 2, { lastSeen: 0 });
  const beat = await sessions.heartbeatVoiceSession(USER, res.sessionId);
  assert.equal(beat.ended, false);
  assert.ok(Math.abs(beat.remainingSeconds - 780) <= 2);
  // Someone else's session id can't be touched
  assert.deepEqual(await sessions.heartbeatVoiceSession(OTHER, res.sessionId), { ok: false, reason: "not_found" });
});

test("the monthly budget blocks a new session before any OpenAI call", async () => {
  db.tables.ai_settings[0].monthly_budget_usd = 0.5; // a full 15 min is planned at 0.08 $/min = 1.20 $
  assert.deepEqual(await sessions.startVoiceSession(USER, START), { ok: false, reason: "budget" });
  assert.equal(calls.started.length, 0);
});

test("the admin can switch voice off", async () => {
  db.tables.ai_settings[0].voice_enabled = false;
  assert.deepEqual(await sessions.startVoiceSession(USER, START), { ok: false, reason: "disabled" });
});

test("a provider failure closes the session at 0 seconds, so no time is lost", async () => {
  calls.failNextStart = true;
  assert.deepEqual(await sessions.startVoiceSession(USER, START), { ok: false, reason: "provider_error" });
  assert.equal(db.tables.voice_sessions[0].seconds_used, 0);
  assert.equal((await sessions.getVoiceStatus(USER)).remainingSeconds, 900);
});

test("the evaluation runs once, is stored, and its Claude cost is logged; the transcript is not stored", async () => {
  const res = await sessions.startVoiceSession(USER, START);
  const transcript = [
    { role: "officer", text: "Why are you travelling?" },
    { role: "applicant", text: "For tourism, two weeks in New York." },
    { role: "officer", text: "Who pays?" },
    { role: "applicant", text: "I do, from my salary and savings." },
  ];
  const first = await sessions.endVoiceSession(USER, res.sessionId, { transcript, usage: null });
  assert.equal(first.evaluation.overall, 72);
  const again = await sessions.endVoiceSession(USER, res.sessionId, { transcript, usage: null });
  assert.equal(again.evaluation.overall, 72);
  assert.equal(evals.count, 1);
  assert.equal(db.tables.ai_usage.filter((u) => u.feature === "voice_eval").length, 1);
  assert.equal(JSON.stringify(db.tables.voice_sessions).includes("New York"), false);
});

test("a too-short conversation gets no evaluation and no Claude call", async () => {
  const res = await sessions.startVoiceSession(USER, START);
  const end = await sessions.endVoiceSession(USER, res.sessionId, { transcript: [{ role: "applicant", text: "Hi" }], usage: null });
  assert.equal(end.evaluation, null);
  assert.equal(end.evaluationSkipped, "too_short");
  assert.equal(evals.count, 0);
});

test("the sweep endpoint's token check accepts only the stored token", async () => {
  assert.equal(await sessions.sweepTokenMatches(beta.adminDb(), "11111111-2222-3333-4444-555555555555"), true);
  assert.equal(await sessions.sweepTokenMatches(beta.adminDb(), "00000000-0000-0000-0000-000000000000"), false);
  assert.equal(await sessions.sweepTokenMatches(beta.adminDb(), null), false);
});

test("Claude: 20 requests a day, the 21st is refused and not counted", async () => {
  for (let i = 0; i < 20; i++) {
    const t = await beta.reserveClaude(USER, "kb_answer", "claude-opus-5-5");
    assert.equal(t.ok, true, `request ${i + 1}`);
    await beta.finishClaude(t, { model: "claude-opus-5-5", inputTokens: 1000, outputTokens: 100, costUsd: 0.006 });
  }
  assert.deepEqual(await beta.reserveClaude(USER, "doc_advice", "claude-opus-5-5"), { ok: false, reason: "daily_limit" });
  assert.equal(db.tables.ai_usage.length, 20);
});

test("Claude: outside the beta, over budget, or switched off — no request is made", async () => {
  assert.deepEqual(await beta.reserveClaude(OTHER, "kb_answer", "claude-opus-5-5"), { ok: false, reason: "not_beta" });
  db.tables.ai_usage.push({ id: 999, user_id: OTHER, provider: "openai", feature: "voice_session", model: "x", cost_usd: 5, created_at: new Date().toISOString() });
  assert.deepEqual(await beta.reserveClaude(USER, "kb_answer", "claude-opus-5-5"), { ok: false, reason: "budget" });
  db.tables.ai_usage.length = 0;
  db.tables.ai_settings[0].claude_enabled = false;
  assert.deepEqual(await beta.reserveClaude(USER, "kb_answer", "claude-opus-5-5"), { ok: false, reason: "disabled" });
});

test("a failed Claude call gives the request back", async () => {
  const t = await beta.reserveClaude(USER, "kb_answer", "claude-opus-5-5");
  await beta.cancelClaude(t);
  assert.equal(db.tables.ai_usage.length, 0);
});
