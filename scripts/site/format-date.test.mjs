import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatNumber, formatTime } from "../../src/lib/i18n/format-date.ts";

const at = "2026-11-07T10:00:00Z"; // a Saturday

test("Uzbek dates use real month names, never the browser's 'M11' fallback", () => {
  assert.equal(formatDate(at, "uz"), "7-noyabr, 2026");
  assert.equal(formatDate(at, "uz", "medium"), "7-noy, 2026");
  assert.equal(formatDate(at, "uz", "dayMonth"), "7-noyabr");
  assert.equal(formatDate(at, "uz", "dayMonthShort"), "7-noy");
  assert.equal(formatDate(at, "uz", "weekdayDayMonth"), "Shan, 7-noyabr");
  for (const style of ["long", "medium", "dayMonth", "dayMonthShort", "weekdayDayMonth"]) {
    assert.doesNotMatch(formatDate(at, "uz", style), /M\d/);
  }
});

test("every month has its Uzbek name", () => {
  const names = Array.from({ length: 12 }, (_, m) => formatDate(new Date(Date.UTC(2026, m, 15, 6)), "uz", "dayMonth"));
  assert.deepEqual(names, [
    "15-yanvar", "15-fevral", "15-mart", "15-aprel", "15-may", "15-iyun",
    "15-iyul", "15-avgust", "15-sentabr", "15-oktabr", "15-noyabr", "15-dekabr",
  ]);
});

test("timestamps are shown in Tashkent time, so server and browser agree", () => {
  // 20:30 UTC on 7 Nov is already 8 Nov in Tashkent (UTC+5)
  assert.equal(formatDate("2026-11-07T20:30:00Z", "uz"), "8-noyabr, 2026");
  assert.equal(formatDate("2026-11-07T20:30:00Z", "uz", "long", "UTC"), "7-noyabr, 2026");
});

test("Russian and English go through Intl", () => {
  assert.match(formatDate(at, "ru"), /7 ноября 2026/);
  assert.equal(formatDate(at, "en"), "7 November 2026");
  assert.equal(formatDate(at, "en", "dayMonthShort"), "7 Nov");
});

test("a bad date gives an empty string instead of 'Invalid Date'", () => {
  assert.equal(formatDate("not a date", "uz"), "");
  assert.equal(formatDate("", "en"), "");
});

test("numbers group digits with no-break spaces, never Chrome's commas", () => {
  assert.equal(formatNumber(1234567), "1 234 567");
  assert.equal(formatNumber(1234567), (1234567).toLocaleString("uz-UZ")); // what Node renders on the server
  assert.equal(formatNumber(999), "999");
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(-12500), "-12 500");
  assert.equal(formatNumber(NaN), "");
});

test("times are 24-hour, Tashkent by default", () => {
  assert.equal(formatTime("2026-11-07T10:00:00Z"), "15:00");
  assert.equal(formatTime("2026-11-07T10:00:00Z", "UTC"), "10:00");
  assert.equal(formatTime("bad"), "");
});
