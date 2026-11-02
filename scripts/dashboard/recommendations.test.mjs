// Unit tests for recommendation ordering and status steps.
//
//   node --experimental-strip-types --test scripts/dashboard/recommendations.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { NEXT_STATUS, openFirst } from "../../src/lib/dashboard/recommendations.ts";
import { TASK_HREF, reviewAssessment } from "../../src/lib/dashboard/assessment-review.ts";

const rec = (id, status, priority, created_at) => ({ id, status, priority, created_at });

test("open before done, then Muhim first, then newest", () => {
  const sorted = openFirst([
    rec("old-mid", "not_started", "O'rtacha", "2026-11-01"),
    rec("done", "done", "Muhim", "2026-11-03"),
    rec("new-mid", "in_progress", "O'rtacha", "2026-11-02"),
    rec("urgent", "not_started", "Muhim", "2026-10-01"),
    rec("none", "not_started", null, "2026-11-04"),
  ]);
  assert.deepEqual(sorted.map((r) => r.id), ["urgent", "none", "new-mid", "old-mid", "done"]);
});

test("openFirst doesn't reorder the caller's array", () => {
  const items = [rec("a", "done", null, "1"), rec("b", "not_started", null, "2")];
  openFirst(items);
  assert.equal(items[0].id, "a");
});

test("status goes round in three clicks", () => {
  assert.equal(NEXT_STATUS[NEXT_STATUS[NEXT_STATUS.not_started]], "not_started");
});

test("every task the assessment can save has an answer for where it leads", () => {
  const all = reviewAssessment(
    { travelDate: "2026-11-05", docsStatus: { Passport: "" }, previouslyRefused: "Ha", sponsor: "Ha", income: "1", country: "AQSH" },
    new Date("2026-11-02T00:00:00Z")
  );
  const tasks = all.map((f) => f.task).filter(Boolean);
  assert.equal(tasks.length, 6);
  // Booking an appointment and gathering sponsor papers happen outside the app.
  const linked = tasks.filter((t) => TASK_HREF[t]);
  assert.deepEqual(tasks.filter((t) => !TASK_HREF[t]), ["Qabul kunini band qiling", "Homiy hujjatlarini tayyorlang"]);
  for (const t of linked) assert.match(TASK_HREF[t], /^\//);
});
