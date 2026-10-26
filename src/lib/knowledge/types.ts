/** Row shapes returned by the kb-search Edge Function (public.kb_search / kb_search_rules). */

export interface KbChunkHit {
  chunk_id: string;
  chapter_slug: string;
  chapter_label: string;
  chapter_title: string;
  section_id: string;
  section_slug: string;
  section_number: string | null;
  section_title: string;
  heading_path: string;
  content: string;
  full_text_rank: number | null;
  semantic_rank: number | null;
  similarity: number | null;
  score: number;
}

export interface KbRuleSource {
  title: string;
  url: string;
  check_status: "pending" | "ok" | "changed" | "unreachable" | "error";
  last_checked_at: string | null;
}

export type KbRuleStatus = "unverified" | "verified" | "needs_review" | "outdated";

export interface KbRuleHit {
  rule_id: string;
  country_code: string;
  country_name: string;
  topic: string;
  rule_text: string;
  volatility: "low" | "medium" | "high";
  status: KbRuleStatus;
  as_of: string | null;
  last_verified_at: string | null;
  next_review_at: string | null;
  section_slug: string | null;
  chapter_slug: string | null;
  sources: KbRuleSource[];
  country_hit: boolean;
  rank: number;
}

export interface KbSearchResult {
  query: string;
  terms: string[];
  chunks: KbChunkHit[];
  rules: KbRuleHit[];
}

/** One entry of the numbered reference list shown under an answer. */
export interface KbReference {
  n: number;
  kind: "book" | "rule";
  title: string;
  /** Book location, e.g. "I BOB. Viza tizimi … › 1.4. Vizada yozilgan …" */
  location?: string;
  /** Official page for country rules */
  urls?: string[];
  status?: KbRuleStatus;
  asOf?: string | null;
  cited: boolean;
}

/**
 * How an answer was produced: "ai" (Claude), "retrieval" (book passages
 * only — AI off or unavailable), "mock" (development test answer).
 */
export type AnswerMode = "ai" | "retrieval" | "mock";

/** NDJSON events streamed by POST /api/knowledge/ask. */
export type AskEvent =
  | { type: "references"; references: KbReference[] }
  | { type: "delta"; text: string }
  | { type: "final"; markdown: string; references: KbReference[]; mode: AnswerMode; notice?: string }
  | { type: "error"; message: string };

/** GET /api/knowledge/status */
export interface KbStatus {
  ai: { mode: "live" | "mock" | "off"; model: string | null; notice: string | null };
  knowledge: {
    chapters: number;
    sections: number;
    chunks: number;
    chunksEmbedded: number;
    countryRules: number;
    countries: number;
  } | null;
}
