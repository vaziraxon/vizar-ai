import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { L } from "@/components/i18n/L";
import { CoverArt } from "@/components/knowledge/library/visuals";
import { AccessCard, LibraryError, LibraryHero, LibraryTabs, Paywall, SectionRow, chapterEmoji } from "@/components/knowledge/library/ui";
import { getLibraryViewer } from "@/lib/knowledge/access";
import { chapterHeading, getCountries, getOutline, readingMinutes, type LibraryCountry, type OutlineChapter } from "@/lib/knowledge/library";
import { libraryHref } from "@/lib/knowledge/offline";
import { chapterCover, sectionCountry, sectionEmoji } from "@/lib/knowledge/visuals";
import { cn } from "@/lib/utils";

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

function ChapterLink({ chapter, direction }: { chapter: OutlineChapter; direction: "prev" | "next" }) {
  const next = direction === "next";
  return (
    <Link
      href={`/knowledge-base/book/${chapter.slug}`}
      className={cn(
        "group flex items-center gap-4 overflow-hidden rounded-[22px] border border-surface-border bg-surface p-2 pr-5 transition-[border-color,box-shadow] duration-200 hover:border-violet-200 hover:shadow-card-hover",
        next && "flex-row-reverse pl-5 pr-2 text-right"
      )}
    >
      <CoverArt cover={chapterCover(chapter)} alt="" sizes="96px" className="h-16 w-24 shrink-0 rounded-2xl [&_span]:text-[22px]" />
      <span className="min-w-0">
        <span className={cn("flex items-center gap-1.5 text-caption text-ink-500", next && "justify-end")}>
          {next ? null : <ArrowLeft size={13} aria-hidden="true" />}
          <L>{next ? "Keyingi" : "Oldingi"}</L>
          {next ? <ArrowRight size={13} aria-hidden="true" /> : null}
        </span>
        <span className="mt-1 block text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">
          {chapterEmoji(chapter)} {chapter.label} — {chapterHeading(chapter)}
        </span>
      </span>
    </Link>
  );
}

export default async function ChapterPage({ params }: Params) {
  const viewer = await getLibraryViewer();
  if (!viewer.supabase) return <LibraryError />;

  let outline: OutlineChapter[];
  let countries: LibraryCountry[];
  try {
    [outline, countries] = await Promise.all([getOutline(viewer.supabase), getCountries(viewer.supabase)]);
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
  const cover = chapterCover(chapter);

  return (
    <>
      <LibraryHero
        breadcrumb={[{ href: "/knowledge-base", label: <L>Kutubxona</L> }]}
        photo={cover.photo}
        stickers={cover.photo ? undefined : cover.emojis}
        eyebrow={
          <>
            <span aria-hidden="true">{chapterEmoji(chapter)}</span> {chapter.label}
          </>
        }
        title={chapterHeading(chapter)}
        subtitle={
          <>
            📄 {chapter.sections.length} <L>bo‘lim</L> · ⏱ ~{readingMinutes(chapter.chars)} <L>daqiqalik o‘qish</L>
          </>
        }
        aside={<AccessCard viewer={viewer} next={here} />}
      />
      <LibraryTabs />

      <div className="container-page py-12 sm:py-16">
        <ol className="grid gap-x-4 rounded-[28px] border border-surface-border bg-surface p-2 sm:p-3 lg:grid-cols-2">
          {chapter.sections.map((s) => (
            <SectionRow
              key={s.slug}
              href={libraryHref.section(chapter.slug, s.slug)}
              number={s.number}
              title={s.isIntro ? <L>Bob haqida</L> : s.title}
              emoji={s.isIntro ? chapterEmoji(chapter) : sectionEmoji(s.title)}
              flag={s.isIntro ? null : sectionCountry(s.title, countries)}
              minutes={readingMinutes(s.chars)}
              locked={locked}
            />
          ))}
        </ol>

        {locked ? (
          <div className="mt-12">
            <Paywall viewer={viewer} next={here} title={<L>Bu bobning to‘liq matni obunachilar uchun</L>} />
          </div>
        ) : null}

        <nav aria-label="Boblar" className="mt-12 grid gap-3 md:grid-cols-2">
          {prev ? <ChapterLink chapter={prev} direction="prev" /> : <span />}
          {next ? <ChapterLink chapter={next} direction="next" /> : null}
        </nav>
      </div>
    </>
  );
}
