// Unit tests for the visa assessment's rule-based findings.
//
//   node --experimental-strip-types --test scripts/dashboard/assessment-review.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { reviewAssessment } from "../../src/lib/dashboard/assessment-review.ts";

const today = new Date("2026-11-02T09:00:00Z");
const answers = {
  country: "Germaniya",
  visaType: "Turistik",
  travelDate: "2027-01-15",
  visitedBefore: "Yo'q",
  income: "8 000 000 so'm",
  bankBalance: "25 000 000 so'm",
  sponsor: "Yo'q",
  previouslyRefused: "Yo'q",
  docsStatus: { Passport: "Tayyor", "Bank statement": "Jarayonda", Taklifnoma: "" },
};
const ids = (findings) => findings.map((f) => f.id);
const find = (findings, id) => findings.find((f) => f.id === id);

test("a typical answer set: things to do first, then what is in place", () => {
  const findings = reviewAssessment(answers, today);
  assert.deepEqual(ids(findings), ["documents", "funds", "interview", "date"]);
  assert.equal(find(findings, "date").tone, "good");
  assert.equal(find(findings, "date").vars.n, 74);
});

test("unmarked and in-progress documents both count as not ready", () => {
  const docs = find(reviewAssessment(answers, today), "documents");
  assert.equal(docs.vars.n, 2);
  assert.deepEqual(docs.items, ["Bank statement", "Taklifnoma"]);
});

test("all documents ready is good news, with a link to upload them", () => {
  const docs = find(reviewAssessment({ ...answers, docsStatus: { Passport: "Tayyor" } }, today), "documents");
  assert.equal(docs.tone, "good");
  assert.equal(docs.href, "/dashboard/documents");
});

test("travel dates: soon, today and past", () => {
  assert.equal(find(reviewAssessment({ ...answers, travelDate: "2026-11-20" }, today), "date").title, "Safargacha {n} kun qoldi");
  assert.equal(find(reviewAssessment({ ...answers, travelDate: "2026-11-02" }, today), "date").vars.n, 0);
  assert.equal(find(reviewAssessment({ ...answers, travelDate: "2026-10-01" }, today), "date").title, "Safar sanasi o'tib ketgan");
  assert.equal(find(reviewAssessment({ ...answers, travelDate: "" }, today), "date"), undefined);
  assert.equal(find(reviewAssessment({ ...answers, travelDate: "15.01.2027" }, today), "date"), undefined);
});

test("a previous refusal, a sponsor and an earlier visit each add their own finding", () => {
  const findings = reviewAssessment({ ...answers, previouslyRefused: "Ha", sponsor: "Ha", visitedBefore: "Ha" }, today);
  assert.equal(find(findings, "refusal").href, "/dashboard/rejection-analysis");
  assert.equal(find(findings, "sponsor").tone, "todo");
  assert.equal(find(findings, "visited").tone, "good");
});

test("every to-do has a task and a priority for the recommendations list; good news has neither", () => {
  const findings = reviewAssessment({ ...answers, previouslyRefused: "Ha", sponsor: "Ha", visitedBefore: "Ha", travelDate: "2026-11-10" }, today);
  for (const f of findings) {
    if (f.tone === "todo") assert.ok(f.task && f.priority, f.id);
    else assert.equal(f.task, undefined, f.id);
  }
});

test("the user's own figures are passed through as written", () => {
  assert.deepEqual(find(reviewAssessment(answers, today), "funds").vars, { income: "8 000 000 so'm", balance: "25 000 000 so'm" });
});

test("missing or odd answers don't throw", () => {
  assert.deepEqual(ids(reviewAssessment({}, today)), ["interview"]);
  assert.deepEqual(ids(reviewAssessment({ docsStatus: null, travelDate: 5, income: 7 }, today)), ["interview"]);
});
