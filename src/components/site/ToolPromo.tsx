"use client";

import { LocalLink as Link } from "@/components/site/LocalLink";
import { ArrowUpRight, ChevronRight, Lock, UserPlus } from "lucide-react";
import { CheckLine, EmojiTile, Eyebrow, GoldUnderline, PillArrow, VIOLET_PILL } from "@/components/site/primitives";
import { HeroSky } from "@/components/site/home/HeroSky";
import { ToolPromoDemo } from "@/components/site/demos/ToolPromoDemos";
import { RelatedTools } from "@/components/site/ToolCards";
import { FinalCTA } from "@/components/site/FinalCTA";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { TOOL_PROMOS, type ToolKey } from "@/lib/dashboard/tool-promos";

/**
 * The public page of a tool that works only in the dashboard, built like the
 * other tool pages (ToolPage): hero with benefits and a demo card, "how it
 * works", related tools and the closing CTA. "Open in my account" goes to the
 * dashboard page; signed out, the middleware sends the visitor to log in first
 * and back there after.
 */
export function ToolPromo({ tool }: { tool: ToolKey }) {
  const l = useL();
  const site = useSite();
  const c = site[tool];
  const t = TOOL_PROMOS.find((x) => x.key === tool)!;

  return (
    <>
      {/* Hero */}
      <section className="lime-wash grain relative overflow-hidden">
        <HeroSky calm />
        <div className="container-page relative grid items-center gap-14 pb-16 pt-28 sm:pt-36 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-40">
          <div className="animate-fade-up lg:col-span-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm text-ink-500">
              <Link href="/features" className="-my-3 inline-block rounded py-3 transition-colors duration-200 hover:text-ink-900">
                {site.toolPage.breadcrumb}
              </Link>
              <ChevronRight size={14} className="text-ink-500" />
              <span className="text-ink-800" aria-current="page">
                {c.title}
              </span>
            </nav>

            <div className="mt-8 flex items-center gap-3">
              <EmojiTile emoji={t.emoji} size="lg" />
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-surface-border bg-surface px-2 py-[3px] text-[11px] font-medium leading-none text-violet-700">
                <Lock size={11} strokeWidth={2.2} /> {c.eyebrow}
              </span>
            </div>

            <h1 className="luxe-firm mt-6 font-luxe text-[clamp(2.7rem,5.2vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink-950">{c.title}</h1>
            <GoldUnderline className="mt-3" />
            <p className="mt-5 max-w-xl text-body-lg text-ink-600">{c.subtitle}</p>

            <ul className="mt-8 space-y-3">
              {t.points.map((p) => (
                <CheckLine key={p} className="text-body" iconClassName="text-violet-600 dark:text-citron-300">
                  {l(p)}
                </CheckLine>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={t.href}
                className="btn btn-charcoal btn-sheen group h-14 w-full justify-between pl-7 pr-2 text-body hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(113,56,236,0.6)] sm:w-auto sm:justify-center sm:gap-4"
              >
                {l("Kabinetda ochish")}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-300 text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-night dark:text-gold-300">
                  <ArrowUpRight size={18} strokeWidth={2.4} className="transition-transform duration-200 group-hover:rotate-45" />
                </span>
              </Link>
              <Link
                href="/register"
                className="btn btn-sheen h-14 w-full gap-3 border border-white/80 bg-surface/60 pl-2 pr-7 text-body text-ink-900 shadow-xs backdrop-blur hover:-translate-y-0.5 hover:bg-surface hover:shadow-card-hover dark:border-white/10 sm:w-auto"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink-950 shadow-card ring-1 ring-ink-900/5 dark:ring-white/10">
                  <UserPlus size={16} strokeWidth={2.2} />
                </span>
                {l("Ro'yxatdan o'tish")}
              </Link>
            </div>

            <p className="mt-8 max-w-xl border-l-2 border-emerald-500 pl-4 text-body-sm text-ink-700">{site.toolPage.notice.available}</p>
          </div>

          <div className="animate-fade-up lg:col-span-5 lg:col-start-8" style={{ animationDelay: "120ms" }}>
            <ToolPromoDemo tool={tool} />
          </div>
        </div>
      </section>

      {/* How it works — numbered timeline */}
      <section aria-labelledby="tool-how" className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-4">
            <Eyebrow emoji={t.emoji}>{c.title}</Eyebrow>
            <h2 id="tool-how" className="luxe-firm mt-4 font-display text-display-lg text-ink-900">
              {site.toolPage.howTitle}
            </h2>
          </div>
          <ol data-reveal className="border-t border-surface-border lg:col-span-8">
            {t.steps.map(([title, desc], i) => (
              <li key={title} className="grid gap-2 border-b border-surface-border py-7 sm:grid-cols-12 sm:gap-6">
                <span className="font-luxe-italic text-[1.6rem] font-medium italic leading-none text-violet-600 dark:text-citron-300 sm:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="luxe-firm font-luxe text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-950 sm:col-span-4">{l(title)}</h3>
                <p className="text-body text-ink-600 sm:col-span-7">{l(desc)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="tool-related" className="pb-12 md:pb-14 lg:pb-16">
        <div className="container-page">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <h2 id="tool-related" className="luxe-firm font-display text-display-md text-ink-900">
              {site.toolPage.relatedTitle}
            </h2>
            <Link href="/features" className={`${VIOLET_PILL} shrink-0`}>
              {site.nav.allTools}
              <PillArrow />
            </Link>
          </div>
          <div data-reveal className="mt-8">
            <RelatedTools currentHref={t.publicHref} />
          </div>
        </div>
      </section>

      <FinalCTA title={site.toolPage.ctaTitle} subtitle={site.toolPage.ctaText} />
    </>
  );
}
