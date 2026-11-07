/**
 * Dates in the active language. Chrome ships no Uzbek month names, so
 * toLocaleDateString("uz-UZ") gives "2026 M11 7" in the browser while Node on
 * the server gives "7-noyabr, 2026" — ugly, and a hydration mismatch. Uzbek is
 * therefore built here from the CLDR names; Russian and English use Intl.
 *
 * Timestamps are shown in Tashkent time by default, so the server and every
 * browser produce the same text. Pass `null` for dates that are already in the
 * viewer's local time (e.g. a date typed into a form).
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */

export type DateLang = "uz" | "ru" | "en";
export type DateStyle = "long" | "medium" | "dayMonth" | "dayMonthShort" | "weekdayDayMonth";

export const TASHKENT = "Asia/Tashkent";

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const UZ_WEEKDAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LOCALE: Record<Exclude<DateLang, "uz">, string> = { ru: "ru-RU", en: "en-GB" };

const OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { day: "numeric", month: "long", year: "numeric" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  dayMonth: { day: "numeric", month: "long" },
  dayMonthShort: { day: "numeric", month: "short" },
  weekdayDayMonth: { weekday: "short", day: "numeric", month: "long" },
};

/** "7-noyabr, 2026" · "7 ноября 2026 г." · "7 November 2026" (style "long") */
export function formatDate(date: Date | string, lang: DateLang, style: DateStyle = "long", timeZone: string | null = TASHKENT): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const zone = timeZone ?? undefined;

  if (lang !== "uz") return new Intl.DateTimeFormat(LOCALE[lang], { ...OPTIONS[style], timeZone: zone }).format(d);

  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "numeric", day: "numeric", weekday: "short" }).formatToParts(d);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = Number(part("day"));
  const month = Number(part("month")) - 1;
  const year = part("year");
  const weekday = UZ_WEEKDAYS_SHORT[EN_WEEKDAYS.indexOf(part("weekday"))] ?? "";

  switch (style) {
    case "medium":
      return `${day}-${UZ_MONTHS_SHORT[month]}, ${year}`;
    case "dayMonth":
      return `${day}-${UZ_MONTHS[month]}`;
    case "dayMonthShort":
      return `${day}-${UZ_MONTHS_SHORT[month]}`;
    case "weekdayDayMonth":
      return `${weekday}, ${day}-${UZ_MONTHS[month]}`;
    default:
      return `${day}-${UZ_MONTHS[month]}, ${year}`;
  }
}
