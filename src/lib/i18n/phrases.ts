import type { LangCode } from "../translations";
import { DASHBOARD_PHRASES } from "./phrases-dashboard";

/**
 * Phrase-based translation for the signed-in app. The Uzbek text *is* the
 * key, so existing Uzbek UI copy (and Uzbek demo data) can be wrapped with
 * `<L>` / `useL()` without inventing keys. Anything without an entry — for
 * example the user's own data — is shown unchanged.
 *
 * Placeholders use `{name}` and are filled from `vars`.
 */
export type PhraseTable = Record<string, { ru: string; en: string }>;

// Apostrophe variants (', ‘, ’, `) are treated as the same character.
const norm = (s: string) => s.replace(/[‘’`ʻʼ]/g, "'").replace(/\s+/g, " ").trim();

const INDEX: Map<string, { ru: string; en: string }> = new Map(
  Object.entries(DASHBOARD_PHRASES).map(([uz, tr]) => [norm(uz), tr])
);

function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function translatePhrase(text: string, lang: LangCode, vars?: Record<string, string | number>): string {
  if (lang === "uz") return fill(text, vars);
  const hit = INDEX.get(norm(text));
  return fill(hit ? hit[lang] : text, vars);
}
