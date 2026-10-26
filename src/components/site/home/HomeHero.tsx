"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe2, Plane } from "lucide-react";
import { HeroPanel, SCORE } from "@/components/site/home/HeroPanel";
import { BoardingPass } from "@/components/site/home/BoardingPass";
import { Flag } from "@/components/site/Flag";
import { EmojiSticker, Eyebrow } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, PHOTO_CREDITS, type FlagCode } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

const TRUST_EMOJI = ["🎁", "🔒", "🏛️"];
const CLUSTER_FLAGS: FlagCode[] = ["eu", "us", "gb", "jp", "kr"];
const AVAILABLE_DESTINATIONS = DESTINATIONS.filter((d) => d.available).length;
const HERO_PHOTO = "/images/travel/passports.webp";
const ROTATE_MS = 2400;
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

/** Blue headline chip cycling through destinations; sized to the longest word so nothing shifts. */
function RotatingChip({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((v) => (v + 1) % words.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [words]);

  const prev = (index - 1 + words.length) % words.length;
  return (
    <span className="relative inline-grid -rotate-2 overflow-hidden rounded-[0.3em] bg-brand-600 px-[0.34em] pb-[0.06em] text-white shadow-[0_14px_32px_-12px_rgba(37,99,235,0.7)]">
      {words.map((word, i) => (
        <span
          key={word}
          className={cn(
            "col-start-1 row-start-1 whitespace-nowrap text-center transition-[opacity,transform] duration-500 ease-premium",
            i === index ? "translate-y-0 opacity-100" : i === prev ? "-translate-y-[0.7em] opacity-0" : "translate-y-[0.7em] opacity-0"
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

function IconCircle({ tone, children }: { tone: "blue" | "white"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[0.86em] w-[0.86em] shrink-0 items-center justify-center rounded-full [&_svg]:h-[0.46em] [&_svg]:w-[0.46em]",
        tone === "blue"
          ? "bg-brand-600 text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.8)]"
          : "bg-surface text-ink-950 shadow-card ring-1 ring-ink-900/5 dark:ring-white/10"
      )}
    >
      {children}
    </span>
  );
}

/**
 * Desktop "rising screen": the product stage starts tilted back and settles
 * flat as it scrolls into view. Off for reduced motion and narrow screens.
 */
function useRiseOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    let frame = 0;
    const update = () => {
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.75)));
      el.style.transform = `perspective(1600px) rotateX(${((1 - p) * 12).toFixed(2)}deg) scale(${(0.965 + p * 0.035).toFixed(3)})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, []);
  return ref;
}

export function HomeHero() {
  const stageRef = useRiseOnScroll();
  const site = useSite();
  const hero = site.home.hero;
  const h = hero.headline;
  const credit = PHOTO_CREDITS[HERO_PHOTO]!;

  return (
    <>
      <section className="hero-sky grain relative overflow-hidden">
        {/* Aurora — three soft blobs drifting slowly */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -left-32 top-24 h-[420px] w-[420px] animate-drift rounded-full bg-[#93b8fd]/55 blur-[100px] dark:bg-brand-600/25 motion-reduce:animate-none" />
          <span className="absolute -right-24 -top-10 h-[480px] w-[480px] animate-drift rounded-full bg-[#c4b5fd]/65 blur-[110px] dark:bg-violet-600/25 [animation-delay:-6s] motion-reduce:animate-none" />
          <span className="absolute bottom-0 left-1/3 h-[340px] w-[560px] animate-drift rounded-full bg-surface/55 blur-[100px] dark:bg-white/[0.03] [animation-delay:-12s] motion-reduce:animate-none" />
        </div>
        <div className="container-page relative pb-20 pt-28 sm:pt-36 lg:pb-24 lg:pt-44">
          {/* Floating emoji stickers — desktop only, decorative */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
            {/* Flight path — dashes march from the passport to the globe */}
            <svg
              className="absolute right-[3%] top-[104px] h-[150px] w-[40%] overflow-visible"
              viewBox="0 0 400 150"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M8 132 C 110 18, 250 4, 392 40"
                stroke="rgba(37, 99, 235, 0.45)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 12"
                vectorEffect="non-scaling-stroke"
                className="animate-dash motion-reduce:animate-none"
              />
            </svg>
            <EmojiSticker emoji="🌍" size="lg" tilt={8} className="absolute right-6 top-[118px]" />
            <EmojiSticker emoji="🛂" tilt={-10} delay={900} className="absolute right-[21%] top-[132px]" />
            <EmojiSticker emoji="🧳" size="sm" tilt={14} delay={1800} className="absolute right-[11%] top-[190px]" />
            <EmojiSticker emoji="📄" size="sm" tilt={-8} delay={2600} className="absolute right-[38%] top-[112px]" />
          </div>

          <div className="animate-fade-up" style={delay(0)}>
            <Eyebrow emoji="✨" className="border-white/80 dark:border-white/10 bg-surface/70 backdrop-blur">
              {hero.eyebrow}
            </Eyebrow>
          </div>

          <h1
            className="mt-7 animate-fade-up font-display text-[clamp(2.4rem,5.8vw,4.15rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-ink-950"
            style={delay(60)}
          >
            <span className="sr-only">
              {h.line1} {h.rotating.join(", ")}. {h.line2Pre} VIZAR {h.line2Post}
            </span>
            <span aria-hidden="true" className="flex flex-wrap items-center gap-x-[0.26em] gap-y-[0.14em]">
              <span>{h.line1}</span>
              <RotatingChip words={h.rotating} />
              <IconCircle tone="blue">
                <Plane strokeWidth={2.4} />
              </IconCircle>
            </span>
            <span aria-hidden="true" className="mt-[0.14em] flex flex-wrap items-center gap-x-[0.26em] gap-y-[0.14em]">
              <IconCircle tone="white">
                <Globe2 strokeWidth={2.2} />
              </IconCircle>
              <span>{h.line2Pre}</span>
              <span className="inline-block rotate-2 rounded-[0.3em] bg-surface px-[0.32em] pb-[0.06em] shadow-card dark:bg-white dark:text-night">VIZAR</span>
              {h.line2Post && <span className="font-accent font-medium italic tracking-[-0.02em] text-brand-900">{h.line2Post}</span>}
            </span>
          </h1>

          <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-end">
            <div className="animate-fade-up lg:col-span-7" style={delay(140)}>
              <p className="max-w-[36rem] text-body-lg text-ink-700">{hero.subtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="btn btn-primary group h-14 justify-between pl-7 pr-2 text-body sm:justify-center sm:gap-4"
                >
                  {hero.ctaPrimary}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-600 transition-transform dark:bg-white dark:text-brand-deep duration-200 group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.4} />
                  </span>
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn h-14 border border-white/80 dark:border-white/10 bg-surface/75 px-7 text-body text-ink-900 shadow-xs backdrop-blur hover:bg-surface"
                >
                  {hero.ctaSecondary}
                </Link>
              </div>
              <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {hero.trust.map((item, i) => (
                  <li key={item} className="flex items-center gap-2 text-body-sm font-medium text-ink-800">
                    <span aria-hidden="true" className="text-[16px] leading-none">
                      {TRUST_EMOJI[i]}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Honest social proof: where VIZAR can help today — no ratings, no user counts */}
            <div className="animate-fade-up lg:col-span-5 lg:justify-self-end" style={delay(220)}>
              <div className="inline-flex items-center gap-4 rounded-pill border border-white/80 dark:border-white/10 bg-surface/60 py-2 pl-2 pr-6 shadow-xs backdrop-blur">
                <span className="flex -space-x-3">
                  {CLUSTER_FLAGS.map((code) => (
                    <Flag key={code} code={code} size={40} className="ring-[3px] ring-surface" />
                  ))}
                </span>
                <span>
                  <span className="block font-display text-body-lg font-bold leading-tight text-ink-950">
                    {hero.cluster.replace("{n}", String(AVAILABLE_DESTINATIONS))}
                  </span>
                  <span className="block text-caption text-ink-600">{hero.clusterNote}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product stage — a glass frame that overlaps the edge of the sky */}
      <section aria-label={site.home.tour.label} className="relative z-10 -mt-8 lg:-mt-12">
        <div className="container-page">
          <div ref={stageRef} className="origin-top will-change-transform">
          <div className="animate-fade-up rounded-[32px] border border-white dark:border-white/10 bg-surface/70 p-2.5 shadow-float backdrop-blur-xl sm:p-3" style={delay(280)}>
            <div className="grid gap-3 lg:grid-cols-12">
              <figure className="relative min-h-[240px] overflow-hidden rounded-[24px] sm:min-h-[340px] lg:col-span-7 lg:min-h-0">
                <Image src={HERO_PHOTO} alt="" fill priority sizes="(min-width: 1024px) 680px, 100vw" className="object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-brand-950/45 via-violet-600/10 to-transparent" />
                <EmojiSticker
                  emoji="🛂"
                  label={`${hero.panel.docs[0]!.name} · ${site.common.ready}`}
                  tilt={-3}
                  className="absolute left-4 top-4 hidden sm:inline-flex"
                />
                <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[380px]">
                  <BoardingPass score={SCORE} />
                </div>
                <figcaption className="absolute right-3 top-3 rounded-pill bg-night-950/35 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  Foto: {credit.author} · Unsplash
                </figcaption>
              </figure>
              <div className="lg:col-span-5">
                <HeroPanel />
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
