// Shared helpers for the knowledge-base Edge Functions (Deno).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

/** Service-role client. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected by the platform. */
export function serviceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

/** Client acting as the caller (their JWT), for permission checks. */
export function callerClient(authorization: string) {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

let session: { run: (input: string, opts: Record<string, unknown>) => Promise<number[]> } | null = null;

/** gte-small embedding (384 dims, mean-pooled, normalized) via the Edge Runtime's built-in model. */
export async function embed(text: string): Promise<number[]> {
  // @ts-ignore Supabase is a global provided by the Edge Runtime.
  session ??= new Supabase.ai.Session("gte-small");
  return await session!.run(text, { mean_pool: true, normalize: true });
}

/** Same rule as public.kb_normalize(): drop apostrophe variants, lowercase. */
export const normalize = (t: string) => t.replace(/[‘’ʻʼ'`´]/g, "").toLowerCase();

// Function words that carry no retrieval signal (already normalized).
const STOP = new Set([
  "va", "yoki", "ham", "bilan", "uchun", "haqida", "bu", "shu", "u", "ular", "men", "menga", "meni", "mening",
  "biz", "bizga", "siz", "sizga", "sizning", "qanday", "qancha", "nima", "nimalar", "nimaga", "nega", "qaysi",
  "qachon", "qayerga", "qayerda", "qayerdan", "kim", "necha", "kerak", "kerakmi", "mumkin", "mumkinmi", "mi",
  "bor", "yoq", "emas", "edi", "boladi", "bolsa", "boladimi", "agar", "lekin", "ammo", "endi", "yana", "juda",
  "bormi", "qilish", "qilsam", "olish", "olsam", "har", "bir", "keyin", "oldin", "the", "a", "an", "of", "to", "in", "for",
  "and", "or", "is", "are", "how", "what", "do", "does", "i", "my", "me", "can",
]);

// Verb endings common in questions ("topshiriladi", "hisoblanadi",
// "berilgan"). Rare exact verb forms would otherwise get a very high IDF
// and outrank the nouns that carry the meaning. Stems keep ≥ 5 letters.
const VERB_SUFFIXES = ["ilmoqda", "moqda", "iladi", "ilgan", "ilishi", "ilish", "ladi", "lgan", "adi", "ydi", "gan"];

// Inflectional suffix slots, outermost first: question, case, possessive,
// plural. At most one suffix is removed per slot, so "kanadaga" → "kanada"
// (not "kana"), "vizalarning" → "viza", "hujjatlarining" → "hujjat".
const SUFFIX_SLOTS = [
  ["mi"],
  ["gacha", "dagi", "ning", "dan", "tan", "ga", "ka", "qa", "da", "ta", "ni"],
  ["ingiz", "imiz", "lari", "ing", "im", "si", "i"],
  ["lar"],
];

// Names whose last letters look like a case suffix ("Kanada" is not "Kana" + "da").
const PROTECTED = new Set(["kanada", "amerika", "afrika"]);

/** Light Uzbek stemmer; keeps at least 4 letters. Prefix search (`stem:*`) covers the rest. */
export function stem(token: string): string {
  if (PROTECTED.has(token)) return token;
  const verb = VERB_SUFFIXES.find((s) => token.endsWith(s) && token.length - s.length >= 5);
  if (verb) return token.slice(0, -verb.length);
  let t = token;
  for (const slot of SUFFIX_SLOTS) {
    const suffix = slot.find((s) => t.endsWith(s) && t.length - s.length >= 4);
    if (suffix) t = t.slice(0, -suffix.length);
  }
  return t;
}

/** Query → distinct stems for prefix full-text search (kb_search builds `stem:* | ...`). */
export function queryTerms(query: string): string[] {
  const tokens = normalize(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1 && !STOP.has(t));
  return [...new Set(tokens.map(stem))].slice(0, 16);
}
