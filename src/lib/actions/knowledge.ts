"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseEnv } from "@/lib/supabase/config";
import {
  getEditorContext,
  rechunkSection,
  RULE_REVIEW_DAYS,
  slugify,
  type ChapterRow,
  type KbClient,
  type RuleRow,
  type SectionRow,
} from "@/lib/knowledge/admin";

const BASE = "/admin/knowledge";

function back(form: FormData, fallback: string, params: Record<string, string>): never {
  const raw = String(form.get("return_to") ?? "");
  const target = raw.startsWith(BASE) ? raw.split("?")[0]! : fallback;
  redirect(`${target}?${new URLSearchParams(params).toString()}`);
}

async function requireEditor(form: FormData): Promise<{ supabase: KbClient; userId: string }> {
  const ctx = await getEditorContext();
  if (!ctx.supabase || !ctx.userId || !ctx.isAdmin || !ctx.isEditor) {
    back(form, BASE, { error: "Bilimlar bazasini tahrirlash huquqi yo‘q." });
  }
  return { supabase: ctx.supabase, userId: ctx.userId };
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string) => text(form, key) || null;

/* ----------------------------------------------------------------- Sections */

export async function saveSectionAction(form: FormData) {
  const { supabase, userId } = await requireEditor(form);
  const id = text(form, "id");
  const title = text(form, "title");
  if (!id || !title) back(form, BASE, { error: "Sarlavha bo‘sh bo‘lmasin." });

  const { error } = await supabase
    .from("kb_sections")
    .update({
      title,
      number: optional(form, "number"),
      status: text(form, "status") || "published",
      content_md: String(form.get("content_md") ?? "").replace(/\r\n/g, "\n"),
      updated_by: userId,
    })
    .eq("id", id);
  if (error) back(form, `${BASE}/sections/${id}`, { error: error.message });

  let chunks = 0;
  try {
    chunks = await rechunkSection(supabase, id);
  } catch (e) {
    back(form, `${BASE}/sections/${id}`, { error: `Saqlandi, lekin bo‘laklar yangilanmadi: ${(e as Error).message}` });
  }
  revalidatePath(BASE, "layout");
  back(form, `${BASE}/sections/${id}`, { ok: `Saqlandi. ${chunks} ta qidiruv bo‘lagi yangilandi.` });
}

export async function createSectionAction(form: FormData) {
  const { supabase, userId } = await requireEditor(form);
  const chapterId = text(form, "chapter_id");
  const title = text(form, "title");
  const number = optional(form, "number");
  if (!chapterId || !title) back(form, BASE, { error: "Bo‘lim sarlavhasi kerak." });

  const { data: siblings } = await supabase.from("kb_sections").select("position, slug").eq("chapter_id", chapterId).returns<Pick<SectionRow, "position" | "slug">[]>();
  const used = new Set((siblings ?? []).map((s) => s.slug));
  let slug = number ? slugify(number.replace(/\./g, "-")) : slugify(title);
  while (used.has(slug)) slug += "-2";
  const position = Math.max(-1, ...(siblings ?? []).map((s) => s.position)) + 1;

  const { data, error } = await supabase
    .from("kb_sections")
    .insert({
      chapter_id: chapterId,
      position,
      slug,
      number,
      title,
      content_md: String(form.get("content_md") ?? "").replace(/\r\n/g, "\n"),
      status: text(form, "status") || "published",
      updated_by: userId,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) back(form, `${BASE}/chapters/${chapterId}`, { error: error?.message ?? "Bo‘lim yaratilmadi." });

  await rechunkSection(supabase, data.id);
  revalidatePath(BASE, "layout");
  redirect(`${BASE}/sections/${data.id}?ok=${encodeURIComponent("Yangi bo‘lim qo‘shildi.")}`);
}

/* ----------------------------------------------------------------- Chapters */

export async function updateChapterAction(form: FormData) {
  const { supabase, userId } = await requireEditor(form);
  const id = text(form, "id");
  const displayTitle = text(form, "display_title");
  if (!id || !displayTitle) back(form, BASE, { error: "Bob nomi kerak." });

  const { data: before } = await supabase.from("kb_chapters").select("display_title").eq("id", id).single<Pick<ChapterRow, "display_title">>();
  const { error } = await supabase
    .from("kb_chapters")
    .update({
      label: text(form, "label") || displayTitle,
      title: text(form, "title") || displayTitle,
      display_title: displayTitle,
      status: text(form, "status") || "published",
      updated_by: userId,
    })
    .eq("id", id);
  if (error) back(form, `${BASE}/chapters/${id}`, { error: error.message });

  // Chunk heading paths include the chapter name.
  if (before?.display_title !== displayTitle) {
    const { data: sections } = await supabase.from("kb_sections").select("id").eq("chapter_id", id).returns<{ id: string }[]>();
    for (const s of sections ?? []) await rechunkSection(supabase, s.id);
  }
  revalidatePath(BASE, "layout");
  back(form, `${BASE}/chapters/${id}`, { ok: "Bob yangilandi." });
}

export async function createChapterAction(form: FormData) {
  const { supabase, userId } = await requireEditor(form);
  const displayTitle = text(form, "display_title");
  if (!displayTitle) back(form, BASE, { error: "Bob nomi kerak." });

  const { data: book } = await supabase.from("kb_books").select("id").order("created_at").limit(1).single<{ id: string }>();
  if (!book) back(form, BASE, { error: "Kitob topilmadi — avval import qiling." });
  const { data: chapters } = await supabase.from("kb_chapters").select("position, slug").eq("book_id", book.id).returns<Pick<ChapterRow, "position" | "slug">[]>();
  const used = new Set((chapters ?? []).map((c) => c.slug));
  let slug = slugify(text(form, "label") || displayTitle);
  while (used.has(slug)) slug += "-2";
  const label = text(form, "label") || displayTitle;
  const roman = label.match(/^([IVXLC]+)\s+BOB/)?.[1];
  const romanValue: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  const number = roman
    ? [...roman].reduce((sum, ch, i, arr) => {
        const v = romanValue[ch]!;
        return sum + (v < (romanValue[arr[i + 1] ?? ""] ?? 0) ? -v : v);
      }, 0)
    : null;
  // New chapters go after the last chapter, before the conclusion and back matter.
  const tail = (chapters ?? []).filter((c) => ["xulosa", "ilovalar", "manbalar", "tahririy-tekshiruv"].includes(c.slug));
  const position = tail.length ? Math.min(...tail.map((c) => c.position)) : Math.max(-1, ...(chapters ?? []).map((c) => c.position)) + 1;
  for (const c of tail.sort((a, b) => b.position - a.position)) {
    await supabase.from("kb_chapters").update({ position: c.position + 1 }).eq("book_id", book.id).eq("slug", c.slug);
  }

  const { data, error } = await supabase
    .from("kb_chapters")
    .insert({
      book_id: book.id,
      position,
      slug,
      kind: text(form, "kind") || "chapter",
      number,
      label,
      title: displayTitle.toUpperCase(),
      display_title: displayTitle,
      status: text(form, "status") || "draft",
      updated_by: userId,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) back(form, BASE, { error: error?.message ?? "Bob yaratilmadi." });
  revalidatePath(BASE, "layout");
  redirect(`${BASE}/chapters/${data.id}?ok=${encodeURIComponent("Yangi bob yaratildi. Endi bo‘limlar qo‘shing.")}`);
}

/* ------------------------------------------------------------ Country rules */

export async function updateRuleAction(form: FormData) {
  const { supabase } = await requireEditor(form);
  const id = text(form, "id");
  const ruleText = text(form, "rule_text");
  if (!id || !ruleText) back(form, `${BASE}/rules`, { error: "Qoida matni bo‘sh bo‘lmasin." });
  const { error } = await supabase
    .from("kb_country_rules")
    .update({
      topic: text(form, "topic"),
      rule_text: ruleText,
      volatility: text(form, "volatility") || "medium",
      status: text(form, "status") || "unverified",
      review_note: optional(form, "review_note"),
    })
    .eq("id", id);
  if (error) back(form, `${BASE}/rules`, { error: error.message });
  revalidatePath(`${BASE}/rules`);
  back(form, `${BASE}/rules`, { ok: "Qoida yangilandi." });
}

/** An editor re-read the official page and confirms the rule still matches it. */
export async function verifyRuleAction(form: FormData) {
  const { supabase, userId } = await requireEditor(form);
  const id = text(form, "id");
  const { data: rule } = await supabase.from("kb_country_rules").select("volatility").eq("id", id).single<Pick<RuleRow, "volatility">>();
  const days = RULE_REVIEW_DAYS[rule?.volatility ?? "medium"] ?? 90;
  const now = new Date();
  const { error } = await supabase
    .from("kb_country_rules")
    .update({
      status: "verified",
      last_verified_at: now.toISOString(),
      verified_by: userId,
      next_review_at: new Date(now.getTime() + days * 86_400_000).toISOString(),
      review_note: optional(form, "review_note"),
    })
    .eq("id", id);
  if (error) back(form, `${BASE}/rules`, { error: error.message });
  revalidatePath(`${BASE}/rules`);
  back(form, `${BASE}/rules`, { ok: `Tasdiqlandi. Keyingi tekshiruv ${days} kundan keyin.` });
}

export async function addRuleSourceAction(form: FormData) {
  const { supabase } = await requireEditor(form);
  const ruleId = text(form, "rule_id");
  const url = text(form, "url");
  if (!ruleId || !/^https:\/\/\S+$/.test(url)) back(form, `${BASE}/rules`, { error: "To‘liq https:// havola kiriting." });

  const { data: existing } = await supabase.from("kb_sources").select("id").eq("url", url).maybeSingle<{ id: string }>();
  let sourceId = existing?.id;
  if (!sourceId) {
    const { data, error } = await supabase
      .from("kb_sources")
      .insert({ url, title: text(form, "title") || new URL(url).hostname })
      .select("id")
      .single();
    if (error || !data) back(form, `${BASE}/rules`, { error: error?.message ?? "Manba qo‘shilmadi." });
    sourceId = data.id;
  }
  await supabase.from("kb_rule_sources").upsert({ rule_id: ruleId, source_id: sourceId });
  await supabase.from("kb_country_rules").update({ source_match: "manual" }).eq("id", ruleId).eq("source_match", "none");
  revalidatePath(`${BASE}/rules`);
  back(form, `${BASE}/rules`, { ok: "Rasmiy manba biriktirildi." });
}

/* ------------------------------------------------------------------ Sources */

export async function acknowledgeSourceAction(form: FormData) {
  const { supabase } = await requireEditor(form);
  const { error } = await supabase.from("kb_sources").update({ check_status: "ok" }).eq("id", text(form, "id"));
  if (error) back(form, `${BASE}/sources`, { error: error.message });
  revalidatePath(`${BASE}/sources`);
  back(form, `${BASE}/sources`, { ok: "O‘zgarish ko‘rib chiqildi deb belgilandi." });
}

export async function checkSourceNowAction(form: FormData) {
  const { supabase } = await requireEditor(form);
  const env = getSupabaseEnv();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!env || !session) back(form, `${BASE}/sources`, { error: "Sessiya topilmadi." });

  const res = await fetch(`${env.url}/functions/v1/kb-verify-sources`, {
    method: "POST",
    headers: { apikey: env.anonKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ source_id: text(form, "id") }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  revalidatePath(`${BASE}/sources`);
  if (!res.ok) back(form, `${BASE}/sources`, { error: body.error ?? `HTTP ${res.status}` });
  const result = body.results?.[0]?.result ?? "checked";
  const labels: Record<string, string> = {
    baseline: "Birinchi tekshiruv: asos sifatida saqlandi.",
    unchanged: "Sahifa o‘zgarmagan.",
    changed: "Sahifa o‘zgargan — bog‘liq qoidalar qayta ko‘rib chiqishga yuborildi.",
    unreachable: "Sahifani ochib bo‘lmadi.",
  };
  back(form, `${BASE}/sources`, { ok: labels[result] ?? "Tekshirildi." });
}
