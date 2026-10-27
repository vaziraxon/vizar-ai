"use client";

import { Search } from "lucide-react";
import { useL } from "@/components/i18n/L";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Plain GET form — works without JavaScript and keeps the query in the URL. */
export function SearchForm({ defaultValue = "", className }: { defaultValue?: string; className?: string }) {
  const l = useL();
  return (
    <form action="/knowledge-base/search" method="get" role="search" className={cn("relative", className)}>
      <label htmlFor="kb-library-q" className="sr-only">
        {l("Kutubxonadan qidirish")}
      </label>
      <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        id="kb-library-q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        minLength={2}
        maxLength={200}
        required
        placeholder={l("Masalan: Germaniya, 90/180, bank ko‘chirmasi")}
        className="h-14 w-full rounded-pill border border-surface-border bg-surface pl-11 pr-[7.5rem] text-body text-ink-900 shadow-card outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
      />
      <button type="submit" className={buttonClasses({ size: "md", className: "absolute right-1.5 top-1/2 -translate-y-1/2" })}>
        {l("Qidirish")}
      </button>
    </form>
  );
}
