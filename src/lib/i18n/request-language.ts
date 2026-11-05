import "server-only";
import { cookies } from "next/headers";
import type { LangCode } from "@/lib/translations";

/**
 * The visitor's language for server components, from the cookie that
 * LanguageProvider keeps in sync with its localStorage choice. Uzbek when
 * unset or unknown.
 */
export function getRequestLanguage(): LangCode {
  const value = cookies().get("vizar-ai-language")?.value;
  return value === "ru" || value === "en" ? value : "uz";
}
