import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/authz";
import type { Database } from "@/types/database";
import { chunkSectionMarkdown } from "./chunk";

// Same convention as src/lib/data/_shared.ts: the generated-style Database
// generics collapse row types to `never` with this supabase-js version, so
// queries are typed explicitly with the row aliases below instead.
export type KbClient = SupabaseClient<any, any, any>;

type Tables = Database["public"]["Tables"];
export type ChapterRow = Tables["kb_chapters"]["Row"];
export type SectionRow = Tables["kb_sections"]["Row"];
export type RevisionRow = Tables["kb_section_revisions"]["Row"];
export type ChunkRow = Tables["kb_chunks"]["Row"];
export type SourceRow = Tables["kb_sources"]["Row"];
export type RuleRow = Tables["kb_country_rules"]["Row"];
export type RuleSourceRow = Tables["kb_rule_sources"]["Row"];

/**
 * Who is looking at /admin/knowledge. Two independent gates must both pass
 * to edit: ADMIN_EMAILS (the app's existing /admin allowlist, checked by
 * middleware too) and a kb_editors row (checked by RLS in the database).
 */
export async function getEditorContext() {
  const supabase = createClient() as KbClient | null;
  if (!supabase) return { supabase: null, userId: null, email: null, isAdmin: false, isEditor: false } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const { data: isEditor } = user ? await supabase.rpc("kb_is_editor") : { data: false };
  return { supabase, userId: user?.id ?? null, email: user?.email ?? null, isAdmin, isEditor: isEditor === true } as const;
}

export const sectionLabel = (s: { number: string | null; title: string }) => (s.number ? `${s.number}. ${s.title}` : s.title);

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[‘’ʻʼ'`]/g, "")
      .normalize("NFKD")
      .replace(/[^a-z0-9а-яё]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "bolim"
  );
}

/** Rebuilds a section's retrieval chunks; unchanged chunks keep their embeddings. */
export async function rechunkSection(supabase: KbClient, sectionId: string): Promise<number> {
  const { data: section, error } = await supabase
    .from("kb_sections")
    .select("id, chapter_id, number, title, content_md")
    .eq("id", sectionId)
    .single<Pick<SectionRow, "id" | "chapter_id" | "number" | "title" | "content_md">>();
  if (error || !section) throw new Error(error?.message ?? "Section not found");
  const { data: chapter } = await supabase.from("kb_chapters").select("display_title").eq("id", section.chapter_id).single<Pick<ChapterRow, "display_title">>();
  const chunks = chunkSectionMarkdown(section.content_md, {
    chapterLabel: chapter?.display_title ?? "",
    sectionLabel: sectionLabel(section),
  });
  const { data, error: rpcError } = await supabase.rpc("kb_replace_section_chunks", {
    p_section_id: sectionId,
    p_chunks: chunks,
  });
  if (rpcError) throw new Error(rpcError.message);
  return (data as number | null) ?? chunks.length;
}

export const RULE_REVIEW_DAYS: Record<string, number> = { high: 30, medium: 90, low: 180 };

export const RULE_STATUS_LABEL: Record<string, string> = {
  unverified: "Tasdiqlanmagan",
  verified: "Tasdiqlangan",
  needs_review: "Qayta ko‘rib chiqish kerak",
  outdated: "Eskirgan",
};

export const SOURCE_STATUS_LABEL: Record<string, string> = {
  pending: "Hali tekshirilmagan",
  ok: "O‘zgarmagan",
  changed: "O‘zgargan",
  unreachable: "Ochilmadi",
  error: "Xato",
};
