"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, Play } from "lucide-react";
import { CheckLine, EmojiTile, Eyebrow, GoldUnderline, PillArrow, StatusPill, VIOLET_PILL } from "@/components/site/primitives";
import { HeroSky } from "@/components/site/home/HeroSky";
import { LandingFonts } from "@/components/site/LandingFonts";
import { ToolDemo } from "@/components/site/demos";
import { ToolLinkList } from "@/components/site/ToolCards";
import { FinalCTA } from "@/components/site/FinalCTA";
import { useSite } from "@/lib/i18n/site";
import { TOOLS, TOOL_BY_ID, type ToolId } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

/** Shared template for every public tool page (/visa-readiness, /tracker, …), in the landing look. */
export function ToolPage({ id }: { id: ToolId }) {
  const site = useSite();
  const tool = TOOL_BY_ID[id];
  const copy = site.tools[id];
  const related = TOOLS.filter((t) => t.id !== id)
    .slice(0, 3)
    .map((t) => t.id);

  return (
    <div className="landing-lime bg-surface-canvas">
      <LandingFonts />
      {/* Hero */}
      <section className="lime-wash grain relative overflow-hidden">
        <HeroSky calm />
        <div className="container-page relative grid items-center gap-14 pb-16 pt-28 sm:pt-36 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-40">
          <div className="animate-fade-up lg:col-span-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm text-ink-500">
              <Link href="/features" className="rounded transition-colors duration-200 hover:text-ink-900">
                {site.toolPage.breadcrumb}
              </Link>
              <ChevronRight size={14} className="text-ink-500" />
              <span className="text-ink-800" aria-current="page">
                {copy.tagline}
              </span>
            </nav>

            <div className="mt-8 flex items-center gap-3">
              <EmojiTile emoji={tool.emoji} size="lg" />
              <StatusPill status={tool.status} />
            </div>

            <h1 className="luxe-firm mt-6 font-luxe text-[clamp(2.7rem,5.2vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink-950">{copy.name}</h1>
            <GoldUnderline className="mt-3" />
            <p className="mt-5 max-w-xl text-body-lg text-ink-600">{copy.desc}</p>

            <ul className="mt-8 space-y-3">
              {copy.benefits.map((b) => (
                <CheckLine key={b} className="text-body" iconClassName="text-violet-600 dark:text-citron-300">
                  {b}
                </CheckLine>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="btn btn-charcoal btn-sheen group h-14 w-full justify-between pl-7 pr-2 text-body hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(113,56,236,0.6)] sm:w-auto sm:justify-center sm:gap-4"
              >
                {copy.cta}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-300 text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-night dark:text-gold-300">
                  <ArrowUpRight size={18} strokeWidth={2.4} className="transition-transform duration-200 group-hover:rotate-45" />
                </span>
              </Link>
              <Link
                href="/how-it-works"
                className="btn btn-sheen h-14 w-full gap-3 border border-white/80 bg-surface/60 pl-2 pr-7 text-body text-ink-900 shadow-xs backdrop-blur hover:-translate-y-0.5 hover:bg-surface hover:shadow-card-hover dark:border-white/10 sm:w-auto"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink-950 shadow-card ring-1 ring-ink-900/5 dark:ring-white/10">
                  <Play size={14} strokeWidth={2.4} className="ml-0.5 fill-current" />
                </span>
                {site.home.hero.ctaSecondary}
              </Link>
            </div>

            <p
              className={cn(
                "mt-8 max-w-xl border-l-2 pl-4 text-body-sm",
                tool.status === "available" && "border-emerald-500 text-ink-700",
                tool.status === "beta" && "border-violet-500 text-ink-700",
                tool.status === "soon" && "border-ink-300 text-ink-600"
              )}
            >
              {site.toolPage.notice[tool.status]}
            </p>
          </div>

          <div className="animate-fade-up lg:col-span-5 lg:col-start-8" style={{ animationDelay: "120ms" }}>
            <ToolDemo id={id} />
          </div>
        </div>
      </section>

      {/* How it works — numbered timeline */}
      <section aria-labelledby="tool-how" className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-4">
            <Eyebrow emoji={tool.emoji}>{copy.tagline}</Eyebrow>
            <h2 id="tool-how" className="luxe-firm mt-4 font-display text-display-lg text-ink-900">
              {site.toolPage.howTitle}
            </h2>
          </div>
          <ol data-reveal className="border-t border-surface-border lg:col-span-8">
            {copy.steps.map((step, i) => (
              <li key={step.title} className="grid gap-2 border-b border-surface-border py-7 sm:grid-cols-12 sm:gap-6">
                <span className="font-luxe-italic text-[1.6rem] font-medium italic leading-none text-violet-600 dark:text-citron-300 sm:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="luxe-firm font-luxe text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-950 sm:col-span-4">{step.title}</h3>
                <p className="text-body text-ink-600 sm:col-span-7">{step.desc}</p>
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
            <Link href="/features" className={cn(VIOLET_PILL, "shrink-0")}>
              {site.nav.allTools}
              <PillArrow />
            </Link>
          </div>
          <div data-reveal className="mt-8">
            <ToolLinkList ids={related} />
          </div>
        </div>
      </section>

      <FinalCTA title={site.toolPage.ctaTitle} subtitle={site.toolPage.ctaText} tone="lime" />
    </div>
  );
}
