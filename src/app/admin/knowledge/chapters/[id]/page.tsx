import Link from "next/link";
import { notFound } from "next/navigation";
import { createSectionAction, updateChapterAction } from "@/lib/actions/knowledge";
import { getEditorContext, sectionLabel, type ChapterRow, type SectionRow } from "@/lib/knowledge/admin";
import { Notice, Pill, formatDate } from "@/components/knowledge/admin-ui";

export default async function ChapterAdminPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; error?: string };
}) {
  const { supabase, isEditor } = await getEditorContext();
  if (!supabase) return null;

  const [{ data: chapter }, { data: sections }] = await Promise.all([
    supabase.from("kb_chapters").select("*").eq("id", params.id).maybeSingle<ChapterRow>(),
    supabase.from("kb_sections").select("id, position, number, title, status, content_md, updated_at").eq("chapter_id", params.id).order("position").returns<SectionRow[]>(),
  ]);
  if (!chapter) notFound();
  const returnTo = `/admin/knowledge/chapters/${chapter.id}`;

  return (
    <>
      <Notice ok={searchParams.ok} error={searchParams.error} />
      <p className="text-body-sm text-ink-500">
        <Link href="/admin/knowledge" className="hover:text-ink-900">Boblar</Link> / {chapter.label}
      </p>
      <h2 className="mt-1 font-display text-display-md text-ink-950">{chapter.display_title}</h2>

      <form action={updateChapterAction} className="card mt-6 grid gap-4 p-5 sm:p-6 md:grid-cols-4">
        <input type="hidden" name="id" value={chapter.id} />
        <input type="hidden" name="return_to" value={returnTo} />
        <label className="block">
          <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Belgi</span>
          <input name="label" defaultValue={chapter.label} className="input" disabled={!isEditor} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Ko‘rinadigan nom</span>
          <input name="display_title" defaultValue={chapter.display_title} required className="input" disabled={!isEditor} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Holat</span>
          <select name="status" defaultValue={chapter.status} className="input" disabled={!isEditor}>
            <option value="published">published — AI foydalanadi</option>
            <option value="draft">draft — yashirin</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="block md:col-span-4">
          <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Asl sarlavha (kitobdagidek)</span>
          <input name="title" defaultValue={chapter.title} className="input" disabled={!isEditor} />
        </label>
        {isEditor ? (
          <div className="md:col-span-4">
            <button type="submit" className="btn btn-primary btn-md">Bobni saqlash</button>
          </div>
        ) : null}
      </form>

      <h3 className="mt-8 font-display text-display-sm text-ink-950">Bo‘limlar ({sections?.length ?? 0})</h3>
      <ol className="card mt-3 divide-y divide-surface-border overflow-hidden">
        {(sections ?? []).map((s) => (
          <li key={s.id}>
            <Link href={`/admin/knowledge/sections/${s.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-tint">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-medium text-ink-900">{sectionLabel(s)}</span>
                <span className="text-caption text-ink-500">
                  {s.content_md.length.toLocaleString("uz")} belgi · {formatDate(s.updated_at)}
                </span>
              </span>
              <Pill tone={s.status === "published" ? "green" : "amber"}>{s.status}</Pill>
            </Link>
          </li>
        ))}
      </ol>

      {isEditor ? (
        <form action={createSectionAction} className="card mt-8 grid gap-4 p-5 sm:p-6 md:grid-cols-4">
          <input type="hidden" name="chapter_id" value={chapter.id} />
          <input type="hidden" name="return_to" value={returnTo} />
          <h3 className="font-display text-display-sm text-ink-950 md:col-span-4">Yangi bo‘lim qo‘shish</h3>
          <label className="block">
            <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Raqam</span>
            <input name="number" className="input" placeholder="1.37" />
          </label>
          <label className="block md:col-span-3">
            <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Sarlavha</span>
            <input name="title" required className="input" />
          </label>
          <label className="block md:col-span-4">
            <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Matn (Markdown: ### kichik sarlavha, - ro‘yxat, | jadval |)</span>
            <textarea name="content_md" rows={10} className="input min-h-[200px] font-mono text-body-sm" />
          </label>
          <div className="md:col-span-4">
            <button type="submit" className="btn btn-primary btn-md">Bo‘lim qo‘shish</button>
          </div>
        </form>
      ) : null}
    </>
  );
}
