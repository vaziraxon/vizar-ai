/**
 * The Schengen short-stay rule: at most 90 days in any 180-day period. Any part
 * of a day in the area counts, so entry and exit days both count. For a day D
 * the period is D and the 179 days before it (the method of the European
 * Commission's short-stay calculator).
 *
 * Days are whole UTC day numbers, so time zones and daylight saving can't shift
 * a count. Dependency-free so it can be unit-tested with plain Node.
 */
export const MAX_DAYS = 90;
export const PERIOD = 180;
/** Enough for anyone's history; keeps the page from building huge day sets. */
export const MAX_STAYS = 30;

export interface Stay {
  entry: string;
  exit: string;
}

const DAY_MS = 86_400_000;

/** "2026-11-02" → day number, or null for anything that isn't a real date. */
export function toDay(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== iso) return null;
  return Math.round(ms / DAY_MS);
}

export const fromDay = (day: number) => new Date(day * DAY_MS).toISOString().slice(0, 10);

/** A stay whose dates are missing, invalid or reversed is left out. */
export const isValidStay = (stay: Stay) => {
  const entry = toDay(stay.entry);
  const exit = toDay(stay.exit);
  return entry !== null && exit !== null && exit >= entry && exit - entry < 3 * 365;
};

function daysIn(stays: Stay[]): Set<number> {
  const days = new Set<number>();
  for (const stay of stays.slice(0, MAX_STAYS)) {
    if (!isValidStay(stay)) continue;
    for (let d = toDay(stay.entry)!; d <= toDay(stay.exit)!; d++) days.add(d);
  }
  return days;
}

function usedOn(days: Set<number>, day: number) {
  let used = 0;
  for (let d = day - PERIOD + 1; d <= day; d++) if (days.has(d)) used++;
  return used;
}

function firstOverstay(days: Set<number>) {
  for (const day of [...days].sort((a, b) => a - b)) {
    const used = usedOn(days, day);
    if (used > MAX_DAYS) return { date: fromDay(day), used };
  }
  return null;
}

/**
 * Days used in the 180 days ending on `on`, what is left, and the first day (if
 * any) of all the stays that broke the rule.
 */
export function checkStays(stays: Stay[], on: string) {
  const day = toDay(on);
  if (day === null) return null;
  const days = daysIn(stays);
  const used = usedOn(days, day);
  return {
    used,
    left: Math.max(0, MAX_DAYS - used),
    periodStart: fromDay(day - PERIOD + 1),
    periodEnd: on,
    overstay: firstOverstay(days),
  };
}

/**
 * The longest stay starting on `entry` that keeps every day, including stays
 * already planned later, within the rule. 0 means entering that day is too many.
 */
export function longestStayFrom(stays: Stay[], entry: string) {
  const start = toDay(entry);
  if (start === null) return null;
  const base = daysIn(stays);
  let best = 0;
  // Adding days only ever raises counts, so stop at the first length that fails.
  for (let length = 1; length <= MAX_DAYS; length++) {
    const days = new Set(base);
    for (let d = start; d < start + length; d++) days.add(d);
    const affected = [...days].filter((d) => d >= start && d < start + length + PERIOD - 1);
    if (affected.some((d) => usedOn(days, d) > MAX_DAYS)) break;
    best = length;
  }
  return { days: best, lastDay: best ? fromDay(start + best - 1) : null };
}
