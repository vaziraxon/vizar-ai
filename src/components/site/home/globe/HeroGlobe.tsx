"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Flag } from "@/components/site/Flag";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG, type DestinationSlug } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

// three.js + R3F load in their own chunk, after the page is idle
const Globe3D = dynamic(() => import("./Globe3D").then((m) => m.Globe3D), { ssr: false });

/** Mascot artwork (transparent WebP, 984×1393) standing in front of the globe. */
const MASCOT = { src: "/images/mascot/penguin.webp", width: 984, height: 1393 };

/**
 * Destination cards floating around the globe (positions in % of the stage),
 * kept clear of the mascot on the left.
 */
const CHIPS: { slug: DestinationSlug; className: string; tilt: number; delay: number }[] = [
  { slug: "canada", className: "left-[30%] top-[1%]", tilt: -6, delay: 0 },
  { slug: "schengen", className: "right-[1%] top-[9%]", tilt: 6, delay: 1100 },
  { slug: "usa", className: "right-[-1%] top-[37%] hidden sm:inline-flex", tilt: 5, delay: 2200 },
  { slug: "uk", className: "right-[1%] top-[63%] hidden sm:inline-flex", tilt: -5, delay: 3300 },
  { slug: "uae", className: "right-[16%] -bottom-[1%]", tilt: 4, delay: 4400 },
];

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero's right side: the VIZAR penguin standing in front of an
 * interactive 3D globe (lazy, client-only) over a static CSS globe that shows
 * first and stays as the fallback when WebGL is missing. Rendering pauses
 * while the stage is off screen. The mascot only floats — no blinking or
 * waving until layered artwork exists.
 */
export function HeroGlobe({ className }: { className?: string }) {
  const site = useSite();
  const stage = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [env, setEnv] = useState({ reducedMotion: false, compact: false });

  useEffect(() => {
    const el = stage.current;
    if (!el || !webglAvailable()) return;
    setEnv({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      compact: window.matchMedia("(max-width: 767px)").matches,
    });
    const io = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), { rootMargin: "120px" });
    io.observe(el);
    const start = () => setMounted(true);
    const idle = window.requestIdleCallback?.(start, { timeout: 1500 });
    const timer = idle === undefined ? window.setTimeout(start, 500) : undefined;
    return () => {
      io.disconnect();
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={stage} className={cn("relative mx-auto aspect-square w-full max-w-[600px]", className)}>
      {/* The globe sits right of centre so the mascot can stand in front of its lower left */}
      <div className="absolute inset-0 translate-x-[10%]">
        {/* Static globe: first paint, and the fallback without WebGL */}
        <div
          aria-hidden="true"
          className={cn("globe-fallback absolute inset-[10%] rounded-full transition-opacity duration-700", ready && "opacity-0")}
        />
        {mounted && (
          <div className={cn("absolute -inset-[6%] transition-opacity duration-1000 ease-out", ready ? "opacity-100" : "opacity-0")}>
            <Globe3D active={active} reducedMotion={env.reducedMotion} compact={env.compact} onReady={() => setReady(true)} />
          </div>
        )}
      </div>

      {/* Mascot: a contact shadow that tightens as it floats up, then the artwork */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[1.5%] left-[1%] h-[6%] w-[50%] animate-float-shadow rounded-[50%] bg-[radial-gradient(closest-side,rgba(16,17,34,0.34),rgba(16,17,34,0))] motion-reduce:animate-none dark:bg-[radial-gradient(closest-side,rgba(0,0,0,0.55),rgba(0,0,0,0))]"
      />
      <div className="pointer-events-none absolute bottom-0 -left-[4%] w-[56%] animate-float motion-reduce:animate-none" style={{ ["--tilt" as string]: "0deg" }}>
        <Image
          src={MASCOT.src}
          width={MASCOT.width}
          height={MASCOT.height}
          alt={site.home.hero.mascotAlt}
          priority
          sizes="(min-width: 1024px) 340px, 56vw"
          className="h-auto w-full select-none drop-shadow-[0_18px_26px_rgba(16,17,34,0.22)]"
        />
      </div>

      {CHIPS.map(({ slug, className: place, tilt, delay }) => (
        <span
          key={slug}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inline-flex select-none items-center gap-2 rounded-2xl border border-white/90 bg-surface/80 py-1.5 pl-1.5 pr-3 shadow-float backdrop-blur-md animate-float motion-reduce:animate-none dark:border-white/10",
            place
          )}
          style={{ ["--tilt" as string]: `${tilt}deg`, transform: `rotate(${tilt}deg)`, animationDelay: `${delay}ms` }}
        >
          <Flag code={DESTINATION_BY_SLUG[slug].flag} size={26} />
          <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] text-ink-900">
            {site.destinations[slug].name}
          </span>
        </span>
      ))}
    </div>
  );
}
