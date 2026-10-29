"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { ReviewComposer } from "@/components/site/home/ReviewComposer";
import { Eyebrow } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG, TOOL_BY_ID, type DestinationSlug, type ToolId } from "@/lib/site/registry";
import { SAMPLE_CARDS, SAMPLE_TESTIMONIALS_ENABLED, type Testimonial } from "@/lib/site/testimonials";
import { cn } from "@/lib/utils";

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
  date?: string;
  sample: boolean;
};

type Labels = ReturnType<typeof useSite>["home"]["testimonials"];

// Initials discs: white text on each of these passes WCAG AA
const AVATAR_TONES = ["bg-violet-600", "bg-emerald-700", "bg-amber-700", "bg-sky-700", "bg-rose-700", "bg-indigo-600", "bg-teal-700"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Same name → same colour, so a customer's disc never changes between visits. */
function toneFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length]!;
}

/** "29.10.2026" — the same in every language */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

/** One review card. Mouse users get a gentle 3D tilt; `.spotlight` adds the light reflection. */
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
        className="spotlight relative flex h-full flex-col rounded-[26px] border border-surface-border bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-300 ease-premium hover:shadow-card-hover"
      >
        <header className="flex items-center gap-3">
          {card.avatar ? (
            <Image src={card.avatar} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : card.emoji ? (
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-citron-100 text-[22px] dark:from-violet-500/20 dark:to-citron-300/10">
              {card.emoji}
            </span>
          ) : (
            <span aria-hidden="true" className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white", toneFor(card.name))}>
              {initials(card.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p title={card.name} className="truncate font-display text-[17px] font-bold text-ink-950">
              {card.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-caption text-ink-500">
              {card.date ? (
                <>
                  <time dateTime={card.date}>{formatDate(card.date)}</time>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              <Flag code={DESTINATION_BY_SLUG[card.destination].flag} size={14} />
              <span className="truncate">{site.destinations[card.destination].name}</span>
            </p>
          </div>
          {card.sample ? (
            <span className="shrink-0 rounded-pill bg-citron-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-900 ring-1 ring-citron-400/60 dark:bg-citron-300/15 dark:text-citron-200 dark:ring-citron-300/30">
              {labels.sampleBadge}
            </span>
          ) : card.rating ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-violet-50 px-2.5 py-1 text-caption font-bold text-violet-800" aria-label={`${card.rating}/5`}>
              {card.rating}.0 <Star size={12} className="fill-current" />
            </span>
          ) : null}
        </header>

        <blockquote lang={card.locale} className="mt-4 flex-1 text-body leading-relaxed text-ink-800">
          {card.quote}
        </blockquote>

        <footer className="mt-5 flex items-end justify-between gap-3">
          <p className="text-caption text-ink-500">
            <span aria-hidden="true">{TOOL_BY_ID[card.tool].emoji} </span>
            {site.tools[card.tool].name}
          </p>
          {card.photo ? (
            <span className="relative h-14 w-[72px] shrink-0 rotate-3 overflow-hidden rounded-lg border-[3px] border-white shadow-float dark:border-white/10">
              <Image src={card.photo} alt="" fill sizes="72px" className="object-cover" />
            </span>
          ) : null}
        </footer>
      </article>
    </div>
  );
}

/**
 * Right-to-left ribbon of reviews. With more cards than fit, it loops
 * endlessly (one lap ≈ 38s, slower on phones): hover, focus or the pause
 * button stop it, arrows step one card, touch and mouse can drag it. With
 * fewer, the cards simply sit centred. Off screen, in background tabs and for
 * reduced motion it does not move by itself.
 */
function StoryRibbon({ cards, labels }: { cards: Card[]; labels: Labels }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ cardW: 0, gap: 24, copies: 1, loop: false });
  const [paused, setPaused] = useState(false);
  const motion = useRef({
    x: 0,
    setW: 0,
    step: 0,
    speed: 0,
    loop: false,
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
      m.loop = cards.length > perView;
      m.step = cardW + gap;
      m.setW = cards.length * m.step;
      m.speed = m.setW / (perView === 1 ? 54 : 38);
      if (!m.loop) m.x = 0;
      setLayout({ cardW, gap, copies: m.loop ? Math.max(2, Math.ceil(w / m.setW) + 1) : 1, loop: m.loop });
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
      if (!m.loop) {
        m.x = 0;
      } else if (m.nudge) {
        const p = Math.min(1, (now - m.nudge.t0) / 480);
        m.x = m.nudge.from + (m.nudge.to - m.nudge.from) * (1 - (1 - p) ** 3);
        if (p >= 1) m.nudge = null;
      } else if (!m.drag && !m.hover && !m.focus && !m.paused && !reduced) {
        m.x -= m.speed * dt;
      }
      // Keep x inside one lap so the duplicated copies loop seamlessly
      if (m.loop && m.setW > 0) {
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
    if (!m.loop || !m.step) return;
    const from = m.x;
    // Land on a card edge
    const to = Math.round((from - dir * m.step) / m.step) * m.step;
    m.nudge = { from, to, t0: performance.now() };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!motion.current.loop) return;
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
        className={cn(
          "relative overflow-hidden",
          layout.loop &&
            "cursor-grab touch-pan-y select-none [mask-image:linear-gradient(to_right,transparent,#000_3%,#000_97%,transparent)] active:cursor-grabbing"
        )}
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
        <div
          ref={track}
          className={cn("flex will-change-transform", layout.loop ? "w-max" : "flex-wrap justify-center")}
          style={{ gap: layout.gap }}
        >
          {layout.cardW > 0 &&
            Array.from({ length: layout.copies }, (_, copy) =>
              cards.map((card) => (
                <StoryCard key={`${copy}-${card.key}`} card={card} width={layout.cardW} labels={labels} hidden={copy > 0} />
              ))
            )}
        </div>
      </div>

      {layout.loop ? (
        <div className="mt-4 flex items-center justify-center gap-3">
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
      ) : null}
    </div>
  );
}

/**
 * Customer stories, right under the hero and visible to everyone. Signed-in
 * customers write their own review for free (ReviewComposer); the rating
 * summary is computed from real reviews only. Labelled sample cards appear
 * only in test mode while there are no real reviews; on production an empty
 * section invites the first review instead.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const site = useSite();
  const t = site.home.testimonials;

  const real = items.length > 0;
  const cards: Card[] = real
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
  const sample = !real && cards.length > 0;

  const rated = items.filter((r) => r.rating);
  const average = rated.length ? rated.reduce((sum, r) => sum + r.rating!, 0) / rated.length : 0;

  return (
    <section aria-labelledby="stories-title" className="relative -mt-6 pb-6 sm:pb-10">
      <div className="container-page flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <Eyebrow emoji="💬">{t.eyebrow}</Eyebrow>
          <h2
            id="stories-title"
            className="mt-4 font-luxe text-[clamp(1.9rem,3.2vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-ink-950"
          >
            {sample ? t.sampleTitle : t.title}
          </h2>
          {real ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-ink-600">
              {rated.length ? (
                <>
                  <span className="inline-flex gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={15} className={i < Math.round(average) ? "fill-gold-300 text-gold-400" : "text-ink-300"} />
                    ))}
                  </span>
                  <b className="text-ink-950">{average.toFixed(1)}/5</b>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              {t.count.replace("{n}", String(items.length))}
            </p>
          ) : sample ? (
            <p className="mt-2 text-body-sm text-ink-600">{t.sampleSubtitle}</p>
          ) : null}
        </div>
        <ReviewComposer />
      </div>

      {cards.length > 0 ? (
        <div className="mt-6">
          <StoryRibbon cards={cards} labels={t} />
        </div>
      ) : (
        <div className="container-page mt-6">
          <p className="rounded-[26px] border border-dashed border-surface-strong bg-surface/70 px-6 py-10 text-center text-body text-ink-600">
            {t.empty}
          </p>
        </div>
      )}
    </section>
  );
}
