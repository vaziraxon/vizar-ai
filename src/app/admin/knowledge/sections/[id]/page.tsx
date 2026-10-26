import Link from "next/link";
import { notFound } from "next/navigation";
import { getEditorContext, type ChapterRow, type ChunkRow, type RevisionRow, type SectionRow } from "@/lib/knowledge/admin";
import { SectionEditor } from "@/components/knowledge/SectionEditor";
import { Notice, formatDate } from "@/components/knowledge/admin-ui";

export default async function SectionAdminPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; error?: string };
}) {
  const { supabase, isEditor } = await getEditorContext();
  if (!supabase) return null;

  const { data: section } = await supabase.from("kb_sections").select("*").eq("id", params.id).maybeSingle<SectionRow>();
  if (!section) notFound();
  const [{ data: chapter }, { data: chunks }, { data: revisions }] = await Promise.all([
    supabase.from("kb_chapters").select("id, display_title").eq("id", section.chapter_id).single<Pick<ChapterRow, "id" | "display_title">>(),
    supabase.from("kb_chunks").select("id, embedded_at").eq("section_id", section.id).returns<Pick<ChunkRow, "id" | "embedded_at">[]>(),
    isEditor
      ? supabase.from("kb_section_revisions").select("id, title, edited_at, content_md").eq("section_id", section.id).order("edited_at", { ascending: false }).limit(10).returns<Pick<RevisionRow, "id" | "title" | "edited_at" | "content_md">[]>()
      : Promise.resolve({ data: [] as { id: number; title: string; edited_at: string; content_md: string }[] }),
  ]);
  const embedded = (chunks ?? []).filter((c) => c.embedded_at).length;

  return (
    <>
      <Notice ok={searchParams.ok} error={searchParams.error} />
      <p className="text-body-sm text-ink-500">
        <Link href="/admin/knowledge" className="hover:text-ink-900">Boblar</Link> /{" "}
        <Link href={`/admin/knowledge/chapters/${chapter?.id}`} className="hover:text-ink-900">{chapter?.display_title}</Link>
      </p>
      <h2 className="mt-1 font-display text-display-md text-ink-950">
        {section.number ? `${section.number}. ` : ""}
        {section.title}
      </h2>
      <p className="mt-1 text-body-sm text-ink-500">
        {chunks?.length ?? 0} ta qidiruv bo‘lagi · {embedded} tasida embedding bor · oxirgi o‘zgarish {formatDate(section.updated_at)}
      </p>

      <div className="mt-6">
        <SectionEditor section={section} editable={isEditor} />
      </div>

      {isEditor && revisions && revisions.length > 0 ? (
        <section className="card mt-8 p-5 sm:p-6">
          <h3 className="font-display text-display-sm text-ink-950">Oldingi versiyalar</h3>
          <ul className="mt-3 divide-y divide-surface-border">
            {revisions.map((r) => (
              <li key={r.id} className="py-3">
                <details>
                  <summary className="cursor-pointer text-body-sm text-ink-800">
                    {new Date(r.edited_at).toLocaleString("uz")} — {r.title} ({r.content_md.length.toLocaleString("uz")} belgi)
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-tint p-3 text-caption text-ink-700">{r.content_md}</pre>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
