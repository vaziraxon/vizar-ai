// Unit tests for the Schengen 90/180 calculator.
//
//   node --experimental-strip-types --test scripts/site/schengen.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkStays, longestStayFrom, toDay } from "../../src/lib/site/schengen.ts";

// 1 Jan – 31 Mar 2025 is exactly 90 days (31 + 28 + 31).
const fullQuarter = [{ entry: "2025-01-01", exit: "2025-03-31" }];

test("entry and exit days both count", () => {
  assert.equal(checkStays([{ entry: "2025-05-10", exit: "2025-05-10" }], "2025-05-10").used, 1);
  assert.equal(checkStays([{ entry: "2025-05-10", exit: "2025-05-19" }], "2025-05-19").used, 10);
});

test("90 days is allowed, the 91st is an overstay", () => {
  const ok = checkStays(fullQuarter, "2025-03-31");
  assert.deepEqual([ok.used, ok.left, ok.overstay], [90, 0, null]);
  const over = checkStays([{ entry: "2025-01-01", exit: "2025-04-01" }], "2025-04-01");
  assert.deepEqual(over.overstay, { date: "2025-04-01", used: 91 });
});

test("the 180-day period rolls: the first day drops out on day 181", () => {
  // 29 Jun is 1 Jan + 179 days, so 1 Jan is still inside; on 30 Jun it is not.
  assert.equal(checkStays(fullQuarter, "2025-06-29").used, 90);
  const later = checkStays(fullQuarter, "2025-06-30");
  assert.deepEqual([later.used, later.left, later.periodStart], [89, 1, "2025-01-02"]);
});

test("overlapping or repeated trips count each day once", () => {
  const stays = [
    { entry: "2025-05-01", exit: "2025-05-10" },
    { entry: "2025-05-05", exit: "2025-05-12" },
    { entry: "2025-05-01", exit: "2025-05-10" },
  ];
  assert.equal(checkStays(stays, "2025-05-31").used, 12);
});

test("invalid, reversed and empty trips are ignored", () => {
  const stays = [
    { entry: "2025-05-10", exit: "2025-05-01" },
    { entry: "", exit: "" },
    { entry: "2025-02-30", exit: "2025-03-02" },
    { entry: "2025-05-01", exit: "2025-05-03" },
  ];
  assert.equal(checkStays(stays, "2025-05-31").used, 3);
  assert.equal(toDay("2025-02-30"), null);
  assert.equal(checkStays(stays, "not a date"), null);
});

test("right after 90 days you can't enter at all", () => {
  assert.deepEqual(longestStayFrom(fullQuarter, "2025-04-01"), { days: 0, lastDay: null });
});

test("once days start dropping out, a new stay can run to the 90-day cap", () => {
  // From 30 Jun one old day leaves the period for each new day spent.
  assert.deepEqual(longestStayFrom(fullQuarter, "2025-06-30"), { days: 90, lastDay: "2025-09-27" });
});

test("a later planned trip limits how long you can stay now", () => {
  const stays = [{ entry: "2025-08-01", exit: "2025-09-29" }]; // 60 days
  const plan = longestStayFrom(stays, "2025-06-01");
  assert.equal(plan.days, 30);
  assert.equal(plan.lastDay, "2025-06-30");
});

test("with no trips, a stay is capped at 90 days", () => {
  assert.deepEqual(longestStayFrom([], "2026-01-10"), { days: 90, lastDay: "2026-04-09" });
});
