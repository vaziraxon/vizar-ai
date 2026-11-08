import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCountryRules } from "@/lib/knowledge/library";
import type { DestinationSlug } from "@/lib/site/registry";
import type { LangCode } from "@/lib/translations";

/** Destinations that are one country in the visa book; Schengen covers many, so it links to the library instead */
export const BOOK_COUNTRY: Partial<Record<DestinationSlug, string>> = {
  usa: "US",
  uk: "GB",
  canada: "CA",
  japan: "JP",
  "south-korea": "KR",
  uae: "AE",
  turkey: "TR",
};

export interface BookRule {
  id: string;
  topic: string;
  text: string;
  /** Confirmed against an official source; otherwise shown as "to be checked" */
  verified: boolean;
  asOf: string | null;
  sources: { title: string; url: string }[];
}

/** The visa book's rules for this destination's country (empty for Schengen, or without library access) */
export async function loadBookRules(
  supabase: SupabaseClient<any, any, any>,
  dest: DestinationSlug,
  lang: LangCode
): Promise<{ code: string | null; rules: BookRule[] }> {
  const code = BOOK_COUNTRY[dest] ?? null;
  if (!code) return { code, rules: [] };
  const rules = await getCountryRules(supabase, code, lang).catch(() => []);
  return {
    code,
    rules: rules.slice(0, 6).map((r) => ({
      id: r.id,
      topic: r.topic,
      text: r.ruleText,
      verified: r.status === "verified",
      asOf: r.asOf,
      sources: r.sources.map((s) => ({ title: s.title, url: s.url })),
    })),
  };
}
