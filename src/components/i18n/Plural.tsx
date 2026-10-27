"use client";

import { useLanguage } from "@/lib/language-context";

/**
 * Nouns that follow a number. Uzbek doesn't inflect after numerals ("3 qoida"),
 * Russian has three forms (1 правило, 3 правила, 5 правил), English two.
 */
const FORMS = {
  qoida: { ru: ["правило", "правила", "правил"], en: ["rule", "rules"] },
  "bo‘lim": { ru: ["раздел", "раздела", "разделов"], en: ["section", "sections"] },
  "bo‘lim kitobda": { ru: ["раздел в книге", "раздела в книге", "разделов в книге"], en: ["section in the book", "sections in the book"] },
  davlat: { ru: ["страна", "страны", "стран"], en: ["country", "countries"] },
  bob: { ru: ["глава", "главы", "глав"], en: ["chapter", "chapters"] },
  "rasmiy manba": { ru: ["официальный источник", "официальных источника", "официальных источников"], en: ["official source", "official sources"] },
  kun: { ru: ["день", "дня", "дней"], en: ["day", "days"] },
} as const;

export type PluralWord = keyof typeof FORMS;

const ruRules = new Intl.PluralRules("ru");

export function pluralize(n: number, word: PluralWord, language: "uz" | "ru" | "en"): string {
  if (language === "uz") return word;
  if (language === "en") return FORMS[word].en[n === 1 ? 0 : 1];
  const rule = ruRules.select(n);
  return FORMS[word].ru[rule === "one" ? 0 : rule === "few" ? 1 : 2];
}

/** The noun for `n` in the active language: `{n} <Plural n={n} word="qoida" />`. */
export function Plural({ n, word }: { n: number; word: PluralWord }) {
  const { language } = useLanguage();
  return <>{pluralize(n, word, language)}</>;
}
