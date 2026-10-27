import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { L } from "@/components/i18n/L";
import { Markdown } from "@/components/knowledge/Markdown";
import { LibraryError, LibraryTabs, LockIcon, Paywall, chapterEmoji } from "@/components/knowledge/library/ui";
import { getLibraryViewer } from "@/lib/knowledge/access";
import {
  chapterHeading,
  getOutline,
  getSectionContent,
  getSectionPreview,
  readingMinutes,
  sectionLabel,
} from "@/lib/knowledge/library";
import { libraryHref } from "@/lib/knowledge/offline";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: { chapter: string; section: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const viewer = await getLibraryViewer();
  const section = viewer.supabase ? await getSectionPreview(viewer.supabase, params.chapter, params.section).catch(() => null) : null;
  if (!section) return {};
  return {
    title: `${sectionLabel({ number: section.sectionNumber, title: section.sectionTitle })} — ${section.chapterLabel}`,
    description: section.preview,
    alternates: { canonical: libraryHref.section(section.chapterSlug, section.sectionSlug) },
  };
}

export default async function SectionPage({ params }: Params) {
  const viewer = await getLibraryViewer();
  if (!viewer.supabase) return <LibraryError />;

  let section: Awaited<ReturnType<typeof getSectionPreview>>;
  let outline: Awaited<ReturnType<typeof getOutline>>;
  try {
    [section, outline] = await Promise.all([getSectionPreview(viewer.supabase, params.chapter, params.section), getOutline(viewer.supabase)]);
  } catch (error) {
    console.error("[knowledge-base/section]", error);
    return <LibraryError />;
  }
  if (!section) notFound();

  // Full text only through RLS: null unless kb_has_access() is true right now.
  const content = viewer.hasAccess ? await getSectionContent(viewer.supabase, section.sectionId) : null;
  const chapter = outline.find((c) => c.slug === section.chapterSlug);
  const here = libraryHref.section(section.chapterSlug, section.sectionSlug);
  const title = section.isIntro ? chapterHeading({ label: section.chapterLabel, title: section.chapterTitle }) : section.sectionTitle;

  return (
    <>
      <section className="hero-sky-soft grain relative overflow-hidden">
        <div className="container-page relative pb-8 pt-28 sm:pb-10 sm:pt-36 lg:pt-40">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-body-sm text-ink-500">
              <li>
                <Link href="/knowledge-base" className="hover:text-brand-700">
                  <L>Kutubxona</L>
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/knowledge-base/book/${section.chapterSlug}`} className="hover:text-brand-700">
                  {section.chapterLabel}
                </Link>
              </li>
            </ol>
          </nav>
          <div className="mt-5 max-w-3xl animate-fade-up">
            <p className="eyebrow">
              <span aria-hidden="true">{chapter ? chapterEmoji(chapter) : "📘"}</span>
              {section.sectionNumber ? `${section.chapterLabel} · ${section.sectionNumber}` : section.chapterLabel}
            </p>
            <h1 className="mt-4 font-display text-display-md font-extrabold tracking-[-0.03em] text-ink-950 sm:text-display-lg">{title}</h1>
            <p className="mt-4 flex items-center gap-2 text-body-sm text-ink-500">
              <Clock size={15} aria-hidden="true" />~{readingMinutes(section.chars)} <L>daqiqalik o‘qish</L>
            </p>
          </div>
        </div>
      </section>
      <LibraryTabs />

      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-12">
        <article className="min-w-0 lg:col-span-8">
          {content !== null ? (
            <div className="rounded-[28px] border border-surface-border bg-surface p-5 text-body-lg leading-relaxed text-ink-800 sm:p-9">
              <Markdown source={content} />
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-[28px] border border-surface-border bg-surface p-5 sm:p-9">
                <p className="text-body-lg leading-relaxed text-ink-800">{section.preview}…</p>
                <div aria-hidden="true" className="mt-4 space-y-3 blur-[3px]">
                  {[92, 100, 86, 97, 74].map((w, i) => (
                    <div key={i} className="h-3.5 rounded-full bg-surface-muted" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface to-transparent" />
              </div>
              <div className="mt-6">
                <Paywall viewer={viewer} next={here} title={<L>Bo‘limning davomi obunachilar uchun</L>} />
              </div>
            </>
          )}

          <nav aria-label="Bo‘limlar" className="mt-8 grid gap-3 sm:grid-cols-2">
            {section.prev ? (
              <Link
                href={libraryHref.section(section.chapterSlug, section.prev.slug)}
                className="group rounded-2xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand-200"
              >
                <span className="flex items-center gap-1.5 text-caption text-ink-500">
                  <ArrowLeft size={13} aria-hidden="true" />
                  <L>Oldingi bo‘lim</L>
                </span>
                <span className="mt-1 block text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">{section.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {section.next ? (
              <Link
                href={libraryHref.section(section.chapterSlug, section.next.slug)}
                className="group rounded-2xl border border-surface-border bg-surface p-4 text-right transition-colors hover:border-brand-200"
              >
                <span className="flex items-center justify-end gap-1.5 text-caption text-ink-500">
                  <L>Keyingi bo‘lim</L>
                  <ArrowRight size={13} aria-hidden="true" />
                </span>
                <span className="mt-1 block text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">{section.next.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>

        {chapter ? (
          <aside className="lg:col-span-4">
            <div className="rounded-[28px] border border-surface-border bg-surface p-4 lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
              <Link href={`/knowledge-base/book/${chapter.slug}`} className="block px-2 pb-3 pt-1">
                <span className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{chapter.label}</span>
                <span className="mt-1 block font-display text-body font-bold text-ink-950 hover:text-brand-700">{chapterHeading(chapter)}</span>
              </Link>
              <ol className="space-y-0.5 border-t border-surface-border pt-2">
                {chapter.sections.map((s) => {
                  const current = s.slug === section.sectionSlug;
                  return (
                    <li key={s.slug}>
                      <Link
                        href={libraryHref.section(chapter.slug, s.slug)}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-2 rounded-xl px-2 py-2 text-body-sm transition-colors",
                          current ? "bg-brand-50 font-semibold text-brand-800 dark:bg-white/10 dark:text-white" : "text-ink-700 hover:bg-surface-tint hover:text-brand-700"
                        )}
                      >
                        <span className="w-11 shrink-0 tabular-nums text-ink-500">{s.number ?? "•"}</span>
                        <span className="min-w-0 flex-1">{s.isIntro ? <L>Bob haqida</L> : s.title}</span>
                        {!viewer.hasAccess ? <LockIcon className="mt-0.5" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}
