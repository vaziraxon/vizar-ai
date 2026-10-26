"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { DemoBadge, DocStateChip } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

export const SCORE = 82;
// Same order as panel.docs in every language: passport, bank, insurance, itinerary
const DOC_EMOJI = ["🛂", "🏦", "🩺", "🗺️"];

function ScoreRing({ value }: { value: number }) {
  const size = 104;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="ring-draw stroke-brand-600"
          style={{ ["--ring-circumference" as string]: `${c}px` }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[30px] font-bold leading-none tracking-[-0.04em] text-ink-900">{value}</span>
        <span className="mt-1 text-[10px] font-medium text-ink-500">/ 100</span>
      </span>
    </div>
  );
}

/** Five-step journey; the current step is blue with a soft (static) halo. */
export function JourneyBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start" aria-label={steps.join(", ")}>
      {steps.map((step, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn("absolute right-1/2 top-[7px] h-px w-full", i <= current ? "bg-brand-600" : "bg-surface-strong")}
              />
            )}
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "relative z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full",
                done && "bg-brand-deep text-white",
                isCurrent && "bg-brand-600 ring-4 ring-brand-100",
                !done && !isCurrent && "border border-surface-strong bg-surface"
              )}
            >
              {done && <Check size={9} strokeWidth={3.5} />}
            </span>
            <span className={cn("text-[11px] font-medium leading-tight", isCurrent ? "text-brand-700" : done ? "text-ink-800" : "text-ink-500")}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The hero's product panel: a real-feeling readiness view with three tabs
 * (overview, documents, roadmap). All figures are demo data and labelled so.
 */
export function HeroPanel() {
  const site = useSite();
  const p = site.home.hero.panel;
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();

  const ready = p.docs.filter((d) => d.state === "ready").length;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (tab + (e.key === "ArrowRight" ? 1 : p.tabs.length - 1)) % p.tabs.length;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Flag code="eu" size={22} />
          <p className="truncate text-body-sm font-semibold text-ink-900">{p.route}</p>
        </div>
        <DemoBadge />
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label={p.route} className="flex gap-5 border-b border-surface-border px-5">
        {p.tabs.map((label, i) => (
          <button
            key={label}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={`${uid}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={tab === i}
            aria-controls={`${uid}-panel`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            onKeyDown={onKey}
            className={cn(
              "relative -mb-px border-b-2 py-3 text-body-sm font-medium transition-colors duration-200",
              tab === i ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-800"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${tab}`}
        key={tab}
        className="min-h-[348px] animate-fade-in p-5 sm:p-6"
      >
        {tab === 0 && (
          <div>
            <div className="flex items-center gap-5">
              <ScoreRing value={SCORE} />
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink-900">{p.scoreLabel}</p>
                <p className="mt-0.5 text-caption text-ink-500">{p.scoreNote}</p>
                <div className="mt-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-caption">
                    <span className="font-medium text-ink-700">{p.docsTitle}</span>
                    <span className="whitespace-nowrap text-ink-500">{p.docsSummary}</span>
                  </div>
                  <div className="mt-2 flex gap-1" aria-hidden="true">
                    {p.docs.map((d) => (
                      <span
                        key={d.name}
                        className={cn(
                          "h-1.5 flex-1 rounded-full",
                          d.state === "ready" ? "bg-brand-600" : d.state === "review" ? "bg-amber-400" : "bg-surface-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-xl bg-surface-tint p-4">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-[18px] ring-1 ring-violet-100">
                🗺️
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-caption font-medium text-ink-500">{p.nextLabel}</p>
                <p className="mt-0.5 text-body-sm font-semibold text-ink-900">{p.nextText}</p>
                <p className="mt-0.5 text-caption text-ink-500">{p.nextHint}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-200 hover:translate-x-0.5">
                <ArrowRight size={16} />
              </span>
            </div>

            <div className="mt-6 border-t border-surface-border pt-5">
              <JourneyBar steps={site.home.hero.journey.steps} current={2} />
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <ul className="divide-y divide-surface-border">
              {p.docs.map((doc, i) => (
                <li key={doc.name} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-3 text-body-sm font-medium text-ink-900">
                    <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[15px]">
                      {DOC_EMOJI[i]}
                    </span>
                    <span className="truncate">{doc.name}</span>
                  </span>
                  <DocStateChip state={doc.state} />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-violet-600" />
              <p className="text-body-sm text-ink-700">{p.aiNote}</p>
            </div>
            <p className="mt-4 text-caption text-ink-500">
              {ready}/{p.docs.length} · {p.docsSummary}
            </p>
          </div>
        )}

        {tab === 2 && (
          <ol className="relative">
            {p.roadmap.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
                {i < p.roadmap.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn("absolute left-[7px] top-5 h-[calc(100%-12px)] w-px", step.state === "done" ? "bg-brand-600" : "bg-surface-border")}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 mt-[3px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full",
                    step.state === "done" && "bg-brand-deep text-white",
                    step.state === "current" && "bg-brand-600 ring-4 ring-brand-100",
                    step.state === "todo" && "border border-surface-strong bg-surface"
                  )}
                >
                  {step.state === "done" && <Check size={9} strokeWidth={3.5} />}
                </span>
                <div className="flex flex-1 items-baseline justify-between gap-3">
                  <p className={cn("text-body-sm font-medium", step.state === "todo" ? "text-ink-600" : "text-ink-900")}>
                    {step.title}
                  </p>
                  <p className={cn("shrink-0 text-caption", step.state === "current" ? "font-semibold text-brand-700" : "text-ink-500")}>
                    {step.when}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
