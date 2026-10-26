import Link from "next/link";
import { createChapterAction } from "@/lib/actions/knowledge";
import { getEditorContext, type ChapterRow } from "@/lib/knowledge/admin";
import { Notice, Pill, Stat } from "@/components/knowledge/admin-ui";

type Stats = {
  chapters: number;
  sections: number;
  chunks: number;
  chunks_embedded: number;
  content_chars: number;
  sources: number;
  sources_by_status: Record<string, number>;
  country_rules: number;
  countries: number;
  rules_by_status: Record<string, number>;
  rules_due: number;
};

export default async function KnowledgeOverviewPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const { supabase, isEditor } = await getEditorContext();
  if (!supabase) return null;

  const [{ data: statsJson }, { data: chapters }, { data: sections }] = await Promise.all([
    supabase.rpc("kb_stats"),
    supabase.from("kb_chapters").select("id, position, slug, label, display_title, status, updated_at").order("position").returns<ChapterRow[]>(),
    supabase.from("kb_sections").select("chapter_id").returns<{ chapter_id: string }[]>(),
  ]);
  const stats = (statsJson ?? {}) as Partial<Stats>;
  const sectionCount = new Map<string, number>();
  for (const s of sections ?? []) sectionCount.set(s.chapter_id, (sectionCount.get(s.chapter_id) ?? 0) + 1);
  const embeddedPct = stats.chunks ? Math.round(((stats.chunks_embedded ?? 0) / stats.chunks) * 100) : 0;

  return (
    <>
      <Notice ok={searchParams.ok} error={searchParams.error} />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Boblar" value={stats.chapters ?? 0} hint={`${stats.sections ?? 0} ta bo‘lim`} />
        <Stat label="Qidiruv bo‘laklari" value={stats.chunks ?? 0} hint={`${embeddedPct}% embedding tayyor`} />
        <Stat label="Matn hajmi" value={`${Math.round((stats.content_chars ?? 0) / 1000)}k`} hint="belgi (to‘liq matn)" />
        <Stat label="Mamlakat qoidalari" value={stats.country_rules ?? 0} hint={`${stats.countries ?? 0} davlat · ${stats.rules_due ?? 0} ta tekshiruv muddati kelgan`} />
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-display-sm text-ink-950">Boblar</h2>
          <p className="text-body-sm text-ink-500">Bobni ochib, bo‘limlarni tahrirlang yoki yangi bo‘lim qo‘shing.</p>
        </div>
        <ol className="card mt-4 divide-y divide-surface-border overflow-hidden">
          {(chapters ?? []).map((c) => (
            <li key={c.id}>
              <Link href={`/admin/knowledge/chapters/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-tint">
                <span className="w-8 shrink-0 text-body-sm tabular-nums text-ink-400">{c.position}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold text-ink-900">{c.display_title}</span>
                  <span className="text-caption text-ink-500">
                    {sectionCount.get(c.id) ?? 0} ta bo‘lim · /{c.slug}
                  </span>
                </span>
                <Pill tone={c.status === "published" ? "green" : c.status === "draft" ? "amber" : "gray"}>{c.status}</Pill>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {isEditor ? (
        <section className="card mt-8 p-5 sm:p-6">
          <h2 className="font-display text-display-sm text-ink-950">Yangi bob qo‘shish</h2>
          <p className="mt-1 text-body-sm text-ink-500">Bob qoralama (draft) sifatida yaratiladi; bo‘limlarni qo‘shib, so‘ng “published” qiling — shundan keyin AI undan foydalanadi.</p>
          <form action={createChapterAction} className="mt-4 grid gap-4 md:grid-cols-3">
            <input type="hidden" name="return_to" value="/admin/knowledge" />
            <label className="block">
              <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Belgi</span>
              <input name="label" className="input" placeholder="X BOB" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Bob nomi</span>
              <input name="display_title" required className="input" placeholder="X BOB. Talaba vizalari" />
            </label>
            <div className="md:col-span-3">
              <button type="submit" className="btn btn-primary btn-md">Bob yaratish</button>
            </div>
          </form>
        </section>
      ) : null}
    </>
  );
}
