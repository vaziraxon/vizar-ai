"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { HeroGlobe } from "@/components/site/home/globe/HeroGlobe";
import { HeroSky } from "@/components/site/home/HeroSky";
import { Eyebrow } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

/** A soft glow that drifts toward the pointer (CSS-eased, so it lags gently). */
function usePointerGlow() {
  const section = useRef<HTMLElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = section.current;
    const light = glow.current;
    if (!el || !light) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        light.style.transform = `translate3d(${e.clientX - rect.left - 300}px, ${e.clientY - rect.top - 300}px, 0)`;
      });
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return { section, glow };
}

const HEADLINE_SWAP_MS = 5_000;
// USA, Schengen (EU), Canada: the destinations the second headline names
const ALT_FLAGS = ["us", "eu", "ca"] as const;

/** Italic line 2 wrapped around the VIZAR wordmark, with the champagne underline drawn left → right. */
function WordmarkLine({
  copy,
  underlineKey,
  underlineDelay,
  className,
  style,
}: {
  copy: { line2Pre: string; line2Post: string };
  underlineKey: number;
  underlineDelay: number;
  className?: string;
  style?: CSSProperties;
}) {
  // "VIZAR." in Russian/English: punctuation hugs the wordmark
  const postGap = copy.line2Post && !/^[.,!?]/.test(copy.line2Post) ? " " : "";
  return (
    <span className={cn("relative inline-block text-[clamp(2.4rem,4.7vw,4.15rem)] leading-[1.06] tracking-[-0.02em]", className)} style={style}>
      {copy.line2Pre && <span className="font-luxe-italic font-medium italic">{copy.line2Pre} </span>}
      <span className="bg-gradient-to-br from-[#5B21B6] via-[#7138EC] to-[#A78BFA] bg-clip-text pr-[0.08em] font-accent font-semibold italic text-transparent dark:from-violet-300 dark:via-[#B79BFF] dark:to-[#ECE4FF]">
        VIZAR
      </span>
      {copy.line2Post && (
        <span className="font-luxe-italic font-medium italic">
          {postGap}
          {copy.line2Post}
        </span>
      )}
      <svg
        key={underlineKey}
        aria-hidden="true"
        className="absolute -bottom-[0.24em] left-[3%] h-[0.32em] w-[97%] overflow-visible"
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M3 18 C 72 7, 176 3, 297 9"
          pathLength={1}
          stroke="#EDB940"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1"
          className="animate-draw"
          style={delay(underlineDelay)}
        />
      </svg>
    </span>
  );
}

/**
 * The hero headline: every 5s it swaps between the main line and one naming
 * destinations (in red). Both share one grid cell, so the swap never moves the
 * page. Only the main line is exposed to screen readers. With reduced motion
 * the main line simply stays.
 */
function HeroHeadline() {
  const site = useSite();
  const { headline: h, headlineAlt: alt } = site.home.hero;
  const [swaps, setSwaps] = useState(0);
  const showAlt = swaps % 2 === 1;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Chained timeouts: each line gets its full time even if a timer fires late on a busy page
    let id = 0;
    const next = () => {
      id = window.setTimeout(() => {
        setSwaps((n) => n + 1);
        next();
      }, HEADLINE_SWAP_MS);
    };
    next();
    return () => window.clearTimeout(id);
  }, []);

  const layer = (visible: boolean) =>
    cn(
      "col-start-1 row-start-1 min-w-0 transition-[opacity,transform,filter] duration-700 ease-premium motion-reduce:transition-none",
      visible ? "translate-y-0 opacity-100 blur-0 delay-200" : "pointer-events-none opacity-0 blur-sm",
      !visible && (showAlt ? "-translate-y-4" : "translate-y-4")
    );

  return (
    <h1 className="mt-8 grid font-luxe text-ink-950">
      <span className={layer(!showAlt)}>
        <span className="block overflow-hidden pb-[0.14em]">
          <span
            className="block animate-reveal-up text-[clamp(3rem,6.2vw,5.6rem)] font-semibold leading-[0.98] tracking-[-0.035em]"
            style={delay(180)}
          >
            {h.line1}
          </span>
        </span>
        {/* The underline redraws each time this line comes back */}
        <WordmarkLine
          copy={h}
          underlineKey={Math.floor(swaps / 2)}
          underlineDelay={swaps === 0 ? 950 : 500}
          className="animate-rise"
          style={delay(560)}
        />
      </span>
      <span aria-hidden="true" className={layer(showAlt)}>
        <span className="block pb-[0.14em]">
          <span className="block bg-gradient-to-br from-[#9F1239] via-[#DC2626] to-[#F43F5E] bg-clip-text text-[clamp(2.6rem,5.6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-transparent dark:from-[#FB7185] dark:via-[#F87171] dark:to-[#FDA4AF]">
            {/* Bodoni commas read as full stops at this size, so they use the sturdier sans */}
            {alt.line1.split(/(,)/).map((part, i) =>
              part === "," ? (
                <span key={i} className="font-sans">
                  ,
                </span>
              ) : (
                part
              )
            )}
            {/* The named destinations as overlapping round flags; they pop in one by one each time this line appears */}
            <span key={Math.floor((swaps + 1) / 2)} className="ml-[0.26em] inline-flex items-center align-baseline">
              {ALT_FLAGS.map((code, i) => (
                <span
                  key={code}
                  className={cn("block animate-rise rounded-full shadow-[0_5px_10px_-5px_rgba(16,17,34,0.35)]", i > 0 && "-ml-[0.15em]")}
                  style={delay(450 + i * 110)}
                >
                  <Flag code={code} className="!h-[0.54em] !w-[0.54em] ring-2 ring-white dark:ring-night [&>svg]:h-full [&>svg]:w-full" />
                </span>
              ))}
            </span>
          </span>
        </span>
        <WordmarkLine copy={alt} underlineKey={Math.floor((swaps + 1) / 2)} underlineDelay={500} />
      </span>
    </h1>
  );
}

export function HomeHero() {
  const site = useSite();
  const hero = site.home.hero;
  const { section, glow } = usePointerGlow();

  return (
    <section ref={section} className="lime-wash grain relative overflow-hidden">
      <HeroSky glowRef={glow} />

      <div className="container-page relative grid items-center gap-8 pb-12 pt-28 sm:pt-32 lg:grid-cols-12 lg:gap-4 lg:pb-14 lg:pt-36">
        <div className="lg:col-span-7">
          <div className="animate-rise" style={delay(60)}>
            <Eyebrow emoji="✨" className="border-white/80 bg-surface/70 backdrop-blur dark:border-white/10">
              {hero.eyebrow}
            </Eyebrow>
          </div>

          <HeroHeadline />

          <p className="mt-9 max-w-[34rem] animate-rise text-body-lg text-ink-700" style={delay(1050)}>
            {hero.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <div className="animate-rise" style={delay(1180)}>
              <Link
                href="/register"
                className="btn btn-charcoal btn-sheen group h-14 w-full justify-between pl-7 pr-2 text-body hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(113,56,236,0.6)] sm:w-auto sm:justify-center sm:gap-4"
              >
                {hero.ctaPrimary}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-300 text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-night dark:text-gold-300">
                  <ArrowUpRight size={18} strokeWidth={2.4} className="transition-transform duration-200 group-hover:rotate-45" />
                </span>
              </Link>
            </div>
            <div className="animate-rise" style={delay(1280)}>
              <Link
                href="/how-it-works"
                className="btn btn-sheen h-14 w-full gap-3 border border-white/80 bg-surface/60 pl-2 pr-7 text-body text-ink-900 shadow-xs backdrop-blur hover:-translate-y-0.5 hover:bg-surface hover:shadow-card-hover dark:border-white/10 sm:w-auto"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-950 shadow-card ring-1 ring-ink-900/5 dark:ring-white/10">
                  <Play size={14} strokeWidth={2.4} className="ml-0.5 fill-current" />
                </span>
                {hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

        {/* Bleeds into the page margin only where the viewport has one to spare */}
        <div className="animate-rise lg:col-span-5 lg:-mr-2 xl:-mr-10 2xl:-mr-24" style={delay(300)}>
          <HeroGlobe />
        </div>
      </div>
    </section>
  );
}
