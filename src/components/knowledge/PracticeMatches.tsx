"use client";

import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { useL } from "@/components/i18n/L";
import { PLAYBOOK_COUNTRIES, PLAYBOOK_LEVELS, type PlaybookLang } from "@/data/interview-playbook";
import { useLanguage } from "@/lib/language-context";

export interface PracticeMatch {
  id: string;
  country_code: string;
  level: string;
  question: Record<PlaybookLang, string>;
  answer: Record<PlaybookLang, string>;
}

/** Under an assistant answer: questions from the interview playbook that fit the question asked. */
export function PracticeMatches({ matches, country }: { matches: PracticeMatch[]; country: string | null }) {
  const l = useL();
  const { language } = useLanguage();
  const lang = language as PlaybookLang;
  const countryName = (code: string) => PLAYBOOK_COUNTRIES.find((c) => c.code === code)?.name[lang] ?? code.toUpperCase();
  const levelLabel = (key: string) => PLAYBOOK_LEVELS.find((lv) => lv.key === key)?.label ?? key;

  return (
    <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900">
        <MessagesSquare size={15} aria-hidden="true" className="text-violet-600" /> {l("Suhbat mashqidan mos savollar")}
      </p>
      <ul className="mt-3 space-y-2">
        {matches.map((m) => (
          <li key={m.id}>
            <details className="rounded-xl bg-surface px-3 py-2.5 ring-1 ring-surface-border">
              <summary className="cursor-pointer text-body-sm font-medium text-ink-900">
                {m.question[lang]}
                <span className="ml-1.5 text-caption font-normal text-ink-500">
                  · {countryName(m.country_code)} · {l(levelLabel(m.level))}
                </span>
              </summary>
              <p className="mt-2 text-body-sm text-ink-700">{m.answer[lang]}</p>
            </details>
          </li>
        ))}
      </ul>
      {matches.some((m) => m.answer[lang].includes("[")) && (
        <p className="mt-2 text-caption text-ink-500">{l("Namuna javoblardagi [qavs] ichidagi joylarni o'z ma'lumotingiz bilan almashtiring.")}</p>
      )}
      <Link
        href={country ? `/dashboard/interview?country=${country}` : "/dashboard/interview"}
        className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-700 hover:text-brand-deep"
      >
        {l(country ? "Shu davlat bo'yicha mashq qilish" : "Suhbat mashqini ochish")} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
