"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ToolIndex } from "@/components/site/ToolCards";
import { DestinationGrid } from "@/components/site/DestinationCards";
import { PricingPlans } from "@/components/site/PricingPlans";
import { Accordion } from "@/components/site/Accordion";
import { FinalCTA } from "@/components/site/FinalCTA";
import { LandingFonts } from "@/components/site/LandingFonts";
import { Flag } from "@/components/site/Flag";
import { HeroSky } from "@/components/site/home/HeroSky";
import { EmojiTile, GoldUnderline, PillArrow, StatusPill, VIOLET_PILL } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG, PHOTO_CREDITS, type DestinationSlug } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

// Same order as destinationsPage.docs in every language, then the Schengen extra.
const DOC_EMOJI = ["🛂", "📸", "📝", "🏦", "🧳", "💼", "🩺"];

/* /features ---------------------------------------------------------------- */

export function FeaturesPage() {
  const site = useSite();
  return (
    <div className="landing-lime bg-surface-canvas">
      <LandingFonts />
      <PageHero tone="lime" emoji="🧰" decor={["🎯", "📄", "🎤"]} eyebrow={site.toolsPage.eyebrow} title={site.toolsPage.title} subtitle={site.toolsPage.subtitle} />
      <section className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page">
          <ToolIndex />
        </div>
      </section>
      <FinalCTA tone="lime" />
    </div>
  );
}

/* /how-it-works ------------------------------------------------------------ */

export function HowItWorksPage() {
  const site = useSite();
  const how = site.howPage;
  return (
    <>
      <PageHero emoji="🚀" decor={["📝", "🤖", "🗂️"]} eyebrow={how.eyebrow} title={how.title} subtitle={how.subtitle} />

      {/* Steps — a long-form sequence with a rail on the left */}
      <section className="section pt-10 md:pt-14 lg:pt-14">
        <div className="container-page">
          <ol className="border-t border-surface-border">
            {how.steps.map((step, i) => (
              <li key={step.title} data-reveal className="grid gap-6 border-b border-surface-border py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                <div className="lg:col-span-2">
                  <span className="flex items-center gap-3">
                    <EmojiTile emoji={["📝", "🤖", "🗂️"][i]!} size="lg" />
                    <span className="font-display text-[28px] font-bold leading-none tracking-[-0.04em] text-violet-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <div className="mt-4 flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((seg) => (
                      <span key={seg} className={cn("h-1 w-6 rounded-full", seg <= i ? "bg-brand-600" : "bg-surface-muted")} />
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <h2 className="font-display text-display-md text-ink-900">{step.title}</h2>
                  <p className="mt-3 text-body-lg text-ink-600">{step.desc}</p>
                </div>
                <ul className="space-y-3 lg:col-span-4 lg:col-start-9 lg:pt-2">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-body text-ink-800">
                      <Check size={16} strokeWidth={2.4} className="mt-1 shrink-0 text-brand-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Outcomes — three columns of text divided by rules */}
      <section aria-labelledby="outcomes-title" className="pb-section-y-sm md:pb-section-y-md">
        <div className="container-page">
          <h2 id="outcomes-title" data-reveal className="font-display text-display-lg text-ink-900">
            {how.outcomesTitle}
          </h2>
          <div data-reveal className="mt-10 grid gap-8 border-t border-surface-border pt-8 md:grid-cols-3 md:gap-0">
            {how.outcomes.map((o, i) => (
              <div key={o.title} className={cn("md:px-8", i === 0 && "md:pl-0", i > 0 && "md:border-l md:border-surface-border")}>
                <h3 className="flex items-center gap-2.5 font-display text-display-sm text-ink-900">
                  <span aria-hidden="true">{["🧭", "🗂️", "💪"][i]}</span>
                  {o.title}
                </h3>
                <p className="mt-2 text-body text-ink-600">{o.desc}</p>
              </div>
            ))}
          </div>

          <div data-reveal className="mt-20 grid gap-8 rounded-2xl bg-surface-tint p-7 sm:p-10 lg:grid-cols-12">
            <h2 className="font-display text-display-md text-ink-900 lg:col-span-4">{how.honestyTitle}</h2>
            <ul className="space-y-5 lg:col-span-8">
              {how.honesty.map((h) => (
                <li key={h.title} className="flex gap-4">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-[16px] leading-none">🚫</span>
                  <div>
                    <p className="text-body font-semibold text-ink-900">{h.title}</p>
                    <p className="mt-0.5 text-body-sm text-ink-600">{h.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

/* /pricing ----------------------------------------------------------------- */

export function PricingPage() {
  const site = useSite();
  const p = site.pricing;
  return (
    <>
      <PageHero emoji="💎" decor={["📄", "⭐", "👑"]} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
      <section className="pb-section-y-sm pt-10 md:pb-section-y-md md:pt-14">
        <div className="container-page">
          <PricingPlans />
          <p className="mt-8 text-center text-body-sm text-ink-600">💳 {p.note}</p>
        </div>
      </section>

      <section aria-labelledby="pricing-faq" className="pb-section-y-sm md:pb-section-y-md">
        <div className="container-page grid max-w-5xl gap-10 lg:grid-cols-12">
          <h2 id="pricing-faq" data-reveal className="font-display text-display-md text-ink-900 lg:col-span-4">
            {p.faqTitle}
          </h2>
          <div data-reveal className="lg:col-span-8">
            <Accordion items={p.faq} defaultOpen={null} />
          </div>
        </div>
      </section>
      <FinalCTA secondaryHref="/faq" secondaryLabel={site.footer.faq} />
    </>
  );
}

/* /faq --------------------------------------------------------------------- */

export function FaqPage() {
  const site = useSite();
  return (
    <>
      <PageHero emoji="💬" decor={["❓", "💡", "✅"]} eyebrow={site.faq.eyebrow} title={site.faq.title} subtitle={site.faq.subtitle} />
      <section className="section pt-10 md:pt-14 lg:pt-14">
        <div data-reveal className="container-page max-w-3xl">
          <Accordion items={site.faq.items} />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

/* /destinations ------------------------------------------------------------ */

export function DestinationsIndexPage() {
  const site = useSite();
  const d = site.destinationsPage;
  return (
    <div className="landing-lime bg-surface-canvas">
      <LandingFonts />
      <PageHero tone="lime" emoji="🌍" decor={["🗽", "🗻", "🗼"]} eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <section className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page">
          <DestinationGrid />
          <p className="mt-8 text-center text-body-sm text-ink-500">{site.nav.destinationsNote}</p>
        </div>
      </section>
      <FinalCTA tone="lime" />
    </div>
  );
}

export function DestinationPage({ slug }: { slug: DestinationSlug }) {
  const site = useSite();
  const page = site.destinationsPage;
  const meta = DESTINATION_BY_SLUG[slug];
  const copy = site.destinations[slug];
  const docs = slug === "schengen" ? [...page.docs, page.schengenExtra] : page.docs;

  return (
    <div className="landing-lime bg-surface-canvas">
      <LandingFonts />
      <section className="lime-wash grain relative overflow-hidden">
        <HeroSky calm />
        <div className="container-page relative pb-12 pt-28 sm:pt-36 lg:pb-16 lg:pt-40">
          <Link
            href="/destinations"
            className="inline-flex animate-fade-up items-center gap-1.5 rounded-pill text-body-sm font-semibold text-ink-800 transition-colors hover:text-brand-700"
          >
            <ChevronLeft size={17} />
            {page.eyebrow}
          </Link>
          <div
            className="mt-6 grid animate-fade-up gap-3 rounded-[32px] border border-white dark:border-white/10 bg-surface/70 p-2.5 shadow-float backdrop-blur-xl sm:p-3 lg:grid-cols-12"
            style={{ animationDelay: "60ms" }}
          >
            <div className="flex min-w-0 flex-col justify-center rounded-[24px] bg-gradient-to-br from-brand-50 via-surface to-violet-50 p-6 sm:p-9 lg:col-span-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-body-sm font-semibold text-brand-700">📍 {copy.region}</p>
                <Flag code={meta.flag} size={56} className="shrink-0 shadow-card ring-4 ring-surface" />
              </div>
              <h1 className="luxe-firm mt-3 break-words font-luxe text-[clamp(1.9rem,8.6vw,2.7rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-950 sm:text-[3.4rem] lg:text-[clamp(2.6rem,3.9vw,3.5rem)]">
                {copy.name}
              </h1>
              <GoldUnderline className="mt-3" />
              <p className="mt-5 max-w-xl text-body-lg text-ink-600">{copy.intro}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <StatusPill status={meta.available ? "available" : "soon"} />
                {copy.visaTypes.map((v) => (
                  <span key={v} className="rounded-pill border border-surface-border bg-surface px-3 py-1 text-caption font-medium text-ink-800">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <figure className="relative min-h-[240px] overflow-hidden rounded-[24px] sm:min-h-[320px] lg:col-span-6">
              <Image src={meta.photo} alt={copy.name} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/40 via-transparent to-transparent" />
              {PHOTO_CREDITS[meta.photo] && (
                <figcaption className="absolute bottom-3 right-3 rounded-pill bg-night-950/35 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  Foto:{" "}
                  <a href={PHOTO_CREDITS[meta.photo]!.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                    {PHOTO_CREDITS[meta.photo]!.author}
                  </a>{" "}
                  · Unsplash
                </figcaption>
              )}
            </figure>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          {/* Documents — a numbered list card */}
          <div data-reveal className="lg:col-span-8">
            <div className="overflow-hidden rounded-[28px] border border-surface-border bg-surface">
              <div className="flex items-center justify-between gap-4 border-b border-surface-border px-5 py-5 sm:px-7">
                <h2 className="luxe-firm flex items-center gap-3 font-luxe text-[1.35rem] font-semibold leading-tight tracking-[-0.01em] text-ink-950 sm:text-[1.7rem]">
                  <span aria-hidden="true">📋</span>
                  {page.docsTitle}
                </h2>
                <span className="shrink-0 rounded-pill bg-brand-50 px-2.5 py-1 text-caption font-semibold text-brand-700">{docs.length}</span>
              </div>
              <ol>
                {docs.map((doc, i) => (
                  <li key={doc} className="flex items-center gap-4 border-b border-surface-border px-5 py-4 last:border-b-0 sm:px-7">
                    <span className="w-8 shrink-0 font-luxe-italic text-[1.35rem] font-semibold italic leading-none text-violet-600 [-webkit-text-stroke:0.35px_currentColor] dark:text-citron-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[17px] leading-none">
                      {DOC_EMOJI[i] ?? "📄"}
                    </span>
                    <span className="text-body font-semibold text-ink-900">{doc}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-400/10 px-4 py-3 text-body-sm text-ink-700">⚠️ {page.docsNote}</p>
          </div>

          {/* Side rail */}
          <aside data-reveal className="lg:col-span-4">
            <div className="sticky top-28 rounded-[28px] bg-gradient-to-br from-[#5B21B6] to-[#7138EC] p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_24px_48px_-20px_rgba(91,33,182,0.75)]">
              <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[24px] leading-none">✈️</span>
              <p className="luxe-firm mt-5 font-luxe text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.01em]">{page.ctaTitle}</p>
              <p className="mt-2 text-body-sm text-white/80">{page.ctaText}</p>
              <Link href="/register" className="btn btn-sheen btn-lg group mt-6 w-full bg-gold-300 text-night hover:bg-gold-200">
                {site.home.hero.ctaPrimary}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="other-dest" className="pb-12 md:pb-14 lg:pb-16">
        <div className="container-page">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-5">
            <h2 id="other-dest" className="luxe-firm font-display text-display-md text-ink-900">
              {page.otherTitle}
            </h2>
            <Link href="/destinations" className={cn(VIOLET_PILL, "shrink-0")}>
              {site.home.destinations.all}
              <PillArrow />
            </Link>
          </div>
          <div className="mt-8">
            <DestinationGrid exclude={slug} limit={4} />
          </div>
        </div>
      </section>

      <FinalCTA tone="lime" />
    </div>
  );
}
