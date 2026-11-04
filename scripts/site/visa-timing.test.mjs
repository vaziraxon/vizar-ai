// Unit tests for the visa timing planner.
//
//   node --experimental-strip-types --test scripts/site/visa-timing.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, addMonths, buildIcs, foldLine, icsStamp, passportOk, reminderDates, timing } from "../../src/lib/site/visa-timing.ts";

test("months back and forward; a missing day becomes the month's last day", () => {
  assert.equal(addMonths("2026-09-01", -6), "2026-03-01");
  assert.equal(addMonths("2026-08-31", -6), "2026-02-28");
  assert.equal(addMonths("2028-08-31", -6), "2028-02-29");
  assert.equal(addMonths("2026-12-15", 3), "2027-03-15");
  assert.equal(addDays("2026-09-01", -15), "2026-08-17");
});

test("Schengen window: earliest six months before, recommended last day 15 days before", () => {
  const t = timing("schengen", "2026-09-01", "2026-04-01");
  assert.deepEqual(t, { earliest: "2026-03-01", latest: "2026-08-17", status: "open" });
});

test("before the window, after the recommended day, and after the trip", () => {
  assert.equal(timing("schengen", "2026-09-01", "2026-02-28").status, "early");
  assert.equal(timing("schengen", "2026-09-01", "2026-08-18").status, "late");
  assert.equal(timing("schengen", "2026-09-01", "2026-08-17").status, "open");
  assert.equal(timing("schengen", "2026-09-01", "2026-09-01").status, "past");
});

test("UK: earliest three months before, no latest date", () => {
  const t = timing("uk", "2026-09-01", "2026-08-20");
  assert.deepEqual(t, { earliest: "2026-06-01", latest: null, status: "open" });
  // Nothing is "late" for the UK: there is no recommended last day to pass
  assert.equal(timing("uk", "2026-09-01", "2026-08-31").status, "open");
});

test("nothing is returned until both dates are valid", () => {
  assert.equal(timing("schengen", "", "2026-04-01"), null);
  assert.equal(timing("schengen", "2026-09-01", ""), null);
});

test("passport: valid three months beyond the end of the visa period", () => {
  assert.equal(passportOk("2026-12-31", "2026-09-15"), true);
  assert.equal(passportOk("2026-12-01", "2026-09-15"), false);
  assert.equal(passportOk("2026-12-15", "2026-09-15"), true);
  assert.equal(passportOk("", "2026-09-15"), null);
});

test("reminders: only dates still ahead, in order", () => {
  assert.deepEqual(reminderDates("schengen", "2026-09-01", "2026-03-01"), [
    { kind: "opens", date: "2026-03-01" },
    { kind: "latest", date: "2026-08-17" },
  ]);
  assert.deepEqual(reminderDates("schengen", "2026-09-01", "2026-06-01"), [{ kind: "latest", date: "2026-08-17" }]);
  assert.deepEqual(reminderDates("schengen", "2026-09-01", "2026-08-20"), []);
  assert.deepEqual(reminderDates("uk", "2026-09-01", "2026-06-01"), [{ kind: "opens", date: "2026-06-01" }]);
});

test("calendar file: all-day events, CRLF lines, escaped text", () => {
  const ics = buildIcs(
    [{ uid: "schengen-opens-2026-09-01", date: "2026-03-01", summary: "Shengen: ariza, muddat; 6 oy", description: "Line one\nTwo" }],
    "20260304T090000Z"
  );
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20260301\r\n"));
  assert.ok(ics.includes("DTEND;VALUE=DATE:20260302\r\n"));
  assert.ok(ics.includes("UID:schengen-opens-2026-09-01@vizarai.com\r\n"));
  assert.ok(ics.includes("SUMMARY:Shengen: ariza\\, muddat\\; 6 oy\r\n"));
  assert.ok(ics.includes("DESCRIPTION:Line one\\nTwo\r\n"));
  assert.equal(ics.replace(/\r\n/g, "").includes("\n"), false, "no bare line feeds");
});

test("long lines are folded at 75 octets, including multi-byte letters", () => {
  const long = "Ariza topshirish mumkin bo‘ladi — " + "ʻʼ’".repeat(40);
  for (const line of foldLine(long).split("\r\n")) {
    assert.ok(new TextEncoder().encode(line).length <= 75, `${line.length} chars too long`);
  }
  // Folding loses nothing: removing the continuation spaces gives the original
  assert.equal(foldLine(long).replace(/\r\n /g, ""), long);
});

test("timestamp format", () => {
  assert.equal(icsStamp(new Date("2026-11-04T09:30:15.123Z")), "20261104T093015Z");
});
