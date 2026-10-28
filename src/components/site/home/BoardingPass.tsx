"use client";

import { Plane } from "lucide-react";
import { useSite } from "@/lib/i18n/site";

/**
 * VIZAR PASS — a glass boarding pass laid over the hero photo. It mirrors the
 * demo route in the hero panel (Schengen · France) and its readiness score.
 */
export function BoardingPass({ score }: { score: number }) {
  const site = useSite();
  const pass = site.home.hero.pass;

  return (
    <div aria-hidden="true" className="flex overflow-hidden rounded-[22px] border border-white/90 dark:border-white/10 bg-surface/90 shadow-float backdrop-blur-md">
      <div className="min-w-0 flex-1 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">VIZAR PASS</p>
          <span className="rounded-md bg-surface-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-500">
            {site.common.demo}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <div>
            <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.02em] text-ink-950">TAS</p>
            <p className="mt-1 text-caption text-ink-500">{pass.fromCity}</p>
          </div>
          <div className="flex flex-1 items-center gap-1.5 pb-4 text-violet-600 dark:text-citron-300">
            <span className="flex-1 border-t-2 border-dotted border-violet-300" />
            <Plane size={16} strokeWidth={2.4} className="shrink-0" />
            <span className="flex-1 border-t-2 border-dotted border-violet-300" />
          </div>
          <div className="text-right">
            <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.02em] text-ink-950">CDG</p>
            <p className="mt-1 text-caption text-ink-500">{pass.toCity}</p>
          </div>
        </div>
      </div>
      {/* Stub */}
      <div className="flex w-[84px] shrink-0 flex-col items-center justify-center border-l-2 border-dashed border-surface-border bg-gradient-to-b from-brand-50/80 to-violet-50/80 sm:w-[96px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">{pass.scoreLabel}</p>
        <p className="mt-1 font-accent text-[34px] font-semibold italic leading-none text-brand-700">{score}</p>
      </div>
    </div>
  );
}
