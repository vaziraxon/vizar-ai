import type { LangCode } from "../translations";
import { DASHBOARD_PHRASES } from "./phrases-dashboard";
import { LIBRARY_PHRASES } from "./phrases-library";

/**
 * Phrase-based translation for the signed-in app. The Uzbek text *is* the
 * key, so existing Uzbek UI copy (and Uzbek demo data) can be wrapped with
 * `<L>` / `useL()` without inventing keys. Anything without an entry — for
 * example the user's own data — is shown unchanged.
 *
 * Placeholders use `{name}` and are filled from `vars`. Without `vars`, text
 * that was built from such an entry and saved (e.g. a notification stored as
 * "Bank statement hujjati muvaffaqiyatli yuklandi …") is matched against the
 * entry, and the parts it captured are translated too when they are phrases.
 */
export type PhraseTable = Record<string, { ru: string; en: string }>;

// Apostrophe variants (', ‘, ’, `) are treated as the same character.
const norm = (s: string) => s.replace(/[‘’`ʻʼ]/g, "'").replace(/\s+/g, " ").trim();

const INDEX: Map<string, { ru: string; en: string }> = new Map(
  Object.entries({ ...DASHBOARD_PHRASES, ...LIBRARY_PHRASES }).map(([uz, tr]) => [norm(uz), tr])
);

function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

// Placeholders that only ever hold a number, so "{n} so'z" can't swallow
// arbitrary user text that happens to end the same way.
const NUMERIC = new Set(["n", "score", "done", "total", "ms"]);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TEMPLATES = [...INDEX]
  .filter(([uz]) => /\{\w+\}/.test(uz) && uz.replace(/\{\w+\}/g, "").trim().length >= 4)
  .map(([uz, tr]) => {
    const names: string[] = [];
    const pattern = uz
      .split(/(\{\w+\})/)
      .map((part) => {
        const name = part.match(/^\{(\w+)\}$/)?.[1];
        if (!name) return escapeRe(part);
        names.push(name);
        return NUMERIC.has(name) ? "(\\d[\\d\\s.,]*)" : "(.+?)";
      })
      .join("");
    return { re: new RegExp(`^${pattern}$`), names, tr, literal: uz.replace(/\{\w+\}/g, "").length };
  })
  // Most specific first.
  .sort((a, b) => b.literal - a.literal);

function matchTemplate(text: string, lang: Exclude<LangCode, "uz">): string | null {
  for (const t of TEMPLATES) {
    const m = t.re.exec(text);
    if (!m) continue;
    const vars = Object.fromEntries(t.names.map((name, i) => [name, INDEX.get(norm(m[i + 1]!))?.[lang] ?? m[i + 1]!]));
    return fill(t.tr[lang], vars);
  }
  return null;
}

export function translatePhrase(text: string, lang: LangCode, vars?: Record<string, string | number>): string {
  if (lang === "uz") return fill(text, vars);
  const key = norm(text);
  const hit = INDEX.get(key);
  if (hit) return fill(hit[lang], vars);
  return (!vars && matchTemplate(key, lang)) || fill(text, vars);
}
