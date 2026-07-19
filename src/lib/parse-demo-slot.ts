const UZ_MONTHS: Record<string, number> = {
  yanvar: 0,
  fevral: 1,
  mart: 2,
  aprel: 3,
  may: 4,
  iyun: 5,
  iyul: 6,
  avgust: 7,
  sentabr: 8,
  oktabr: 9,
  noyabr: 10,
  dekabr: 11,
};

/**
 * Parses demo strings like "24-iyul" + "14:00" into a real future
 * ISO datetime, since the demo specialist data (src/data/mockData.ts)
 * only has day-of-month + Uzbek month name, no year. Rolls forward to
 * next year if the resulting date would otherwise be in the past, so
 * the booking always satisfies the "no past dates" validation.
 */
export function parseDemoSlotToIso(dateLabel: string, timeLabel: string): string | null {
  const match = dateLabel.match(/^(\d{1,2})-([a-zA-Z']+)$/);
  if (!match) return null;
  const day = Number(match[1]);
  const monthKey = match[2].toLowerCase();
  const month = UZ_MONTHS[monthKey];
  if (month === undefined) return null;

  const [hh, mm] = timeLabel.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const now = new Date();
  let year = now.getFullYear();
  let candidate = new Date(year, month, day, hh, mm);
  if (candidate.getTime() <= now.getTime()) {
    year += 1;
    candidate = new Date(year, month, day, hh, mm);
  }
  return candidate.toISOString();
}
