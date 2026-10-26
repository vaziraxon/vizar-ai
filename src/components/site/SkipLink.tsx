"use client";

import { useSite } from "@/lib/i18n/site";

export function SkipLink() {
  const site = useSite();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-night focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold focus:text-white"
    >
      {site.nav.skip}
    </a>
  );
}
