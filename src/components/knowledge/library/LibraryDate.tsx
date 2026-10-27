"use client";

import { useDateLocale } from "@/components/i18n/L";

/** A date in the active language, e.g. "3-noyabr, 2026" / "3 ноября 2026 г." */
export function LibraryDate({ iso }: { iso: string }) {
  const locale = useDateLocale();
  return (
    <time dateTime={iso}>
      {new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
    </time>
  );
}
