"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { SectionHeader } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG, TOOL_BY_ID, type DestinationSlug, type ToolId } from "@/lib/site/registry";
import { SAMPLE_CARDS, SAMPLE_TESTIMONIALS_ENABLED, type Testimonial } from "@/lib/site/testimonials";

type Card = {
  key: string;
  name: string;
  avatar?: string;
  emoji?: string;
  destination: DestinationSlug;
  tool: ToolId;
  rating?: number;
  quote: string;
  locale?: string;
  photo?: string;
  sample: boolean;
};

type Labels = ReturnType<typeof useSite>["home"]["testimonials"];

/** One review. Mouse users get a gentle 3D tilt; `.spotlight` adds the light reflection. */
function StoryCard({ card, width, labels, hidden }: { card: Card; width: number; labels: Labels; hidden: boolean }) {
  const site = useSite();
  const tilt = useRef<HTMLElement>(null);
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.transform = `perspective(900px) translateY(-6px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
  };
  const onLeave = () => {
    if (tilt.current) tilt.current.style.transform = "";
  };

  return (
    <div aria-hidden={hidden || undefined} style={{ width }} className="shrink-0 py-4" onPointerMove={onMove} onPointerLeave={onLeave}>
      <article
        ref={tilt}
        className="spotlight relative flex h-full flex-col overflow-hidden rounded-[28px] border border-surface-border bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-300 ease-premium hover:shadow-card-hover sm:p-7"
      >
        <span aria-hidden="true" className="pointer-events-none absolute right-6 top-16 font-accent text-[120px] leading-none text-violet-200/80 dark:text-violet-400/25">
          ”
        </span>
        <header className="relative flex items-start gap-4">
          {card.avatar ? (
            <Image src={card.avatar} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-surface-tint" />
          ) : (
            <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-citron-100 text-[26px] ring-4 ring-surface-tint dark:from-violet-500/20 dark:to-citron-300/10">
              {card.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-body-lg font-bold leading-snug text-ink-950">{card.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-ink-600">
              <Flag code={DESTINATION_BY_SLUG[card.destination].flag} size={16} />
              {site.destinations[card.destination].name}
            </p>
            {card.rating && (
              <p className="mt-1.5 flex gap-0.5" aria-label={`${card.rating}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={15} className={i < card.rating! ? "fill-gold-300 text-gold-400" : "text-ink-300"} />
                ))}
              </p>
            )}
          </div>
          {card.sample && (
            <span className="shrink-0 rounded-pill bg-citron-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-900 ring-1 ring-citron-400/60 dark:bg-citron-300/15 dark:text-citron-200 dark:ring-citron-300/30">
              {labels.sampleBadge}
            </span>
          )}
        </header>

        <blockquote lang={card.locale} className="relative mt-5 flex-1 text-body text-ink-800">
          “{card.quote}”
        </blockquote>

        <footer className="relative mt-6 flex items-end justify-between gap-4">
          <p className="text-body-sm">
            <span className="block text-caption uppercase tracking-[0.08em] text-ink-500">{labels.usedTool}</span>
            <span className="mt-0.5 block font-semibold text-ink-900">
              <span aria-hidden="true">{TOOL_BY_ID[card.tool].emoji} </span>
              {site.tools[card.tool].name}
            </span>
          </p>
          {card.photo && (
            <span className="relative h-20 w-24 shrink-0 rotate-3 overflow-hidden rounded-xl border-4 border-white shadow-float dark:border-white/10">
              <Image src={card.photo} alt="" fill sizes="96px" className="object-cover" />
            </span>
          )}
        </footer>
      </article>
    </div>
  );
}

/**
 * Endless right-to-left ribbon of reviews (one full lap ≈ 38s, slower on
 * phones). Hover, focus or the pause button stop it; arrows step one card;
 * touch and mouse can drag it. Off screen, in background tabs and for reduced
 * motion it does not move by itself.
 */
function StoryRibbon({ cards, labels }: { cards: Card[]; labels: Labels }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ cardW: 0, gap: 24, copies: 2 });
  const [paused, setPaused] = useState(false);
  const motion = useRef({
    x: 0,
    setW: 0,
    step: 0,
    speed: 0,
    hover: false,
    focus: false,
    paused: false,
    drag: null as null | { lastX: number; id: number },
    nudge: null as null | { from: number; to: number; t0: number },
  });

  useEffect(() => {
    motion.current.paused = paused;
  }, [paused]);

  // Card width from the viewport: 3 per view on desktop, 2 on tablets, 1 (with a peek) on phones
  useEffect(() => {
    const vp = viewport.current;
    if (!vp) return;
    const measure = () => {
      const w = vp.clientWidth;
      const perView = w >= 960 ? 3 : w >= 600 ? 2 : 1;
      const gap = perView === 1 ? 16 : 24;
      const cardW = perView === 1 ? Math.min(w * 0.86, 380) : (w - gap * (perView - 1)) / perView;
      const m = motion.current;
      m.step = cardW + gap;
      m.setW = cards.length * m.step;
      m.speed = m.setW / (perView === 1 ? 54 : 38);
      setLayout({ cardW, gap, copies: Math.max(2, Math.ceil(w / m.setW) + 1) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [cards.length]);

  useEffect(() => {
    const m = motion.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();
    let onScreen = false;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (m.nudge) {
        const p = Math.min(1, (now - m.nudge.t0) / 480);
        m.x = m.nudge.from + (m.nudge.to - m.nudge.from) * (1 - (1 - p) ** 3);
        if (p >= 1) m.nudge = null;
      } else if (!m.drag && !m.hover && !m.focus && !m.paused && !reduced) {
        m.x -= m.speed * dt;
      }
      // Keep x inside one lap so the duplicated copies loop seamlessly
      if (m.setW > 0) {
        const wrap = m.x <= -m.setW ? m.setW : m.x > 0 ? -m.setW : 0;
        if (wrap) {
          m.x += wrap;
          if (m.nudge) {
            m.nudge.from += wrap;
            m.nudge.to += wrap;
          }
        }
      }
      if (track.current) track.current.style.transform = `translate3d(${m.x.toFixed(2)}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame || !onScreen || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      if (onScreen) start();
      else stop();
    });
    if (viewport.current) io.observe(viewport.current);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const m = motion.current;
    if (!m.step) return;
    const from = m.x;
    // Land on a card edge
    const to = Math.round((from - dir * m.step) / m.step) * m.step;
    m.nudge = { from, to, t0: performance.now() };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    motion.current.drag = { lastX: e.clientX, id: e.pointerId };
    motion.current.nudge = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = motion.current.drag;
    if (!d || d.id !== e.pointerId) return;
    motion.current.x += e.clientX - d.lastX;
    d.lastX = e.clientX;
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (motion.current.drag?.id !== e.pointerId) return;
    motion.current.drag = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const controlClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-surface text-ink-900 shadow-xs transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover";

  return (
    <div className="container-page">
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.title}
        className="relative cursor-grab touch-pan-y select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_3%,#000_97%,transparent)] active:cursor-grabbing"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") motion.current.hover = true;
        }}
        onPointerLeave={() => (motion.current.hover = false)}
        onFocusCapture={() => (motion.current.focus = true)}
        onBlurCapture={() => (motion.current.focus = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={track} className="flex w-max will-change-transform" style={{ gap: layout.gap }}>
          {layout.cardW > 0 &&
            Array.from({ length: layout.copies }, (_, copy) =>
              cards.map((card) => (
                <StoryCard key={`${copy}-${card.key}`} card={card} width={layout.cardW} labels={labels} hidden={copy > 0} />
              ))
            )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button type="button" onClick={() => nudge(-1)} aria-label={labels.prev} className={controlClass}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? labels.play : labels.pause} className={controlClass}>
          {paused ? <Play size={16} className="ml-0.5" /> : <Pause size={16} />}
        </button>
        <button type="button" onClick={() => nudge(1)} aria-label={labels.next} className={controlClass}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

/**
 * Customer stories. Only real, consented reviews (published from
 * /admin/testimonials) are public; until the first arrive, labelled sample
 * cards show in test mode and the section is hidden on production.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const site = useSite();
  const t = site.home.testimonials;

  const cards: Card[] = items.length
    ? items.map((r) => ({ ...r, key: r.id, sample: false }))
    : SAMPLE_TESTIMONIALS_ENABLED
      ? SAMPLE_CARDS.map((s, i) => ({
          key: `sample-${i}`,
          name: t.samples[i]!.persona,
          emoji: s.emoji,
          destination: s.destination,
          tool: s.tool,
          quote: t.samples[i]!.quote,
          photo: s.photo,
          sample: true,
        }))
      : [];
  if (cards.length === 0) return null;
  const sample = cards[0]!.sample;

  return (
    <section aria-labelledby="stories-title" className="relative pb-12 pt-6 sm:pb-16">
      <div className="container-page">
        <SectionHeader
          align="center"
          emoji="💬"
          eyebrow={t.eyebrow}
          id="stories-title"
          title={sample ? t.sampleTitle : t.title}
          subtitle={sample ? t.sampleSubtitle : t.subtitle}
        />
      </div>
      <div className="mt-8">
        <StoryRibbon cards={cards} labels={t} />
      </div>
    </section>
  );
}
