"use client";

import { useFormatDate } from "@/components/i18n/L";

/** A date in the active language, e.g. "3-noyabr, 2026" / "3 ноября 2026 г." */
export function LibraryDate({ iso }: { iso: string }) {
  const fmt = useFormatDate();
  return (
    <time dateTime={iso}>
      {fmt(iso)}
    </time>
  );
}
