"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { HeroGlobe } from "@/components/site/home/globe/HeroGlobe";
import { Starfield } from "@/components/site/home/Starfield";
import { Eyebrow } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";

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

export function HomeHero() {
  const site = useSite();
  const hero = site.home.hero;
  const h = hero.headline;
  const { section, glow } = usePointerGlow();
  // "VIZAR." in Russian/English: punctuation hugs the wordmark
  const postGap = h.line2Post && !/^[.,!?]/.test(h.line2Post) ? " " : "";

  return (
    <section ref={section} className="lime-wash grain relative overflow-hidden">
      {/* Aurora — violet, periwinkle and lime blobs drifting slowly; the
          bottom fades into the canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -left-32 top-24 h-[420px] w-[420px] animate-drift rounded-full bg-[#b3a4fc]/55 blur-[100px] dark:bg-violet-600/25 motion-reduce:animate-none" />
        <span className="absolute -right-24 -top-10 h-[480px] w-[480px] animate-drift rounded-full bg-[#bcd2f8]/60 blur-[110px] dark:bg-brand-600/20 [animation-delay:-6s] motion-reduce:animate-none" />
        <span className="absolute bottom-0 left-1/3 h-[340px] w-[560px] animate-drift rounded-full bg-[#e4f59a]/60 blur-[100px] dark:bg-citron-300/[0.06] [animation-delay:-12s] motion-reduce:animate-none" />
        <span
          ref={glow}
          className="absolute left-0 top-0 h-[600px] w-[600px] translate-x-[55vw] translate-y-[10vh] rounded-full bg-white/40 blur-[110px] transition-transform duration-[1800ms] ease-premium dark:bg-violet-500/15"
        />
        <Starfield />
        <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-surface-canvas/0 to-surface-canvas" />
      </div>

      <div className="container-page relative grid items-center gap-8 pb-12 pt-28 sm:pt-32 lg:grid-cols-12 lg:gap-4 lg:pb-14 lg:pt-36">
        <div className="lg:col-span-7">
          <div className="animate-rise" style={delay(60)}>
            <Eyebrow emoji="✨" className="border-white/80 bg-surface/70 backdrop-blur dark:border-white/10">
              {hero.eyebrow}
            </Eyebrow>
          </div>

          <h1 className="mt-8 font-luxe text-ink-950">
            <span className="block overflow-hidden pb-[0.14em]">
              <span
                className="block animate-reveal-up text-[clamp(3rem,6.2vw,5.6rem)] font-semibold leading-[0.98] tracking-[-0.035em]"
                style={delay(180)}
              >
                {h.line1}
              </span>
            </span>
            <span
              className="relative inline-block animate-rise text-[clamp(2.4rem,4.7vw,4.15rem)] leading-[1.06] tracking-[-0.02em]"
              style={delay(560)}
            >
              {h.line2Pre && <span className="font-luxe-italic font-medium italic">{h.line2Pre} </span>}
              <span className="bg-gradient-to-br from-[#5B21B6] via-[#7138EC] to-[#A78BFA] bg-clip-text pr-[0.08em] font-accent font-semibold italic text-transparent dark:from-violet-300 dark:via-[#B79BFF] dark:to-[#ECE4FF]">
                VIZAR
              </span>
              {h.line2Post && (
                <span className="font-luxe-italic font-medium italic">
                  {postGap}
                  {h.line2Post}
                </span>
              )}
              {/* Champagne underline, drawn left → right */}
              <svg
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
                  style={delay(950)}
                />
              </svg>
            </span>
          </h1>

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
