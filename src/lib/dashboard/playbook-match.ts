/**
 * Links the two books: finds the country a free-text question names (in Uzbek,
 * Russian or English) and ranks interview-playbook questions by the words they
 * share with it, so the book-based assistant can also show practice questions.
 * Plain word matching, no AI.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
export type MatchLang = "uz" | "ru" | "en";

export interface NamedCountry {
  code: string;
  name: Record<MatchLang, string>;
}

const norm = (text: string) => text.toLowerCase().replace(/[‘’ʻʼ`´]/g, "'");
export const words = (text: string) => norm(text).match(/[\p{L}\p{N}']+/gu) ?? [];

/** Other names people use for the same country */
const ALIASES: Record<string, string[]> = {
  us: ["amerika", "usa", "америка", "america"],
  gb: ["angliya", "britaniya", "англия", "британия", "england", "britain", "uk"],
};

/** Enough of a name to match it with case endings: Germaniyaga, Германии, Italiyada. */
function stemOf(word: string) {
  if (word.length >= 7) return word.slice(0, -2);
  if (word.length >= 5) return word.slice(0, -1);
  return word;
}

/** The country with the longest matching name, so "Австралия" isn't taken for "Австрия". */
export function detectCountry(query: string, countries: NamedCountry[]): string | null {
  const text = norm(query);
  const tokens = words(query);
  let best: { code: string; length: number } | null = null;
  for (const country of countries) {
    for (const name of [...Object.values(country.name), ...(ALIASES[country.code] ?? [])]) {
      const parts = words(name);
      const stem = parts.length > 1 ? stemOf(parts.join(" ")) : stemOf(parts[0] ?? "");
      if (stem.length < 2) continue;
      const found = parts.length > 1 ? text.includes(stem) : tokens.some((t) => t.startsWith(stem));
      if (found && (!best || stem.length > best.length)) best = { code: country.code, length: stem.length };
    }
  }
  return best?.code ?? null;
}

const INTERVIEW = /suhbat|intervyu|interview|собеседован|интервью|savol|question|вопрос|so'ra|konsul|officer|офицер|спрашива/;

export const isInterviewQuestion = (query: string) => INTERVIEW.test(norm(query));

// Words that say nothing about which question is meant, compared by their
// 5-letter stem so endings don't matter (so'rashadi, so'raladi → so'ra)
const STOP = new Set(
  "qanday qanaqa nima nimalar uchun bilan bormoqchi kerak bo'ladi bo'yicha qaysi qachon haqida haqda savol suhbat intervyu viza vizasi vizaga vizalar beriladi so'raladi what which when does they have will there from should need question interview asked visa about your with that this какие какой какая вопрос собеседование визы виза визу визой задают спрашивают нужно можно будет есть".split(
    " "
  ).map((w) => w.slice(0, 5))
);

/** Name stems of every country, so naming a country doesn't count as a shared topic */
const nameStems = (countries: NamedCountry[]) =>
  countries
    .flatMap((c) => [...Object.values(c.name), ...(ALIASES[c.code] ?? [])])
    .flatMap((name) => words(name))
    .map(stemOf)
    .filter((s) => s.length >= 2);

/** Distinct 5-letter stems of the meaningful words in a question, without country names */
export function queryStems(query: string, countries: NamedCountry[] = []): string[] {
  const names = nameStems(countries);
  return [
    ...new Set(
      words(query)
        .filter((w) => w.length >= 4 && !names.some((n) => w.startsWith(n)))
        .map((w) => w.slice(0, 5))
        .filter((s) => !STOP.has(s))
    ),
  ];
}

const LEVEL_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

/**
 * The best `limit` rows for the stems of a question: most shared stems first,
 * then easier and earlier questions, each question text once (many countries
 * share a question). When a country is named but no row shares a stem, that
 * country's first questions are returned as examples.
 */
export function rankPlaybook<T extends { question: Record<MatchLang, string>; level: string; sort_order: number }>(
  stems: string[],
  rows: T[],
  options: { country: string | null; limit?: number }
): T[] {
  const scored = rows.map((row) => {
    const own = new Set(words(Object.values(row.question).join(" ")).map((w) => w.slice(0, 5)));
    return { row, score: stems.filter((s) => own.has(s)).length };
  });
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (LEVEL_ORDER[a.row.level] ?? 3) - (LEVEL_ORDER[b.row.level] ?? 3) ||
      a.row.sort_order - b.row.sort_order
  );
  const hits = scored.filter((s) => s.score > 0);
  const pool = hits.length ? hits : options.country ? scored : [];
  const seen = new Set<string>();
  const picked: T[] = [];
  for (const { row } of pool) {
    const key = norm(row.question.uz);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(row);
    if (picked.length === (options.limit ?? 3)) break;
  }
  return picked;
}
