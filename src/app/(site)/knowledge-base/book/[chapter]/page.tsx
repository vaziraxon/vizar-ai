import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { L } from "@/components/i18n/L";
import { AccessCard, LibraryError, LibraryHero, LibraryTabs, Paywall, SectionRow, chapterEmoji } from "@/components/knowledge/library/ui";
import { getLibraryViewer } from "@/lib/knowledge/access";
import { chapterHeading, getOutline, readingMinutes, type OutlineChapter } from "@/lib/knowledge/library";
import { libraryHref } from "@/lib/knowledge/offline";

export const dynamic = "force-dynamic";

type Params = { params: { chapter: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const viewer = await getLibraryViewer();
  const chapter = viewer.supabase ? (await getOutline(viewer.supabase).catch(() => [])).find((c) => c.slug === params.chapter) : undefined;
  if (!chapter) return {};
  return {
    title: `${chapter.label}. ${chapterHeading(chapter)} — Viza ma’lumotlar bazasi`,
    description: chapter.sections
      .filter((s) => !s.isIntro)
      .slice(0, 6)
      .map((s) => s.title)
      .join(" · "),
    alternates: { canonical: `/knowledge-base/book/${chapter.slug}` },
  };
}

export default async function ChapterPage({ params }: Params) {
  const viewer = await getLibraryViewer();
  if (!viewer.supabase) return <LibraryError />;

  let outline: OutlineChapter[];
  try {
    outline = await getOutline(viewer.supabase);
  } catch (error) {
    console.error("[knowledge-base/chapter]", error);
    return <LibraryError />;
  }
  const index = outline.findIndex((c) => c.slug === params.chapter);
  const chapter = outline[index];
  if (!chapter) notFound();
  const prev = outline[index - 1];
  const next = outline[index + 1];
  const here = `/knowledge-base/book/${chapter.slug}`;
  const locked = !viewer.hasAccess;

  return (
    <>
      <LibraryHero
        breadcrumb={[{ href: "/knowledge-base", label: <L>Kutubxona</L> }]}
        eyebrow={
          <>
            <span aria-hidden="true">{chapterEmoji(chapter)}</span> {chapter.label}
          </>
        }
        title={chapterHeading(chapter)}
        subtitle={
          <>
            {chapter.sections.length} <L>bo‘lim</L> · ~{readingMinutes(chapter.chars)} <L>daqiqalik o‘qish</L>
          </>
        }
        aside={<AccessCard viewer={viewer} next={here} />}
      />
      <LibraryTabs />

      <div className="container-page py-12 sm:py-16">
        <ol className="rounded-[28px] border border-surface-border bg-surface p-2 sm:p-3">
          {chapter.sections.map((s) => (
            <SectionRow
              key={s.slug}
              href={libraryHref.section(chapter.slug, s.slug)}
              number={s.number}
              title={s.isIntro ? <L>Bob haqida</L> : s.title}
              minutes={readingMinutes(s.chars)}
              locked={locked}
            />
          ))}
        </ol>

        {locked ? (
          <div className="mt-10">
            <Paywall viewer={viewer} next={here} title={<L>Bu bobning to‘liq matni obunachilar uchun</L>} />
          </div>
        ) : null}

        <nav aria-label="Boblar" className="mt-10 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/knowledge-base/book/${prev.slug}`} className="group rounded-2xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand-200">
              <span className="flex items-center gap-1.5 text-caption text-ink-500">
                <ArrowLeft size={13} aria-hidden="true" />
                <L>Oldingi</L>
              </span>
              <span className="mt-1 block text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">
                {prev.label} — {chapterHeading(prev)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/knowledge-base/book/${next.slug}`} className="group rounded-2xl border border-surface-border bg-surface p-4 text-right transition-colors hover:border-brand-200">
              <span className="flex items-center justify-end gap-1.5 text-caption text-ink-500">
                <L>Keyingi</L>
                <ArrowRight size={13} aria-hidden="true" />
              </span>
              <span className="mt-1 block text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">
                {next.label} — {chapterHeading(next)}
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </>
  );
}
