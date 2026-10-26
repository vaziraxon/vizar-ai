"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { translatePhrase } from "@/lib/i18n/phrases";

/** `l("O'zbekcha matn")` → the phrase in the active language. */
export function useL() {
  const { language } = useLanguage();
  return useCallback(
    (text: string, vars?: Record<string, string | number>) => translatePhrase(text, language, vars),
    [language]
  );
}

/**
 * Inline translation for any component, including server components:
 * `<L>Joriy ariza</L>` or `<L vars={{ n: 3 }}>{"{n} ta vazifa"}</L>`.
 */
export function L({ children, vars }: { children: string; vars?: Record<string, string | number> }) {
  const l = useL();
  return <>{l(children, vars)}</>;
}

/** BCP 47 locale for dates and numbers in the active language. */
export function useDateLocale() {
  const { language } = useLanguage();
  return language === "ru" ? "ru-RU" : language === "en" ? "en-GB" : "uz-UZ";
}
