"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCheck } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { Accordion } from "@/components/site/Accordion";
import { Marquee } from "@/components/site/Marquee";
import { PricingPlans } from "@/components/site/PricingPlans";
import { ArrowLink, EmojiTile, SectionHeader, StatusPill, TicketDivider } from "@/components/site/primitives";
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
/* Bento — a dark "midnight" grid of live product fragments                    */
/* -------------------------------------------------------------------------- */

const ALERT_EMOJI = { warn: "⚠️", ok: "✅", info: "📅" } as const;
// Same order as demos.tracker.stages
const STAGE_EMOJI = ["👤", "📂", "🎯", "🎤", "📨"];
const DOC_STATE_EMOJI = { ready: "✅", review: "🔍", missing: "⏳" } as const;
const DOC_STATE_TONE = {
  ready: "bg-emerald-400/15 text-emerald-200",
  review: "bg-amber-400/15 text-amber-200",
  missing: "bg-white/10 text-white/60",
} as const;
const GREETINGS: { flag: "uz" | "ru" | "gb"; word: string }[] = [
  { flag: "uz", word: "Salom" },
  { flag: "ru", word: "Привет" },
  { flag: "gb", word: "Hello" },
];

function BentoCard({
  emoji,
  title,
  text,
  demo,
  className,
  bodyClassName = "justify-end",
  children,
}: {
  emoji: string;
  title: string;
  text: string;
  demo?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <li
      data-reveal
      className={cn(
        "spotlight spotlight-dark flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-6 transition-colors duration-300 hover:border-white/20 sm:p-7",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 text-[22px] leading-none ring-1 ring-white/15"
        >
          {emoji}
        </span>
        {demo && (
          <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/55">
            {demo}
          </span>
        )}
      </div>
      <h3 className="mt-5 font-display text-body-lg font-bold tracking-[-0.01em] text-white">{title}</h3>
      <p className="mt-1 text-body-sm text-white/60">{text}</p>
      <div className={cn("mt-6 flex flex-1 flex-col", bodyClassName)}>{children}</div>
    </li>
  );
}

export function BentoSection() {
  const site = useSite();
  const b = site.home.bento;
  const demos = site.demos;
  const demo = site.common.demo;
  const score = 82;
  const r = 54;
  const c = 2 * Math.PI * r;
  const currentStage = 2;

  return (
    <section
      aria-labelledby="bento-title"
      className="grain relative overflow-hidden bg-night-950 py-section-y-sm text-white md:py-section-y-md lg:py-section-y-lg"
    >
      {/* Aurora + fine dots */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -left-40 -top-24 h-[520px] w-[520px] animate-drift rounded-full bg-violet-600/40 blur-[120px] motion-reduce:animate-none" />
        <span className="absolute -bottom-40 -right-32 h-[560px] w-[560px] animate-drift rounded-full bg-citron-300/20 blur-[130px] [animation-delay:-9s] motion-reduce:animate-none" />
        <span className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_15%,transparent_80%)]" />
      </div>

      <div className="container-page relative">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-3 py-1 text-[13px] font-medium text-white/80">
            <span aria-hidden="true">🧩</span>
            {b.eyebrow}
          </p>
          <h2 id="bento-title" className="mt-5 font-display text-display-lg font-extrabold tracking-[-0.035em] text-white">
            {b.title}
          </h2>
          <p className="mt-4 text-body-lg text-white/60">{b.subtitle}</p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-5">
          {/* Readiness — the hero cell */}
          <BentoCard
            emoji={TOOL_BY_ID.readiness.emoji}
            title={site.tools.readiness.name}
            text={site.tools.readiness.menu}
            demo={demo}
            className="md:col-span-2 lg:row-span-2"
            bodyClassName="justify-center"
          >
            <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0">
                <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                  <defs>
                    <linearGradient id="bento-ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#D9F26B" />
                    </linearGradient>
                  </defs>
                  <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle
                    cx="64"
                    cy="64"
                    r={r}
                    fill="none"
                    stroke="url(#bento-ring)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - score / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-accent text-[56px] font-medium italic leading-none text-white">{score}</span>
                  <span className="mt-1 text-caption text-white/50">/ 100</span>
                </span>
              </div>
              <ul className="w-full flex-1 space-y-3.5">
                {demos.readiness.categories.map((cat) => (
                  <li key={cat.label}>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-white/75">{cat.label}</span>
                      <span className="font-semibold tabular-nums text-white">{cat.value}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-citron-300" style={{ width: `${cat.value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <span aria-hidden="true" className="text-[20px] leading-none">✨</span>
              <div className="min-w-0">
                <p className="text-caption text-white/50">{demos.readiness.nextLabel}</p>
                <p className="text-body-sm font-semibold text-white">{demos.readiness.nextText}</p>
              </div>
            </div>
          </BentoCard>

          {/* Documents */}
          <BentoCard emoji={TOOL_BY_ID.documents.emoji} title={site.tools.documents.name} text={site.tools.documents.menu} demo={demo}>
            <ul className="space-y-2">
              {demos.documents.files.slice(0, 3).map((f) => (
                <li key={f.name} className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.06] px-3 py-2">
                  <span className="truncate text-body-sm text-white/85">{f.name}</span>
                  <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", DOC_STATE_TONE[f.state])}>
                    <span aria-hidden="true">{DOC_STATE_EMOJI[f.state]} </span>
                    {site.common[f.state]}
                  </span>
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* Languages */}
          <BentoCard emoji="🌐" title={b.languagesTitle} text={b.languagesText}>
            <div className="flex items-end justify-between gap-4">
              <ul className="space-y-2">
                {GREETINGS.map((g) => (
                  <li key={g.flag} className="flex items-center gap-2.5 text-body-sm font-semibold text-white">
                    <Flag code={g.flag} size={26} className="ring-2 ring-white/20" />
                    {g.word}
                  </li>
                ))}
              </ul>
              <span aria-hidden="true" className="font-accent text-[72px] font-medium italic leading-[0.8] text-white/90">
                3
              </span>
            </div>
          </BentoCard>

          {/* Interview */}
          <BentoCard
            emoji={TOOL_BY_ID.interview.emoji}
            title={site.tools.interview.name}
            text={site.tools.interview.menu}
            demo={demo}
            className="md:col-span-2"
          >
            <div className="space-y-3">
              <div className="flex items-end gap-2.5">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[15px]">
                  🤖
                </span>
                <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5 text-body-sm text-white">
                  {demos.interview.questions[0]}
                </p>
              </div>
              <div className="flex justify-end">
                <p aria-hidden="true" className="flex items-center gap-1.5 rounded-2xl rounded-br-md bg-citron-300 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-night/80 motion-reduce:animate-none" style={{ animationDelay: `${i * 180}ms` }} />
                  ))}
                </p>
              </div>
              <p className="flex items-center gap-2 text-caption text-white/60">
                <span aria-hidden="true">💡</span>
                <span className="font-semibold text-white/80">{demos.interview.tipTitle}:</span> {demos.interview.tips[0]}
              </p>
            </div>
          </BentoCard>

          {/* Tracker */}
          <BentoCard
            emoji={TOOL_BY_ID.tracker.emoji}
            title={site.tools.tracker.name}
            text={site.tools.tracker.menu}
            demo={demo}
            className="md:col-span-2"
          >
            <ol className="grid grid-cols-5 gap-2">
              {demos.tracker.stages.map((stage, i) => {
                const done = i < currentStage;
                const current = i === currentStage;
                return (
                  <li key={stage.title} className="flex flex-col items-center text-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-[18px] leading-none ring-1",
                        done && "bg-white/10 ring-white/15",
                        current && "bg-gradient-to-br from-violet-500 to-citron-300 shadow-[0_0_0_6px_rgba(217,242,107,0.16)] ring-white/30",
                        !done && !current && "bg-white/[0.03] opacity-60 ring-white/10"
                      )}
                    >
                      {STAGE_EMOJI[i]}
                    </span>
                    <span className={cn("mt-2 line-clamp-2 text-[11px] font-medium leading-tight", current ? "text-white" : "text-white/55")}>
                      {stage.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </BentoCard>

          {/* Alerts */}
          <BentoCard emoji="🔔" title="Alerts" text={b.alertsText} demo={demo} className="md:col-span-2">
            <ul className="space-y-2">
              {site.home.board.alerts.map((alert) => (
                <li key={alert.title} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5">
                  <span aria-hidden="true" className="text-[16px] leading-none">
                    {ALERT_EMOJI[alert.tone]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body-sm text-white/85">{alert.title}</span>
                  <span className="shrink-0 text-caption text-white/45">{alert.time}</span>
                </li>
              ))}
            </ul>
          </BentoCard>
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works — three steps on a rail                                        */
/* -------------------------------------------------------------------------- */

const HOW_EMOJI = ["📝", "🤖", "🗂️"];

export function HowTimeline() {
  const site = useSite();
  const how = site.home.how;

  return (
    <section aria-labelledby="how-title" className="section pt-0 md:pt-0 lg:pt-0">
      <div className="container-page">
        <SectionHeader
          id="how-title"
          emoji="🚀"
          eyebrow={how.eyebrow}
          title={how.title}
          subtitle={how.subtitle}
          action={
            <Link href="/how-it-works" className="rounded">
              <ArrowLink>{how.cta}</ArrowLink>
            </Link>
          }
        />

        <ol className="relative mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {how.steps.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
              className="spotlight relative rounded-[28px] border border-surface-border bg-surface p-6 transition-shadow duration-300 hover:shadow-card-hover sm:p-7"
            >
              <span className="flex items-center justify-between">
                <EmojiTile emoji={HOW_EMOJI[i]!} size="lg" />
                <span className="font-display text-[44px] font-light leading-none tracking-[0.02em] text-violet-300 dark:text-brand-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <h3 className="mt-6 font-display text-display-sm text-ink-900">{step.title}</h3>
              <p className="mt-2.5 text-body text-ink-600">{step.desc}</p>
            </li>
          ))}
        </ol>
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
