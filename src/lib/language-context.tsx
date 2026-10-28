"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { TRANSLATIONS, type LangCode } from "./translations";

interface LanguageContextValue {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: string) => string;
  /** false until the stored choice has been read (the first render is always Uzbek) */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "vizar-ai-language";

// The same choice as a cookie, so server components (the /knowledge-base
// library) can render translated content. See src/lib/i18n/request-language.ts.
export const LANGUAGE_COOKIE = "vizar-ai-language";

function readCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANGUAGE_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/** Stores the language for the server; returns true when the server's language changed (no cookie = Uzbek). */
function syncCookie(lang: LangCode): boolean {
  if ((readCookie() ?? "uz") === lang) return false;
  document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  return true;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>("uz");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    const lang = stored && TRANSLATIONS[stored] ? stored : "uz";
    setLanguageState(lang);
    setReady(true);
    // The server rendered in another language (a choice made before the
    // cookie existed, or a cleared localStorage): re-render once to match.
    if (syncCookie(lang)) router.refresh();
  }, [router]);

  // Wait for the stored choice: the first render is always Uzbek, and writing
  // it would undo the lang the inline script in the root layout already set.
  useEffect(() => {
    if (ready) document.documentElement.lang = language;
  }, [language, ready]);

  function setLanguage(lang: LangCode) {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    if (syncCookie(lang)) router.refresh();
  }

  function t(key: string): string {
    return TRANSLATIONS[language][key] ?? TRANSLATIONS.uz[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * For server-rendered pages that already know the language from the cookie
 * (the /knowledge-base library): render this subtree in that language until
 * LanguageProvider has read localStorage, so the HTML and the first paint
 * aren't Uzbek next to translated server data. Server and client agree on
 * the first render, so hydration stays clean.
 */
export function ServerLanguageScope({ initial, children }: { initial: LangCode; children: ReactNode }) {
  const ctx = useLanguage();
  const language = ctx.ready ? ctx.language : initial;
  const value = useMemo(
    () => ({ ...ctx, language, t: (key: string) => TRANSLATIONS[language][key] ?? TRANSLATIONS.uz[key] ?? key }),
    [ctx, language]
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
