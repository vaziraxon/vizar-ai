"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useL } from "@/components/i18n/L";
import { libraryHref } from "@/lib/knowledge/offline";

/**
 * Countries with their own page in the book's library (kb_country_sections,
 * checked 2026-11-02). The playbook's Latin American countries and South Africa
 * aren't in the book, so they get only the chapter link.
 */
const LIBRARY_COUNTRIES = new Set(
  "ae al am at au az ba be bg ca ch cn cy cz de dk ee es fi fr gb ge gr hr hu id ie in is it jp kr li lt lu lv md me mk mt my nl no nz om pl pt qa ro rs sa se sg si sk th tr us vn xk".split(
    " "
  )
);

/** The interview chapter of the book (IV BOB. Viza suhbati va rad javobi). */
const INTERVIEW_CHAPTER = "/dashboard/library/book/bob-4";

/** Links from interview practice into the VIZAR AI book: the chosen country and the interview chapter. */
export function InterviewBookLinks({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  const l = useL();
  const link = "inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-700 hover:text-brand-deep";

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-tint/60 px-4 py-3 text-left">
      <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900">
        <span aria-hidden="true">📚</span> {l("Kitobdan o'qing")}
      </p>
      <div className="mt-2 flex flex-col gap-1.5">
        {LIBRARY_COUNTRIES.has(countryCode) && (
          <Link href={libraryHref.country(countryCode)} className={link}>
            {l("Kitobda: {country} bo'yicha qoidalar va manbalar", { country: countryName })} <ArrowRight size={14} />
          </Link>
        )}
        <Link href={INTERVIEW_CHAPTER} className={link}>
          {l("IV bob: Viza suhbati va rad javobi")} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
