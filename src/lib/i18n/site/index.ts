import { useLanguage } from "@/lib/language-context";
import type { LangCode } from "@/lib/translations";
import type { SiteContent } from "./types";
import { uz } from "./uz";
import { ru } from "./ru";
import { en } from "./en";

export const SITE_CONTENT: Record<LangCode, SiteContent> = { uz, ru, en };

/** Typed site copy for the active language (same provider as `t()`). */
export function useSite(): SiteContent {
  const { language } = useLanguage();
  return SITE_CONTENT[language];
}

export type { SiteContent };
