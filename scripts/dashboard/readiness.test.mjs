// Unit tests for the readiness score.
//
//   node --experimental-strip-types --test scripts/dashboard/readiness.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeReadiness, filledSlots, readinessLevel } from "../../src/lib/dashboard/readiness.ts";

const nothing = {
  hasApplication: false,
  assessmentDone: false,
  docsUploaded: 0,
  docsTotal: 7,
  checklistDone: 0,
  checklistTotal: 12,
  interviewScores: [],
};
const everything = {
  hasApplication: true,
  assessmentDone: true,
  docsUploaded: 7,
  docsTotal: 7,
  checklistDone: 12,
  checklistTotal: 12,
  interviewScores: [80, 75, 90],
};

test("a new user scores 0 and an empty checklist doesn't divide by zero", () => {
  assert.equal(computeReadiness(nothing).score, 0);
  assert.equal(computeReadiness({ ...nothing, docsTotal: 0, checklistTotal: 0 }).score, 0);
});

test("everything done scores 100 with no steps left", () => {
  const { score, steps } = computeReadiness(everything);
  assert.equal(score, 100);
  assert.deepEqual(steps, []);
});

test("the weights add up to 100", () => {
  assert.equal(computeReadiness(nothing).parts.reduce((sum, p) => sum + p.weight, 0), 100);
});

test("each part counts on its own", () => {
  assert.equal(computeReadiness({ ...nothing, assessmentDone: true }).score, 15);
  assert.equal(computeReadiness({ ...nothing, docsUploaded: 7 }).score, 40);
  assert.equal(computeReadiness({ ...nothing, checklistDone: 6 }).score, 13);
});

test("one good practice isn't full marks; three at the target are", () => {
  const part = (scores) => computeReadiness({ ...nothing, interviewScores: scores }).parts.find((p) => p.key === "interview");
  assert.equal(part([90]).points, 9);
  assert.equal(part([70, 70, 70]).points, 20);
  assert.equal(part([100, 100, 100]).points, 20);
  assert.equal(part([40, 40, 40]).gain, 9);
});

test("only the newest three practices count", () => {
  const recent = computeReadiness({ ...nothing, interviewScores: [80, 80, 80, 0, 0] });
  assert.equal(recent.parts.find((p) => p.key === "interview").points, 20);
});

test("more documents than slots can't pass 100%", () => {
  const { parts } = computeReadiness({ ...nothing, docsUploaded: 12 });
  const documents = parts.find((p) => p.key === "documents");
  assert.equal(documents.percent, 100);
  assert.equal(documents.detail.vars.done, 7);
});

test("steps: assessment first without an application, biggest gain first with one", () => {
  assert.equal(computeReadiness(nothing).steps[0].key, "assessment");
  const withApp = computeReadiness({ ...nothing, hasApplication: true });
  assert.deepEqual(withApp.steps.map((s) => s.key), ["documents", "checklist", "interview", "assessment"]);
});

test("a nearly finished part still offers at least 1 point", () => {
  const { steps } = computeReadiness({ ...everything, checklistDone: 1000, checklistTotal: 1001 });
  assert.deepEqual(steps.map((s) => [s.key, s.gain]), [["checklist", 1]]);
});

test("filledSlots ignores repeats and documents outside the slots", () => {
  assert.deepEqual(filledSlots(["Passport", "Passport", "Qo'shimcha hujjatlar"], ["Passport", "Sug'urta"]), ["Passport"]);
});

test("readinessLevel boundaries", () => {
  assert.equal(readinessLevel(0), "Hali baholanmagan");
  assert.equal(readinessLevel(1), "Endi boshlanmoqda");
  assert.equal(readinessLevel(25), "Davom eting");
  assert.equal(readinessLevel(60), "Yaxshi ketyapsiz");
  assert.equal(readinessLevel(90), "Deyarli tayyor");
});

test("uploads closed: the documents part comes from the readiness test, not from uploads", () => {
  const closed = { ...nothing, uploadsOpen: false, docsUploaded: 7 };
  // No test yet: uploads are ignored and nothing is earned
  const none = computeReadiness({ ...closed, docTest: { points: 0, answered: 0, total: 10 } });
  assert.equal(none.score, 0);
  const docs = none.parts.find((p) => p.key === "documents");
  assert.equal(docs.href, "/dashboard/documents/check");
  assert.equal(docs.action, "Hujjat tayyorgarligi testini to'ldiring");
  // Half the weighted points: 20 of the 40
  const half = computeReadiness({ ...closed, docTest: { points: 5, answered: 10, total: 10 } });
  assert.equal(half.parts.find((p) => p.key === "documents").points, 20);
  assert.equal(half.score, 20);
  // Everything ready: the full 40
  assert.equal(computeReadiness({ ...closed, docTest: { points: 10, answered: 10, total: 10 } }).score, 40);
});

test("uploads open: the test is ignored and uploads count as before", () => {
  const open = computeReadiness({ ...nothing, uploadsOpen: true, docsUploaded: 7, docTest: { points: 0, answered: 0, total: 10 } });
  assert.equal(open.score, 40);
  assert.equal(open.parts.find((p) => p.key === "documents").href, "/dashboard/documents");
});
