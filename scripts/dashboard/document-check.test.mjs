import { test } from "node:test";
import assert from "node:assert/strict";
import { answersAfterTick, buildAiPayload, cleanAnswers, scoreAnswers, syncChecklistDone, WEIGHTS } from "../../src/lib/document-check/score.ts";

const items = [
  { id: "passport", title: "Amaldagi pasport" },
  { id: "photo", title: "Fotosurat" },
  { id: "bank", title: "Bank ko'chirmasi" },
  { id: "hotel", title: "Mehmonxona broni" },
];

test("counts and the weighted readiness percent come only from the answers", () => {
  const r = scoreAnswers(items, { passport: "ready", photo: "partial", bank: "preparing", hotel: "missing" });
  assert.deepEqual(r.counts, { ready: 1, partial: 1, preparing: 1, missing: 1 });
  assert.equal(r.complete, true);
  // (1 + 0.5 + 0.25 + 0) / 4 = 43.75 %
  assert.equal(r.percent, 44);
  assert.equal(WEIGHTS.ready + WEIGHTS.missing, 1);
});

test("all ready is 100 %, none ready is 0 %", () => {
  assert.equal(scoreAnswers(items, Object.fromEntries(items.map((i) => [i.id, "ready"]))).percent, 100);
  assert.equal(scoreAnswers(items, Object.fromEntries(items.map((i) => [i.id, "missing"]))).percent, 0);
});

test("the result is complete only when every document has an answer", () => {
  const r = scoreAnswers(items, { passport: "ready", photo: "ready" });
  assert.equal(r.complete, false);
  assert.equal(r.answered, 2);
  assert.equal(scoreAnswers([], {}).complete, false);
});

test("one answer per document: unknown values and documents are ignored", () => {
  const r = scoreAnswers(items, { passport: "ready", photo: "maybe", other: "ready", bank: ["ready", "missing"] });
  assert.equal(r.answered, 1);
  assert.deepEqual(cleanAnswers(items, { passport: "ready", photo: "maybe", other: "ready" }), { passport: "ready" });
});

test("priorities: missing first, then problems, then in progress; ready never listed", () => {
  const r = scoreAnswers(items, { passport: "preparing", photo: "missing", bank: "partial", hotel: "ready" });
  assert.deepEqual(r.priorities.map((p) => [p.item.id, p.answer]), [["photo", "missing"], ["bank", "partial"], ["passport", "preparing"]]);
});

test("the AI payload carries only the allowed fields", () => {
  const payload = buildAiPayload({
    destination: "Kanada",
    visaType: "Turistik viza",
    items: [{ id: "passport", title: "Amaldagi pasport", note: "AA1234567 secret note" }, ...items.slice(1)],
    answers: { passport: "ready", photo: "missing", passportNumber: "AA1234567", jshshir: "12345678901234" },
    bookRules: [{ topic: "Murojaat yo'li", text: "VFS orqali", verified: false, url: "https://x.example/?id=1", extra: "x" }],
  });
  assert.deepEqual(Object.keys(payload).sort(), ["bookRequirements", "destination", "documents", "visaType"]);
  assert.deepEqual(payload.documents, [
    { name: "Amaldagi pasport", answer: "ready" },
    { name: "Fotosurat", answer: "missing" },
  ]);
  for (const d of payload.documents) assert.deepEqual(Object.keys(d).sort(), ["answer", "name"]);
  assert.deepEqual(Object.keys(payload.bookRequirements[0]).sort(), ["text", "topic", "verified"]);
  const text = JSON.stringify(payload);
  assert.doesNotMatch(text, /AA1234567|12345678901234|secret|x\.example/);
});

test("a finished test ticks ready items in the checklist and unticks the rest", () => {
  const done = ["passport", "photo", "custom-1"];
  const answers = { passport: "partial", bank: "ready", insurance: "missing", junk: "nope" };
  const next = syncChecklistDone(done, answers);
  assert.deepEqual(new Set(next), new Set(["photo", "custom-1", "bank"]));
});

test("ticking the checklist mirrors back into the test answers", () => {
  assert.deepEqual(answersAfterTick({}, "bank", true), { bank: "ready" });
  assert.deepEqual(answersAfterTick({ bank: "ready", photo: "partial" }, "bank", false), { photo: "partial" });
  // Unticking leaves a non-ready answer alone
  assert.deepEqual(answersAfterTick({ photo: "partial" }, "photo", false), { photo: "partial" });
});
