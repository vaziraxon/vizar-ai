"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLink, CheckLine, EmojiTile, Eyebrow, StatusPill } from "@/components/site/primitives";
import { ToolDemo } from "@/components/site/demos";
import { ToolLinkList } from "@/components/site/ToolCards";
import { FinalCTA } from "@/components/site/FinalCTA";
import { useSite } from "@/lib/i18n/site";
import { TOOLS, TOOL_BY_ID, type ToolId } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

/** Shared template for every public tool page (/visa-readiness, /tracker, …). */
export function ToolPage({ id }: { id: ToolId }) {
  const site = useSite();
  const tool = TOOL_BY_ID[id];
  const copy = site.tools[id];
  const related = TOOLS.filter((t) => t.id !== id)
    .slice(0, 3)
    .map((t) => t.id);

  return (
    <>
      {/* Hero */}
      <section className="hero-backdrop relative overflow-hidden">
        <div className="container-page relative grid items-center gap-14 pb-20 pt-28 sm:pt-36 lg:grid-cols-12 lg:gap-12 lg:pb-28 lg:pt-40">
          <div className="animate-fade-up lg:col-span-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm text-ink-500">
              <Link href="/features" className="rounded transition-colors duration-200 hover:text-ink-900">
                {site.toolPage.breadcrumb}
              </Link>
              <ChevronRight size={14} className="text-ink-300" />
              <span className="text-ink-800" aria-current="page">
                {copy.tagline}
              </span>
            </nav>

            <div className="mt-8 flex items-center gap-3">
              <EmojiTile emoji={tool.emoji} size="lg" />
              <StatusPill status={tool.status} />
            </div>

            <h1 className="mt-6 font-display text-display-xl text-ink-900">{copy.name}</h1>
            <p className="mt-5 max-w-xl text-body-lg text-ink-600">{copy.desc}</p>

            <ul className="mt-8 space-y-3">
              {copy.benefits.map((b) => (
                <CheckLine key={b} className="text-body">
                  {b}
                </CheckLine>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" size="lg" className="group">
                {copy.cta}
                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary" size="lg">
                {site.home.hero.ctaSecondary}
              </ButtonLink>
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
      <section aria-labelledby="tool-how" className="section">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-4">
            <Eyebrow emoji={tool.emoji}>{copy.tagline}</Eyebrow>
            <h2 id="tool-how" className="mt-4 font-display text-display-lg text-ink-900">
              {site.toolPage.howTitle}
            </h2>
          </div>
          <ol data-reveal className="border-t border-surface-border lg:col-span-8">
            {copy.steps.map((step, i) => (
              <li key={step.title} className="grid gap-2 border-b border-surface-border py-7 sm:grid-cols-12 sm:gap-6">
                <span className="font-display text-body-sm font-semibold text-ink-400 sm:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-display-sm text-ink-900 sm:col-span-4">{step.title}</h3>
                <p className="text-body text-ink-600 sm:col-span-7">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="tool-related" className="pb-section-y-sm md:pb-section-y-md">
        <div className="container-page">
          <div data-reveal className="flex items-end justify-between gap-6">
            <h2 id="tool-related" className="font-display text-display-md text-ink-900">
              {site.toolPage.relatedTitle}
            </h2>
            <Link href="/features" className="shrink-0 rounded">
              <ArrowLink>{site.nav.allTools}</ArrowLink>
            </Link>
          </div>
          <div data-reveal className="mt-8">
            <ToolLinkList ids={related} />
          </div>
        </div>
      </section>

      <FinalCTA title={site.toolPage.ctaTitle} subtitle={site.toolPage.ctaText} />
    </>
  );
}
