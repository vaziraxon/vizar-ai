import "server-only";
import { cache } from "react";
import type { LangCode } from "@/lib/translations";
import type { KbClient } from "./admin";
import type { KbRuleStatus } from "./types";

/**
 * Data for the public "Viza ma'lumotlar bazasi" library pages.
 *
 * Titles, the outline, countries and short previews come from security
 * definer RPCs that never return full text (supabase/kb_library_access.sql),
 * so they work for every visitor. Full section text and country rules are
 * read straight from the tables with the viewer's own client: RLS returns
 * them only while public.kb_has_access() is true, so a URL or API call
 * without an active subscription gets nothing.
 *
 * Every function takes the page language. Russian and English come from the
 * *_i18n tables (supabase/kb_i18n.sql) and fall back to Uzbek where nothing
 * is translated yet; *Src fields keep the Uzbek original for emoji and flag
 * matching (src/lib/knowledge/visuals.ts).
 */

/**
 * Calls an outline RPC in the page language. Uzbek calls leave p_lang out,
 * and a failed translated call falls back to Uzbek, so pages keep working
 * against a database where supabase/kb_i18n.sql isn't applied yet.
 */
async function rpcInLang(supabase: KbClient, fn: string, args: Record<string, unknown>, lang: LangCode) {
  if (lang !== "uz") {
    const translated = await supabase.rpc(fn, { ...args, p_lang: lang });
    if (!translated.error) return translated;
    console.warn(`[library] ${fn}(p_lang=${lang}) failed, showing Uzbek: ${translated.error.message}`);
  }
  return supabase.rpc(fn, args);
}

export interface OutlineSection {
  slug: string;
  number: string | null;
  title: string;
  /** Uzbek title */
  titleSrc: string;
  isIntro: boolean;
  chars: number;
  /** The body exists in the page language (otherwise it is shown in Uzbek) */
  bodyTranslated: boolean;
}

export interface OutlineChapter {
  slug: string;
  kind: string;
  number: number | null;
  label: string;
  title: string;
  sections: OutlineSection[];
  chars: number;
}

interface OutlineRow {
  chapter_slug: string;
  chapter_position: number;
  chapter_kind: string;
  chapter_number: number | null;
  chapter_label: string;
  chapter_title: string;
  section_slug: string;
  section_number: string | null;
  section_title: string;
  section_title_src?: string;
  is_intro: boolean;
  char_count: number;
  body_translated?: boolean;
}

// Wrapped in cache() so generateMetadata and the page share one call per request.
export const getOutline = cache(async (supabase: KbClient, lang: LangCode): Promise<OutlineChapter[]> => {
  const { data, error } = await rpcInLang(supabase, "kb_library_outline", {}, lang);
  if (error) throw new Error(`kb_library_outline: ${error.message}`);
  const chapters = new Map<string, OutlineChapter>();
  for (const row of (data ?? []) as OutlineRow[]) {
    let chapter = chapters.get(row.chapter_slug);
    if (!chapter) {
      chapter = {
        slug: row.chapter_slug,
        kind: row.chapter_kind,
        number: row.chapter_number,
        label: row.chapter_label,
        title: row.chapter_title,
        sections: [],
        chars: 0,
      };
      chapters.set(row.chapter_slug, chapter);
    }
    chapter.sections.push({
      slug: row.section_slug,
      number: row.section_number,
      title: row.section_title,
      titleSrc: row.section_title_src ?? row.section_title,
      isIntro: row.is_intro,
      chars: row.char_count,
      bodyTranslated: row.body_translated ?? false,
    });
    chapter.chars += row.char_count;
  }
  return Array.from(chapters.values());
});

/** "I BOB. Viza tizimi va vizalarning turlari" → "Viza tizimi va vizalarning turlari" */
export function chapterHeading(chapter: Pick<OutlineChapter, "label" | "title">): string {
  const prefix = `${chapter.label}.`;
  const title = chapter.title.toUpperCase().startsWith(prefix.toUpperCase()) ? chapter.title.slice(prefix.length).trim() : chapter.title;
  // Some chapter titles are typeset in capitals in the book ("AQSh, KANADA, …" counts too).
  const letters = title.replace(/[^\p{L}]/gu, "");
  const upper = letters.replace(/[^\p{Lu}]/gu, "").length;
  return letters.length && upper / letters.length > 0.8 ? sentenceCase(title) : title;
}

// Proper names to restore after lower-casing; short ones must match the whole word.
const NAMES_EXACT: Record<string, string> = { aqsh: "AQSh", ai: "AI", vizar: "VIZAR" };
const NAMES_PREFIX: Record<string, string> = {
  kanada: "Kanada",
  avstraliya: "Avstraliya",
  zelandiya: "Zelandiya",
  shengen: "Shengen",
  yevropa: "Yevropa",
  osiyo: "Osiyo",
  sharq: "Sharq",
};

function sentenceCase(text: string): string {
  const words = text.toLocaleLowerCase("uz").split(" ");
  return words
    .map((word, i) => {
      const bare = word.replace(/[^\p{L}]/gu, "");
      let out = word;
      const prefix = Object.keys(NAMES_PREFIX).find((k) => bare.startsWith(k));
      if (NAMES_EXACT[bare]) out = word.replace(bare, NAMES_EXACT[bare]!);
      else if (prefix) out = word.replace(prefix, NAMES_PREFIX[prefix]!);
      else if (bare === "yangi" && words[i + 1]?.startsWith("zelandiya")) out = word.replace("yangi", "Yangi");
      else if (bare === "yaqin" && words[i + 1]?.startsWith("sharq")) out = word.replace("yaqin", "Yaqin");
      return i === 0 ? out.charAt(0).toLocaleUpperCase("uz") + out.slice(1) : out;
    })
    .join(" ");
}

export const sectionLabel = (s: Pick<OutlineSection, "number" | "title">) => (s.number ? `${s.number}. ${s.title}` : s.title);

/** Reading time at ~1 000 characters a minute, rounded up. */
export const readingMinutes = (chars: number) => Math.max(1, Math.ceil(chars / 1000));

export interface SectionPreview {
  chapterSlug: string;
  chapterKind: string;
  chapterLabel: string;
  chapterTitle: string;
  sectionId: string;
  sectionSlug: string;
  sectionNumber: string | null;
  sectionTitle: string;
  sectionTitleSrc: string;
  isIntro: boolean;
  chars: number;
  preview: string;
  /** Language of the preview / body: the page language once translated, else "uz" */
  bodyLang: LangCode;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export const getSectionPreview = cache(
  async (supabase: KbClient, chapterSlug: string, sectionSlug: string, lang: LangCode): Promise<SectionPreview | null> => {
  const { data, error } = await rpcInLang(supabase, "kb_section_preview", { p_chapter_slug: chapterSlug, p_section_slug: sectionSlug }, lang);
  if (error) throw new Error(`kb_section_preview: ${error.message}`);
  const row = ((data ?? []) as {
    chapter_slug: string;
    chapter_kind: string;
    chapter_label: string;
    chapter_title: string;
    section_id: string;
    section_slug: string;
    section_number: string | null;
    section_title: string;
    section_title_src?: string;
    is_intro: boolean;
    char_count: number;
    preview: string;
    body_lang?: LangCode;
    prev_slug: string | null;
    prev_title: string | null;
    next_slug: string | null;
    next_title: string | null;
  }[])[0];
  if (!row) return null;
  return {
    chapterSlug: row.chapter_slug,
    chapterKind: row.chapter_kind,
    chapterLabel: row.chapter_label,
    chapterTitle: row.chapter_title,
    sectionId: row.section_id,
    sectionSlug: row.section_slug,
    sectionNumber: row.section_number,
    sectionTitle: row.section_title,
    sectionTitleSrc: row.section_title_src ?? row.section_title,
    isIntro: row.is_intro,
    chars: row.char_count,
    preview: row.preview,
    bodyLang: row.body_lang ?? "uz",
    prev: row.prev_slug ? { slug: row.prev_slug, title: row.prev_title ?? "" } : null,
    next: row.next_slug ? { slug: row.next_slug, title: row.next_title ?? "" } : null,
  };
  }
);

/**
 * Full Markdown of a section in the page language (falling back to the
 * Uzbek original), or null when RLS hides it (no active subscription).
 */
export async function getSectionContent(
  supabase: KbClient,
  sectionId: string,
  lang: LangCode
): Promise<{ markdown: string; lang: LangCode } | null> {
  if (lang !== "uz") {
    const { data } = await supabase
      .from("kb_section_i18n")
      .select("content_md")
      .eq("section_id", sectionId)
      .eq("lang", lang)
      .maybeSingle<{ content_md: string | null }>();
    if (data?.content_md) return { markdown: data.content_md, lang };
  }
  const { data } = await supabase.from("kb_sections").select("content_md").eq("id", sectionId).maybeSingle<{ content_md: string }>();
  return data?.content_md ? { markdown: data.content_md, lang: "uz" } : null;
}

export type Region = "schengen" | "europe_other" | "americas_oceania" | "asia_middle_east" | "general";

export const REGIONS: { id: Region; title: string; emoji: string }[] = [
  { id: "schengen", title: "Shengen hududi", emoji: "🇪🇺" },
  { id: "europe_other", title: "Shengendan tashqari Yevropa", emoji: "🏰" },
  { id: "americas_oceania", title: "Amerika va Okeaniya", emoji: "🌎" },
  { id: "asia_middle_east", title: "Osiyo va Yaqin Sharq", emoji: "🌏" },
  { id: "general", title: "Umumiy qoidalar", emoji: "🧭" },
];

export interface LibraryCountry {
  code: string;
  name: string;
  /** Uzbek name (matches the book's section titles) */
  nameSrc: string;
  region: Region;
  ruleCount: number;
  /** Uzbek topics (emoji matching) */
  topics: string[];
  /** The same topics in the page language */
  topicLabels: string[];
  needsReview: number;
}

export const getCountries = cache(async (supabase: KbClient, lang: LangCode): Promise<LibraryCountry[]> => {
  const { data, error } = await rpcInLang(supabase, "kb_library_countries", {}, lang);
  if (error) throw new Error(`kb_library_countries: ${error.message}`);
  const rows = (data ?? []) as {
    country_code: string;
    country_name: string;
    country_name_src?: string;
    region: Region;
    rule_count: number;
    topics: string[];
    topic_labels?: string[];
    needs_review: number;
  }[];
  return rows.map((r) => ({
    code: r.country_code,
    name: r.country_name,
    nameSrc: r.country_name_src ?? r.country_name,
    region: r.region,
    ruleCount: r.rule_count,
    topics: r.topics,
    topicLabels: r.topic_labels ?? r.topics,
    needsReview: r.needs_review,
  }));
});

export interface CountrySection {
  chapterSlug: string;
  chapterLabel: string;
  sectionSlug: string;
  sectionNumber: string | null;
  sectionTitle: string;
  sectionTitleSrc: string;
  anchor: string | null;
}

export async function getCountrySections(supabase: KbClient, code: string, lang: LangCode): Promise<CountrySection[]> {
  const { data, error } = await rpcInLang(supabase, "kb_country_outline", { p_country_code: code }, lang);
  if (error) throw new Error(`kb_country_outline: ${error.message}`);
  const rows = (data ?? []) as {
    chapter_slug: string;
    chapter_label: string;
    section_slug: string;
    section_number: string | null;
    section_title: string;
    section_title_src?: string;
    anchor: string | null;
  }[];
  return rows.map((r) => ({
    chapterSlug: r.chapter_slug,
    chapterLabel: r.chapter_label,
    sectionSlug: r.section_slug,
    sectionNumber: r.section_number,
    sectionTitle: r.section_title,
    sectionTitleSrc: r.section_title_src ?? r.section_title,
    anchor: r.anchor,
  }));
}

export interface CountryRule {
  id: string;
  topic: string;
  /** Uzbek topic (emoji matching) */
  topicSrc: string;
  ruleText: string;
  /** Text is a machine translation of the Uzbek rule */
  translated: boolean;
  status: KbRuleStatus;
  volatility: "low" | "medium" | "high";
  asOf: string | null;
  lastVerifiedAt: string | null;
  sources: { title: string; url: string; checkStatus: string; lastCheckedAt: string | null }[];
}

/** Country rules with their official sources, in the page language — empty without an active subscription (RLS). */
export async function getCountryRules(supabase: KbClient, code: string, lang: LangCode): Promise<CountryRule[]> {
  const { data, error } = await supabase
    .from("kb_country_rules")
    .select(
      "id, topic, rule_text, status, volatility, as_of, last_verified_at, kb_rule_sources(kb_sources(title, url, check_status, last_checked_at))"
    )
    .eq("country_code", code.toUpperCase())
    .neq("status", "outdated")
    .order("topic")
    .returns<
      {
        id: string;
        topic: string;
        rule_text: string;
        status: KbRuleStatus;
        volatility: "low" | "medium" | "high";
        as_of: string | null;
        last_verified_at: string | null;
        kb_rule_sources: { kb_sources: { title: string; url: string; check_status: string; last_checked_at: string | null } | null }[];
      }[]
    >();
  if (error) return [];
  const rows = data ?? [];
  const translations = new Map<string, { topic: string; rule_text: string }>();
  if (lang !== "uz" && rows.length) {
    const { data: t } = await supabase
      .from("kb_rule_i18n")
      .select("rule_id, topic, rule_text")
      .eq("lang", lang)
      .in(
        "rule_id",
        rows.map((r) => r.id)
      )
      .returns<{ rule_id: string; topic: string; rule_text: string }[]>();
    for (const row of t ?? []) translations.set(row.rule_id, row);
  }
  return rows.map((r) => ({
    id: r.id,
    topic: translations.get(r.id)?.topic ?? r.topic,
    topicSrc: r.topic,
    ruleText: translations.get(r.id)?.rule_text ?? r.rule_text,
    translated: translations.has(r.id),
    status: r.status,
    volatility: r.volatility,
    asOf: r.as_of,
    lastVerifiedAt: r.last_verified_at,
    sources: r.kb_rule_sources
      .map((rs) => rs.kb_sources)
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => ({ title: s.title, url: s.url, checkStatus: s.check_status, lastCheckedAt: s.last_checked_at })),
  }));
}
