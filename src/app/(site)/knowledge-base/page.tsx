import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { L } from "@/components/i18n/L";
import { SearchForm } from "@/components/knowledge/library/SearchForm";
import {
  AccessCard,
  CountryMark,
  LibraryError,
  LibraryHero,
  LibraryTabs,
  Paywall,
  SectionRow,
  chapterEmoji,
} from "@/components/knowledge/library/ui";
import { getLibraryViewer } from "@/lib/knowledge/access";
import { REGIONS, chapterHeading, getCountries, getOutline, readingMinutes, type OutlineChapter } from "@/lib/knowledge/library";
import { libraryHref } from "@/lib/knowledge/offline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Viza ma’lumotlar bazasi",
  description:
    "VIZAR AI kitobining 9 bobi, davlatlar bo‘yicha viza qoidalari, viza turlari va hujjatlar — rasmiy manbalar bilan. To‘liq matn obunachilar uchun.",
  alternates: { canonical: "/knowledge-base" },
};

function TopicList({ id, emoji, title, subtitle, chapter, locked }: { id: string; emoji: string; title: string; subtitle: string; chapter: OutlineChapter | undefined; locked: boolean }) {
  if (!chapter) return null;
  const sections = chapter.sections.filter((s) => !s.isIntro && s.number);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true">{emoji}</span> {chapter.label}
          </p>
          <h2 id={`${id}-title`} className="mt-4 font-display text-display-md font-extrabold tracking-[-0.03em] text-ink-950">
            <L>{title}</L>
          </h2>
          <p className="mt-2 max-w-2xl text-body text-ink-600">
            <L>{subtitle}</L>
          </p>
        </div>
        <Link href={`/knowledge-base/book/${chapter.slug}`} className="inline-flex shrink-0 items-center gap-1.5 text-body-sm font-semibold text-brand-700 hover:underline">
          <L>Bobni ochish</L>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <ul className="mt-6 grid gap-x-6 rounded-[28px] border border-surface-border bg-surface p-2 sm:p-3 lg:grid-cols-2">
        {sections.map((s) => (
          <SectionRow key={s.slug} href={libraryHref.section(chapter.slug, s.slug)} number={s.number} title={s.title} locked={locked} />
        ))}
      </ul>
    </section>
  );
}

export default async function KnowledgeBasePage() {
  const viewer = await getLibraryViewer();
  if (!viewer.supabase) return <LibraryError />;

  let outline: OutlineChapter[];
  let countries: Awaited<ReturnType<typeof getCountries>>;
  let stats: { sections?: number; sources?: number } | null;
  try {
    [outline, countries, stats] = await Promise.all([
      getOutline(viewer.supabase),
      getCountries(viewer.supabase),
      viewer.supabase.rpc("kb_stats").then((r) => (r.data as { sections?: number; sources?: number } | null) ?? null),
    ]);
  } catch (error) {
    console.error("[knowledge-base]", error);
    return <LibraryError />;
  }

  const locked = !viewer.hasAccess;
  const chapters = outline.filter((c) => c.kind === "chapter");
  const extras = outline.filter((c) => c.kind !== "chapter");
  const visaTypes = chapters.find((c) => c.number === 1);
  const documents = chapters.find((c) => c.number === 2);
  const figures = [
    { value: chapters.length, label: "bob" },
    { value: stats?.sections ?? outline.reduce((n, c) => n + c.sections.length, 0), label: "bo‘lim" },
    { value: countries.length, label: "davlat" },
    ...(stats?.sources ? [{ value: stats.sources, label: "rasmiy manba" }] : []),
  ];

  return (
    <>
      <LibraryHero
        eyebrow={
          <>
            <span aria-hidden="true">📚</span> <L>Premium kutubxona</L>
          </>
        }
        title={<L>Viza ma’lumotlar bazasi</L>}
        subtitle={<L>VIZAR AI kitobining to‘liq matni: viza turlari, hujjatlar, topshirish jarayoni, suhbat va davlatlar bo‘yicha qoidalar — rasmiy manbalar bilan.</L>}
        aside={<AccessCard viewer={viewer} next="/knowledge-base" />}
      >
        <SearchForm className="mt-7 max-w-xl" />
        <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
          {figures.map((f) => (
            <div key={f.label}>
              <dt className="sr-only">
                <L>{f.label}</L>
              </dt>
              <dd className="flex items-baseline gap-1.5">
                <span className="font-display text-display-sm font-extrabold tabular-nums text-ink-950">{f.value}</span>
                <span className="text-body-sm text-ink-600">
                  <L>{f.label}</L>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </LibraryHero>

      <LibraryTabs active="home" />

      <div className="container-page space-y-20 py-14 sm:py-20">
        {/* Chapters */}
        <section id="boblar" aria-labelledby="boblar-title" className="scroll-mt-40">
          <p className="eyebrow">
            <span aria-hidden="true">📚</span> <L>Kitob</L>
          </p>
          <h2 id="boblar-title" className="mt-4 font-display text-display-md font-extrabold tracking-[-0.03em] text-ink-950">
            <L>To‘qqiz bob</L>
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/knowledge-base/book/${c.slug}`}
                  className="group flex h-full flex-col rounded-[28px] border border-surface-border bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-float"
                >
                  <div className="flex items-center justify-between">
                    <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-[24px] dark:bg-white/10">
                      {chapterEmoji(c)}
                    </span>
                    <span className="rounded-pill bg-surface-tint px-2.5 py-1 text-caption font-semibold text-ink-600">{c.label}</span>
                  </div>
                  <p className="mt-5 font-display text-[19px] font-bold leading-snug text-ink-950 group-hover:text-brand-700">{chapterHeading(c)}</p>
                  <p className="mt-auto pt-5 text-caption text-ink-500">
                    {c.sections.length} <L>bo‘lim</L> · ~{readingMinutes(c.chars)} <L>daq</L>
                  </p>
                </Link>
              </li>
            ))}
          </ol>
          {extras.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {extras.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/knowledge-base/book/${c.slug}`}
                    className="inline-flex items-center gap-2 rounded-pill border border-surface-border bg-surface px-3.5 py-2 text-body-sm font-medium text-ink-800 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    <span aria-hidden="true">{chapterEmoji(c)}</span>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* Countries */}
        <section id="davlatlar" aria-labelledby="davlatlar-title" className="scroll-mt-40">
          <p className="eyebrow">
            <span aria-hidden="true">🌍</span> <L>Davlatlar</L>
          </p>
          <h2 id="davlatlar-title" className="mt-4 font-display text-display-md font-extrabold tracking-[-0.03em] text-ink-950">
            <L vars={{ n: countries.length }}>{"{n} davlat bo‘yicha qoidalar"}</L>
          </h2>
          <p className="mt-2 max-w-2xl text-body text-ink-600">
            <L>Har bir davlat uchun murojaat yo‘li, hujjatlar va kirish tartibi — rasmiy manbalar havolasi va oxirgi tekshiruv holati bilan.</L>
          </p>
          <div className="mt-8 space-y-8">
            {REGIONS.map((region) => {
              const list = countries.filter((c) => c.region === region.id);
              if (!list.length) return null;
              return (
                <div key={region.id}>
                  <h3 className="flex items-center gap-2 text-body font-semibold text-ink-900">
                    <span aria-hidden="true">{region.emoji}</span>
                    <L>{region.title}</L>
                    <span className="text-caption font-medium text-ink-500">· {list.length}</span>
                  </h3>
                  <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {list.map((c) => (
                      <li key={c.code}>
                        <Link
                          href={libraryHref.country(c.code)}
                          className="group flex items-center gap-3 rounded-2xl border border-surface-border bg-surface p-2.5 pr-3 transition-colors hover:border-brand-200 hover:bg-surface-tint"
                        >
                          <CountryMark code={c.code} />
                          <span className="min-w-0">
                            <span className="block truncate text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">{c.name}</span>
                            <span className="block text-caption text-ink-500">
                              {c.ruleCount} <L>qoida</L>
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <TopicList
          id="viza-turlari"
          emoji="🛂"
          title="Viza turlari"
          subtitle="Turistik, biznes, talaba, tranzit, e-Visa va vizasiz kirish: qaysi viza qachon kerakligi va unda nima yozilgani."
          chapter={visaTypes}
          locked={locked}
        />

        <TopicList
          id="hujjatlar"
          emoji="📑"
          title="Hujjatlar"
          subtitle="Pasport, anketa, bank ko‘chirmasi, ish joyi ma’lumotnomasi, homiylik va safar rejasi — har bir hujjat nimani isbotlashi kerak."
          chapter={documents}
          locked={locked}
        />

        {locked ? (
          <Paywall viewer={viewer} next="/knowledge-base" title={<L>Kutubxonaning to‘liq matnini oching</L>} />
        ) : null}

        <Link
          href="/dashboard/assistant"
          className="group flex flex-col gap-4 rounded-[28px] border border-surface-border bg-surface p-6 transition-colors hover:border-brand-200 sm:flex-row sm:items-center sm:p-8"
        >
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-white/10 dark:text-violet-300">
            <Bot size={24} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-[19px] font-bold text-ink-950">
              <L>Savolingiz bormi? AI maslahatchidan so‘rang</L>
            </span>
            <span className="mt-1 block text-body-sm text-ink-600">
              <L>Maslahatchi shu kitob asosida javob beradi va har bir javob ostida bob hamda manbani ko‘rsatadi.</L>
            </span>
          </span>
          <ArrowRight size={18} aria-hidden="true" className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </Link>
      </div>
    </>
  );
}
