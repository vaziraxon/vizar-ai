"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCheck } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { Accordion } from "@/components/site/Accordion";
import { Marquee } from "@/components/site/Marquee";
import { PricingPlans } from "@/components/site/PricingPlans";
import { ArrowLink, SectionHeader, StatusPill, TicketDivider } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, DESTINATION_BY_SLUG, POPULAR, TOOL_BY_ID, type ToolId } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Marquee — two endless rows: what to prepare, and where                      */
/* -------------------------------------------------------------------------- */

// Same order as home.marquee.items in every language
const PREP_EMOJI = ["🛂", "📸", "🏦", "💼", "🏨", "✈️", "🩺", "✉️", "🗓️", "🎤"];

export function MarqueeBand() {
  const site = useSite();
  const m = site.home.marquee;

  return (
    <section aria-labelledby="marquee-title" className="pt-16 md:pt-20">
      <p id="marquee-title" className="container-page text-center text-body-sm font-semibold text-ink-500">
        <span aria-hidden="true">✨ </span>
        {m.label}
      </p>
      {/* Accessible copy of the decorative rows */}
      <ul className="sr-only">
        {m.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-7 space-y-3">
        <Marquee duration={55}>
          {m.items.map((item, i) => (
            <span
              key={item}
              className="flex items-center gap-3 rounded-[20px] border border-surface-border bg-surface py-2.5 pl-2.5 pr-5 shadow-xs"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 text-[22px] leading-none">
                {PREP_EMOJI[i] ?? "📄"}
              </span>
              <span className="whitespace-nowrap text-body font-semibold text-ink-900">{item}</span>
            </span>
          ))}
        </Marquee>
        <Marquee duration={65} reverse>
          {DESTINATIONS.map((d) => (
            <span
              key={d.slug}
              className="flex items-center gap-3 rounded-[20px] border border-surface-border bg-surface py-2.5 pl-2.5 pr-5 shadow-xs"
            >
              <Flag code={d.flag} size={44} className="ring-2 ring-surface" />
              <span>
                <span className="block whitespace-nowrap text-body font-semibold text-ink-900">{site.destinations[d.slug].name}</span>
                <span className="block whitespace-nowrap text-caption text-ink-500">
                  {d.available ? `✅ ${site.status.available}` : `⏳ ${site.status.soon}`}
                </span>
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stats — large light numerals; product facts only, never user counts        */
/* -------------------------------------------------------------------------- */

const STAT_EMOJI = ["🧰", "🌐", "💳"];

/** Integer values count up from 0 the first time they scroll into view. */
function CountUp({ value }: { value: string }) {
  const target = /^\d+$/.test(value) ? Number(value) : null;
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (target === null || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    setShown("0");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1100);
          setShown(String(Math.round((1 - Math.pow(1 - t, 3)) * target)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return <span ref={ref}>{shown}</span>;
}

export function StatsBand() {
  const site = useSite();
  const stats = site.home.stats;

  return (
    <section aria-label={stats.title} className="pt-12 md:pt-16">
      <div className="container-page">
        <dl
          data-reveal
          className="grid grid-cols-1 divide-y divide-surface-border overflow-hidden rounded-[28px] border border-surface-border bg-surface shadow-xs sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {stats.items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-5 px-6 py-6 sm:justify-center sm:px-8 sm:py-7">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 text-[24px] leading-none ring-1 ring-brand-100"
              >
                {STAT_EMOJI[i] ?? "✨"}
              </span>
              <div>
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <span className="flex items-baseline gap-2">
                    <span aria-hidden="true" className="font-accent text-[46px] font-medium italic leading-none text-brand-900">
                      <CountUp value={item.value} />
                    </span>
                    <span className="text-body font-semibold text-ink-900">
                      <span className="sr-only">{item.value} </span>
                      {item.label}
                    </span>
                  </span>
                  <span className="mt-1 block text-caption text-ink-500">{item.note}</span>
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-center text-caption text-ink-400">{stats.subtitle}</p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Tools — four primary tools as full cards with a clear action                */
/* -------------------------------------------------------------------------- */

const GRID_TOOLS: ToolId[] = ["readiness", "documents", "interview", "tracker"];

export function ToolsGrid() {
  const site = useSite();
  const t = site.home.tools;

  return (
    <section aria-labelledby="tools-title" className="section">
      <div className="container-page">
        <SectionHeader
          id="tools-title"
          emoji="🧰"
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
          action={
            <Link href="/features" className="rounded">
              <ArrowLink>{t.all}</ArrowLink>
            </Link>
          }
        />

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-5">
          {GRID_TOOLS.map((id, i) => {
            const tool = TOOL_BY_ID[id];
            const copy = site.tools[id];
            const live = tool.status !== "soon";
            return (
              <li
                key={id}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
                className="spotlight group relative flex flex-col overflow-hidden rounded-[28px] border border-surface-border bg-surface p-6 shadow-xs transition-[transform,box-shadow,border-color] duration-300 ease-premium hover:-translate-y-1 hover:border-brand-100 hover:shadow-card-hover sm:p-7"
              >
                <StatusPill status={tool.status} className="absolute right-5 top-5" />
                <span
                  aria-hidden="true"
                  className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-50 via-surface to-violet-50 text-[30px] leading-none shadow-xs ring-1 ring-brand-100 transition-transform duration-300 ease-premium group-hover:-rotate-6 group-hover:scale-105"
                >
                  {tool.emoji}
                </span>
                <h3 className="mt-6 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink-950">{copy.name}</h3>
                <p className="mt-2 text-body-sm text-ink-600">{copy.desc}</p>
                <TicketDivider className="-mx-6 mt-6 sm:-mx-7" />
                <ul className="mt-5 flex-1 space-y-3">
                  {copy.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5 text-body-sm text-ink-800">
                      <CheckCheck size={18} strokeWidth={2.2} className="mt-px shrink-0 text-violet-600 dark:text-citron-300" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tool.href}
                  className={cn("btn-lg mt-7 w-full rounded-2xl", live ? "btn-charcoal" : "btn-secondary")}
                >
                  {live ? site.nav.getStarted : site.common.learnMore}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Destinations — photo cards                                                   */
/* -------------------------------------------------------------------------- */

export function DestinationsSection() {
  const site = useSite();
  const d = site.home.destinations;

  return (
    <section aria-labelledby="dest-title" className="section pt-0 md:pt-0 lg:pt-0">
      <div className="container-page">
        <SectionHeader
          id="dest-title"
          emoji="🌍"
          eyebrow={d.eyebrow}
          title={d.title}
          subtitle={d.subtitle}
          action={
            <Link href="/destinations" className="rounded">
              <ArrowLink>{d.all}</ArrowLink>
            </Link>
          }
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {POPULAR.map((p, i) => {
            const dest = DESTINATION_BY_SLUG[p.slug];
            return (
              <li key={p.country} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 50}ms` }}>
                <Link
                  href={`/destinations/${p.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-surface-muted"
                >
                  <Image
                    src={p.photo}
                    alt={site.countries[p.country]}
                    fill
                    sizes="(min-width: 1024px) 280px, 50vw"
                    className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/75 via-night-950/10 to-transparent" />
                  <span className="absolute left-3 top-3 sm:left-4 sm:top-4">
                    <Flag code={p.country} size={32} className="ring-2 ring-white/80" />
                  </span>
                  <span className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                    <span className="block font-display text-body-lg font-bold tracking-[-0.01em] text-white sm:text-xl">
                      {site.countries[p.country]}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-caption font-medium text-white/85">
                      {p.slug === "schengen" ? "Schengen" : site.destinations[dest.slug].region}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors duration-200 group-hover:bg-citron-300 group-hover:text-night">
                        <ArrowRight size={15} />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Pricing + FAQ previews                                                      */
/* -------------------------------------------------------------------------- */

export function PricingSection() {
  const site = useSite();
  const p = site.pricing;

  return (
    <section aria-labelledby="pricing-title" className="section border-y border-surface-border bg-surface">
      <div className="container-page">
        <SectionHeader id="pricing-title" align="center" emoji="💎" eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-14 lg:mt-16">
          <PricingPlans tone="lime" />
        </div>
        <div className="mt-10 text-center">
          <Link href="/pricing" className="rounded">
            <ArrowLink>{site.home.more.pricing}</ArrowLink>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const site = useSite();

  return (
    <section aria-labelledby="faq-title" className="section">
      <div className="container-page max-w-3xl">
        <SectionHeader id="faq-title" align="center" emoji="💬" eyebrow={site.faq.eyebrow} title={site.faq.title} subtitle={site.faq.subtitle} />
        <div data-reveal className="mt-12">
          <Accordion items={site.faq.items.slice(0, 4)} defaultOpen={null} />
        </div>
        <div className="mt-10 text-center">
          <Link href="/faq" className="rounded">
            <ArrowLink>{site.home.more.faq}</ArrowLink>
          </Link>
        </div>
      </div>
    </section>
  );
}
