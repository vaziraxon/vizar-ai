/**
 * Beta limits, all counted on the server in Asia/Tashkent time (UTC+5 all
 * year, no daylight saving):
 *   Claude written adviser — 20 requests a day, new day at 00:00
 *   Voice interview — 15 minutes a week, new week Monday 00:00, nothing
 *   carries over. Wall-clock time counts (silence and waiting included).
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */

export const CLAUDE_DAILY_LIMIT = 20;
export const VOICE_WEEKLY_SECONDS = 15 * 60;
/** A session needs at least this much left to start */
export const VOICE_MIN_START_SECONDS = 30;
/** The browser checks in every 10 s; after this long without one the session is treated as gone */
export const VOICE_HEARTBEAT_GRACE_MS = 25_000;

const OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 00:00 Tashkent time of the day `now` falls on */
export function tashkentDayStart(now: Date): Date {
  const local = now.getTime() + OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS - OFFSET_MS);
}

/** Monday 00:00 Tashkent time of the week `now` falls in */
export function tashkentWeekStart(now: Date): Date {
  const day = tashkentDayStart(now);
  const dow = new Date(day.getTime() + OFFSET_MS).getUTCDay(); // 0 = Sunday
  const sinceMonday = (dow + 6) % 7;
  return new Date(day.getTime() - sinceMonday * DAY_MS);
}

/** The next Monday 00:00 Tashkent time: when the weekly minutes reset */
export function tashkentNextWeekStart(now: Date): Date {
  return new Date(tashkentWeekStart(now).getTime() + 7 * DAY_MS);
}

/** The 1st of the month 00:00 Tashkent time: the monthly budget period */
export function tashkentMonthStart(now: Date): Date {
  const local = new Date(now.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - OFFSET_MS);
}

export interface SessionTimes {
  started_at: string;
  deadline_at: string;
  last_seen_at: string;
  ended_at: string | null;
  seconds_used: number | null;
}

const secondsBetween = (a: number, b: number) => Math.max(0, Math.round((b - a) / 1000));

/** Seconds a session takes from the week: final when ended, running (capped at its deadline) while open */
export function chargedSeconds(s: SessionTimes, now: Date): number {
  if (s.ended_at) return s.seconds_used ?? secondsBetween(Date.parse(s.started_at), Date.parse(s.ended_at));
  const end = Math.min(now.getTime(), Date.parse(s.deadline_at));
  return secondsBetween(Date.parse(s.started_at), end);
}

/** Seconds left this week; sessions count towards the week they started in */
export function remainingVoiceSeconds(sessions: SessionTimes[], now: Date): number {
  const weekStart = tashkentWeekStart(now).getTime();
  const used = sessions
    .filter((s) => Date.parse(s.started_at) >= weekStart)
    .reduce((sum, s) => sum + chargedSeconds(s, now), 0);
  return Math.max(0, VOICE_WEEKLY_SECONDS - used);
}

/** An open session the browser stopped checking in for, or one past its deadline */
export function isStale(s: SessionTimes, now: Date): boolean {
  if (s.ended_at) return false;
  return now.getTime() >= Date.parse(s.deadline_at) || now.getTime() - Date.parse(s.last_seen_at) > VOICE_HEARTBEAT_GRACE_MS;
}

/**
 * When an open session is closed by the server: now, but never past its
 * deadline, and for a browser that went silent no later than its last
 * check-in plus the grace period.
 */
export function closingTime(s: SessionTimes, now: Date): Date {
  const lastSeenLimit = Date.parse(s.last_seen_at) + VOICE_HEARTBEAT_GRACE_MS;
  const end = Math.min(now.getTime(), Date.parse(s.deadline_at), lastSeenLimit);
  return new Date(Math.max(end, Date.parse(s.started_at)));
}
