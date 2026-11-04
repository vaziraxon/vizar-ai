/**
 * When to apply for a visa: the earliest day an application can be lodged,
 * the last day the rules recommend, whether the passport is valid enough
 * (Schengen), and calendar reminders as an .ics file. Date-only maths in
 * UTC, so results never depend on the visitor's time zone. No AI.
 *
 * Rules (checked 2026-11-04):
 * - Schengen: EU Visa Code, Art. 9 — lodged no more than 6 months before the
 *   visit; "as a rule" no later than 15 calendar days before it. Passport
 *   issued in the last 10 years, at least 2 blank pages, valid 3 months after
 *   the requested visa period (German embassy in Tashkent).
 * - UK: GOV.UK — "The earliest you can apply is 3 months before you travel."
 *   No latest date is given.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */

export type TimingCountry = "schengen" | "uk";
export type TimingStatus = "early" | "open" | "late" | "past";
export type ReminderKind = "opens" | "latest";

export interface TimingRules {
  earliestMonthsBefore: number;
  /** null when the official page gives no latest date */
  latestDaysBefore: number | null;
}

export const TIMING_RULES: Record<TimingCountry, TimingRules> = {
  schengen: { earliestMonthsBefore: 6, latestDaysBefore: 15 },
  uk: { earliestMonthsBefore: 3, latestDaysBefore: null },
};

const DAY_MS = 86_400_000;
const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const utc = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
};
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function addDays(day: string, n: number) {
  return iso(utc(day) + n * DAY_MS);
}

/** Calendar months, moved back or forward. A day missing from the target month becomes its last day: 31 Aug − 6 months = 28 Feb. */
export function addMonths(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  const first = new Date(Date.UTC(y!, m! - 1 + n, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return iso(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(d!, lastDay)));
}

export interface TimingResult {
  earliest: string;
  latest: string | null;
  status: TimingStatus;
}

/** Where `today` falls against the window for a trip starting on `start`. Null until both dates are valid. */
export function timing(country: TimingCountry, start: string, today: string): TimingResult | null {
  if (!isIso(start) || !isIso(today)) return null;
  const rules = TIMING_RULES[country];
  const earliest = addMonths(start, -rules.earliestMonthsBefore);
  const latest = rules.latestDaysBefore === null ? null : addDays(start, -rules.latestDaysBefore);
  const status: TimingStatus =
    today < earliest ? "early" : today >= start ? "past" : latest && today > latest ? "late" : "open";
  return { earliest, latest, status };
}

/** Schengen: the passport must still be valid 3 months after the requested visa period ends. */
export function passportOk(expiry: string, tripEnd: string): boolean | null {
  if (!isIso(expiry) || !isIso(tripEnd)) return null;
  return expiry >= addMonths(tripEnd, 3);
}

/** The reminder dates that are still ahead of `today`, in date order. */
export function reminderDates(country: TimingCountry, start: string, today: string): { kind: ReminderKind; date: string }[] {
  const t = timing(country, start, today);
  if (!t) return [];
  const all: { kind: ReminderKind; date: string }[] = [{ kind: "opens", date: t.earliest }];
  if (t.latest) all.push({ kind: "latest", date: t.latest });
  return all.filter((r) => r.date >= today);
}

export interface IcsEvent {
  uid: string;
  /** YYYY-MM-DD; the event is a whole day */
  date: string;
  summary: string;
  description: string;
}

const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 folding: no line longer than 75 octets; continuation lines start with a space. */
export function foldLine(line: string) {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let octets = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (octets + size > 75) {
      out.push(current);
      current = " " + ch;
      octets = 1 + size;
    } else {
      current += ch;
      octets += size;
    }
  }
  out.push(current);
  return out.join("\r\n");
}

/** A calendar file with one all-day event per item. `stamp` is the UTC time of creation: YYYYMMDDTHHMMSSZ. */
export function buildIcs(events: IcsEvent[], stamp: string) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VIZAR AI//Visa timing//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    const day = e.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@vizarai.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${iso(utc(e.date) + DAY_MS).replace(/-/g, "")}`,
      `SUMMARY:${escape(e.summary)}`,
      `DESCRIPTION:${escape(e.description)}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** YYYYMMDDTHHMMSSZ from a Date */
export const icsStamp = (now: Date) => now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
