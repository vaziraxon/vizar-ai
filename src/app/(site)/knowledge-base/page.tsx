import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { L } from "@/components/i18n/L";
import { Plural, type PluralWord } from "@/components/i18n/Plural";
import { SearchForm } from "@/components/knowledge/library/SearchForm";
import { CountryFlag, CoverArt } from "@/components/knowledge/library/visuals";
import { AccessCard, LibraryError, LibraryTabs, Paywall, SectionRow, SrLabel, TranslationNote, chapterEmoji } from "@/components/knowledge/library/ui";
import { Marquee } from "@/components/site/Marquee";
import { EmojiSticker } from "@/components/site/primitives";
import { buttonClasses } from "@/components/ui/Button";
import { getRequestLanguage } from "@/lib/i18n/request-language";
import { getLibraryViewer } from "@/lib/knowledge/access";
import {
  REGIONS,
  chapterHeading,
  getCountries,
  getOutline,
  readingMinutes,
  type LibraryCountry,
  type OutlineChapter,
} from "@/lib/knowledge/library";
import { libraryHref } from "@/lib/knowledge/offline";
import { REGION_VISUALS, chapterCover, sectionCountry, sectionEmoji, topicEmoji } from "@/lib/knowledge/visuals";

export const dynamic = "force-dynamic";

const META = {
  uz: {
    title: "Viza ma’lumotlar bazasi",
    description:
      "VIZAR AI kitobining 9 bobi, davlatlar bo‘yicha viza qoidalari, viza turlari va hujjatlar — rasmiy manbalar bilan. To‘liq matn obunachilar uchun.",
  },
  ru: {
    title: "Визовая база знаний",
    description: "9 глав книги VIZAR AI, визовые правила по странам, типы виз и документы — с официальными источниками. Полный текст для подписчиков.",
  },
  en: {
    title: "Visa knowledge base",
    description: "The 9 chapters of the VIZAR AI book, visa rules by country, visa types and documents — with official sources. Full text for subscribers.",
  },
};

export function generateMetadata(): Metadata {
  return { ...META[getRequestLanguage()], alternates: { canonical: "/knowledge-base" } };
}

const QUICK_SEARCHES: { q: string; flag?: string; emoji?: string }[] = [
  { q: "Germaniya vizasi", flag: "DE" },
  { q: "AQSh B-1/B-2", flag: "US" },
  { q: "90/180 qoidasi", emoji: "📅" },
  { q: "Bank ko‘chirmasi", emoji: "🏦" },
  { q: "Yaponiya", flag: "JP" },
];

function SectionHeading({ id, emoji, eyebrow, title, subtitle, action }: { id: string; emoji: string; eyebrow: string; title: React.ReactNode; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">
          <span aria-hidden="true">{emoji}</span> <L>{eyebrow}</L>
        </p>
        <h2 id={id} className="mt-4 font-display text-display-md font-extrabold tracking-[-0.03em] text-ink-950">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-body text-ink-600">
            <L>{subtitle}</L>
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function TopicList({
  id,
  title,
  subtitle,
  chapter,
  countries,
  locked,
}: {
  id: string;
  title: string;
  subtitle: string;
  chapter: OutlineChapter | undefined;
  countries: LibraryCountry[];
  locked: boolean;
}) {
  if (!chapter) return null;
  const sections = chapter.sections.filter((s) => !s.isIntro && s.number);
  const cover = chapterCover(chapter);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-40">
      <div className="grid gap-6 lg:grid-cols-12">
        <Link
          href={`/knowledge-base/book/${chapter.slug}`}
          className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[28px] lg:sticky lg:top-40 lg:col-span-4 lg:h-[460px] lg:self-start"
        >
          <CoverArt cover={cover} alt="" sizes="(min-width: 1024px) 380px, 100vw" className="absolute inset-0" />
          <span className="relative m-3 rounded-[22px] bg-surface/90 p-5 backdrop-blur-md">
            <span className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">
              <span aria-hidden="true" className="text-[16px]">
                {chapterEmoji(chapter)}
              </span>
              {chapter.label} · {sections.length} <Plural n={sections.length} word="bo‘lim" />
            </span>
            <span id={`${id}-title`} className="mt-1.5 block font-display text-display-sm font-extrabold tracking-[-0.02em] text-ink-950">
              <L>{title}</L>
            </span>
            <span className="mt-1.5 block text-body-sm text-ink-600">
              <L>{subtitle}</L>
            </span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-700 group-hover:underline">
              <L>Bobni ochish</L>
              <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
        <div className="lg:col-span-8">
          {/* Phones show the first eight; the chapter page lists the rest */}
          <ul className="grid content-start rounded-[28px] border border-surface-border bg-surface p-2 sm:p-3 max-lg:[&>li:nth-child(n+9)]:hidden">
            {sections.map((s) => (
              <SectionRow
                key={s.slug}
                href={libraryHref.section(chapter.slug, s.slug)}
                number={s.number}
                title={s.title}
                emoji={sectionEmoji(s.titleSrc)}
                flag={sectionCountry(s.titleSrc, countries)}
                locked={locked}
              />
            ))}
          </ul>
          {sections.length > 8 ? (
            <Link
              href={`/knowledge-base/book/${chapter.slug}`}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-surface-border bg-surface px-4 py-3 text-body-sm font-semibold text-brand-700 lg:hidden"
            >
              <L vars={{ n: sections.length }}>{"Barcha {n} bo‘limni ko‘rish"}</L>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CountryCard({ country }: { country: LibraryCountry }) {
  const icons = Array.from(new Set(country.topics.map(topicEmoji))).slice(0, 4);
  return (
    <Link
      href={libraryHref.country(country.code)}
      className="group flex h-full items-center gap-2.5 rounded-2xl border border-surface-border bg-surface p-2.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-card-hover sm:gap-3 sm:p-3"
    >
      <CountryFlag code={country.code} size="md" className="max-sm:h-6 max-sm:w-9" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">{country.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-caption text-ink-500">
          <span aria-hidden="true" className="tracking-[0.08em]">
            {icons.join("")}
          </span>
          <span>
            {country.ruleCount} <Plural n={country.ruleCount} word="qoida" />
          </span>
        </span>
      </span>
    </Link>
  );
}

export default async function KnowledgeBasePage() {
  const viewer = await getLibraryViewer();
  if (!viewer.supabase) return <LibraryError />;
  const lang = getRequestLanguage();

  let outline: OutlineChapter[];
  let countries: LibraryCountry[];
  let stats: { sections?: number; sources?: number } | null;
  try {
    [outline, countries, stats] = await Promise.all([
      getOutline(viewer.supabase, lang),
      getCountries(viewer.supabase, lang),
      viewer.supabase.rpc("kb_stats").then((r) => (r.data as { sections?: number; sources?: number } | null) ?? null),
    ]);
  } catch (error) {
    console.error("[knowledge-base]", error);
    return <LibraryError />;
  }

  const locked = !viewer.hasAccess;
  // "EU" holds the Schengen-wide rules; it is listed with the countries but is not one.
  const realCountries = countries.filter((c) => c.code !== "EU");
  const chapters = outline.filter((c) => c.kind === "chapter");
  const extras = outline.filter((c) => c.kind !== "chapter");
  const visaTypes = chapters.find((c) => c.number === 1);
  const documents = chapters.find((c) => c.number === 2);
  const figures: { emoji: string; value: number; label: PluralWord }[] = [
    { emoji: "📚", value: chapters.length, label: "bob" },
    { emoji: "📄", value: stats?.sections ?? outline.reduce((n, c) => n + c.sections.length, 0), label: "bo‘lim" },
    { emoji: "🌍", value: realCountries.length, label: "davlat" },
    ...(stats?.sources ? [{ emoji: "🔗", value: stats.sources, label: "rasmiy manba" as const }] : []),
  ];

  return (
    <>
      {/* Hero: copy + search on the left, a travel-photo collage on the right */}
      <section className="hero-sky grain relative overflow-hidden">
        <div className="container-page relative grid gap-10 pb-12 pt-28 sm:pt-36 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-16 lg:pt-40">
          <div className="animate-fade-up lg:col-span-6">
            <p className="eyebrow">
              <span aria-hidden="true">📚</span> <L>Premium kutubxona</L>
            </p>
            <h1 className="mt-4 font-display text-display-lg font-extrabold tracking-[-0.04em] text-ink-950 sm:text-display-xl">
              <L>Viza ma’lumotlar bazasi</L>
            </h1>
            <p className="mt-4 max-w-xl text-body-lg text-ink-700">
              <L>VIZAR AI kitobining to‘liq matni: viza turlari, hujjatlar, topshirish jarayoni, suhbat va davlatlar bo‘yicha qoidalar — rasmiy manbalar bilan.</L>
            </p>
            {lang !== "uz" ? <TranslationNote className="mt-4 max-w-xl" /> : null}
            <SearchForm className="mt-7 max-w-xl" />
            <SrLabel id="kb-quick-search" text="Tez qidiruv" />
            <ul className="mt-4 flex flex-wrap gap-2" aria-labelledby="kb-quick-search">
              {QUICK_SEARCHES.map((s) => (
                <li key={s.q}>
                  <Link
                    href={`/knowledge-base/search?q=${encodeURIComponent(s.q)}`}
                    className="inline-flex items-center gap-2 rounded-pill border border-white/80 bg-surface/80 px-3 py-1.5 text-body-sm font-medium text-ink-800 backdrop-blur transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-white/10"
                  >
                    {s.flag ? <CountryFlag code={s.flag} size="xs" /> : <span aria-hidden="true">{s.emoji}</span>}
                    <L>{s.q}</L>
                  </Link>
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {figures.map((f) => (
                <div key={f.label} className="flex flex-col-reverse justify-end rounded-2xl border border-white/80 bg-surface/75 px-3.5 py-3 backdrop-blur dark:border-white/10">
                  <dt className="mt-1.5 flex items-center gap-1.5 text-caption font-medium leading-tight text-ink-600">
                    <span aria-hidden="true">{f.emoji}</span>
                    <Plural n={f.value} word={f.label} />
                  </dt>
                  <dd className="font-accent text-[30px] italic leading-none text-ink-950 tabular-nums">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-6">
            {/* Collage (decorative): three destinations, tilted like postcards */}
            <div aria-hidden="true" className="relative mx-auto hidden h-[540px] max-w-[540px] lg:block">
              <figure className="absolute left-0 top-6 h-[300px] w-[230px] -rotate-6 overflow-hidden rounded-[28px] border-4 border-white shadow-float dark:border-white/10">
                <Image src="/images/destinations/schengen.webp" alt="" fill priority sizes="230px" className="object-cover" />
                <span className="absolute left-3 top-3"><CountryFlag code="EU" size="sm" /></span>
              </figure>
              <figure className="absolute left-[34%] top-0 z-10 h-[320px] w-[240px] rotate-2 overflow-hidden rounded-[28px] border-4 border-white shadow-float dark:border-white/10">
                <Image src="/images/destinations/jp.webp" alt="" fill priority sizes="240px" className="object-cover" />
                <span className="absolute left-3 top-3"><CountryFlag code="JP" size="sm" /></span>
              </figure>
              <figure className="absolute right-0 top-16 h-[280px] w-[210px] rotate-[8deg] overflow-hidden rounded-[28px] border-4 border-white shadow-float dark:border-white/10">
                <Image src="/images/destinations/us.webp" alt="" fill priority sizes="210px" className="object-cover" />
                <span className="absolute left-3 top-3"><CountryFlag code="US" size="sm" /></span>
              </figure>
              <EmojiSticker emoji="🛂" tilt={-12} className="absolute -left-4 top-[300px] z-20" />
              <EmojiSticker emoji="✈️" size="sm" tilt={10} delay={900} className="absolute right-6 top-0 z-20" />
            </div>
            <div aria-hidden="true" className="grid grid-cols-3 gap-2.5 lg:hidden">
              {[
                { src: "/images/destinations/schengen.webp", code: "EU" },
                { src: "/images/destinations/jp.webp", code: "JP" },
                { src: "/images/destinations/us.webp", code: "US" },
              ].map(({ src, code }) => (
                <figure key={code} className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-white shadow-card dark:border-white/10">
                  <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
                  <span className="absolute left-2 top-2"><CountryFlag code={code} size="xs" /></span>
                </figure>
              ))}
            </div>
            <div className="relative z-30 mt-4 lg:absolute lg:bottom-0 lg:left-12 lg:right-0 lg:mt-0">
              <AccessCard viewer={viewer} next="/knowledge-base" />
            </div>
          </div>
        </div>

        {/* Every country in the library, as a slow flag ribbon */}
        <div className="relative pb-8">
          <Marquee duration={90}>
            {realCountries.map((c) => (
              <span
                key={c.code}
                className="inline-flex items-center gap-2 rounded-pill border border-white/80 bg-surface/80 py-1.5 pl-1.5 pr-3.5 text-body-sm font-semibold text-ink-800 backdrop-blur dark:border-white/10"
              >
                <CountryFlag code={c.code} size="sm" className="rounded-pill" />
                {c.name}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <LibraryTabs active="home" />

      <div className="container-page space-y-24 py-14 sm:py-20">
        {/* Chapters */}
        <section id="boblar" aria-labelledby="boblar-title" className="scroll-mt-40">
          <SectionHeading id="boblar-title" emoji="📚" eyebrow="Kitob" title={<L>To‘qqiz bob</L>} />
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((c, i) => {
              const cover = chapterCover(c);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/knowledge-base/book/${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-surface-border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-float"
                  >
                    <CoverArt
                      cover={cover}
                      alt={chapterHeading(c)}
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      priority={i < 3}
                      className="aspect-[16/10]"
                    >
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-surface/90 px-3 py-1 text-caption font-bold text-ink-900 backdrop-blur">
                        <span aria-hidden="true">{chapterEmoji(c)}</span>
                        {c.label}
                      </span>
                    </CoverArt>
                    <span className="flex flex-1 flex-col p-5">
                      <span className="font-display text-[19px] font-bold leading-snug text-ink-950 group-hover:text-brand-700">{chapterHeading(c)}</span>
                      <span className="mt-auto flex items-center justify-between pt-4 text-caption text-ink-500">
                        <span>
                          📄 {c.sections.length} <Plural n={c.sections.length} word="bo‘lim" /> · ⏱ ~{readingMinutes(c.chars)} <L>daq</L>
                        </span>
                        <ArrowRight size={16} aria-hidden="true" className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-600" />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          {extras.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
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

        {/* Countries by region: a photo banner, then flag cards */}
        <section id="davlatlar" aria-labelledby="davlatlar-title" className="scroll-mt-40">
          <SectionHeading
            id="davlatlar-title"
            emoji="🌍"
            eyebrow="Davlatlar"
            title={<L vars={{ n: realCountries.length }}>{"{n} davlat bo‘yicha qoidalar"}</L>}
            subtitle="Har bir davlat uchun murojaat yo‘li, hujjatlar va kirish tartibi — rasmiy manbalar havolasi va oxirgi tekshiruv holati bilan."
          />
          <div className="mt-10 space-y-12">
            {REGIONS.map((region) => {
              const list = countries.filter((c) => c.region === region.id);
              if (!list.length) return null;
              const visual = REGION_VISUALS[region.id];
              return (
                <div key={region.id} className="grid gap-4 lg:grid-cols-12">
                  <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[28px] bg-night-950 p-6 text-white lg:sticky lg:top-40 lg:col-span-4 lg:min-h-[340px] lg:self-start">
                    <Image src={visual.photo} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover opacity-80" />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/40 to-transparent" />
                    <span className="relative">
                      <span className="flex items-center gap-2">
                        {visual.flag ? <CountryFlag code={visual.flag} size="sm" /> : <span aria-hidden="true" className="text-[22px]">{visual.emoji}</span>}
                        <span className="rounded-pill bg-white/15 px-2.5 py-0.5 text-caption font-semibold backdrop-blur">
                          {list.filter((c) => c.code !== "EU").length} <Plural n={list.filter((c) => c.code !== "EU").length} word="davlat" />
                        </span>
                      </span>
                      <h3 className="mt-3 font-display text-display-sm font-extrabold tracking-[-0.02em]">
                        <L>{region.title}</L>
                      </h3>
                      <p className="mt-1 text-body-sm text-white/80">
                        <L>{visual.blurb}</L>
                      </p>
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 content-start gap-2 sm:grid-cols-3 sm:gap-2.5 lg:col-span-8">
                    {list.map((c) => (
                      <li key={c.code}>
                        <CountryCard country={c} />
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
          title="Viza turlari"
          subtitle="Turistik, biznes, talaba, tranzit, e-Visa va vizasiz kirish: qaysi viza qachon kerakligi va unda nima yozilgani."
          chapter={visaTypes}
          countries={countries}
          locked={locked}
        />

        <TopicList
          id="hujjatlar"
          title="Hujjatlar"
          subtitle="Pasport, anketa, bank ko‘chirmasi, ish joyi ma’lumotnomasi, homiylik va safar rejasi — har bir hujjat nimani isbotlashi kerak."
          chapter={documents}
          countries={countries}
          locked={locked}
        />

        {locked ? <Paywall viewer={viewer} next="/knowledge-base" title={<L>Kutubxonaning to‘liq matnini oching</L>} /> : null}

        {/* The AI consultant lives on its own page; this only points to it */}
        <section className="relative overflow-hidden rounded-[32px] bg-night-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <span aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl" />
          <span aria-hidden="true" className="absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-3 py-1 text-[13px] font-medium">
                <span aria-hidden="true">🤖</span> <L>AI maslahatchi</L>
              </p>
              <h2 className="mt-4 font-display text-display-md font-extrabold tracking-[-0.03em]">
                <L>Savolingiz bormi? AI maslahatchidan so‘rang</L>
              </h2>
              <p className="mt-3 max-w-2xl text-body text-white/75">
                <L>Maslahatchi shu kitob asosida javob beradi va har bir javob ostida bob hamda manbani ko‘rsatadi.</L>
              </p>
              <Link href="/dashboard/assistant" className={buttonClasses({ size: "lg", className: "mt-6 bg-white text-brand-deep hover:bg-brand-50" })}>
                <L>Savol berish</L>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div aria-hidden="true" className="hidden justify-center gap-3 lg:col-span-4 lg:flex">
              <EmojiSticker emoji="💬" tilt={-8} />
              <EmojiSticker emoji="📖" size="lg" tilt={6} delay={800} />
              <EmojiSticker emoji="✅" tilt={-3} delay={1600} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
