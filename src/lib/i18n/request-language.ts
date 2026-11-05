import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { LangCode } from "@/lib/translations";

// Per-request slot for a language taken from the address (/ru/…, /en/…).
// React's cache() gives every request its own object, shared by
// generateMetadata and the page render of that request.
const urlLanguage = cache((): { lang: LangCode | null } => ({ lang: null }));

/** The /ru and /en library pages: the address, not the cookie, decides this request's language. */
export function setRequestLanguage(lang: LangCode) {
  urlLanguage().lang = lang;
}

/**
 * The visitor's language for server components: the address's language on
 * /ru and /en pages, otherwise the cookie that LanguageProvider keeps in sync
 * with its localStorage choice. Uzbek when unset or unknown.
 */
export function getRequestLanguage(): LangCode {
  const fromUrl = urlLanguage().lang;
  if (fromUrl) return fromUrl;
  const value = cookies().get("vizar-ai-language")?.value;
  return value === "ru" || value === "en" ? value : "uz";
}
