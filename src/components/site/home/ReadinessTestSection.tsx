"use client";

import { ClipboardCheck } from "lucide-react";
import { LocalLink as Link } from "@/components/site/LocalLink";
import { CheckLine, DemoBadge, Eyebrow, PillArrow, VIOLET_PILL } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"] as const;
// The sample card: answer B picked, 63% overall — the same scoring as the real test
const PICKED = 1;
const SAMPLE_PERCENT = 63;

/** Homepage promo for the document readiness test (4 options per document, no uploads). */
export function ReadinessTestSection() {
  const t = useSite().home.readinessTest;
  const ring = 2 * Math.PI * 34;

  return (
    <section aria-labelledby="rt-title" className="pb-12 pt-4 md:pb-14 lg:pb-16">
      <div className="container-page">
        <div data-reveal className="card grid items-center gap-10 overflow-hidden rounded-[32px] p-6 sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-12">
          {/* Copy */}
          <div className="lg:col-span-6">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 id="rt-title" className="mt-5 font-display text-display-lg font-extrabold tracking-[-0.035em] text-ink-950">
              {t.title}
            </h2>
            <p className="mt-4 text-body-lg text-ink-600">{t.subtitle}</p>
            <ul className="mt-6 space-y-3">
              {t.points.map((p) => (
                <CheckLine key={p} className="text-body">
                  {p}
                </CheckLine>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/dashboard/documents/check" className={VIOLET_PILL}>
                {t.cta}
                <PillArrow />
              </Link>
            </div>
            <p className="mt-5 max-w-md text-caption text-ink-500">{t.note}</p>
          </div>

          {/* Sample of the test */}
          <div aria-hidden="true" className="lg:col-span-6">
            <div className="relative mx-auto max-w-md rounded-[26px] bg-surface-tint p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2.5 font-display text-body-lg font-bold text-ink-950">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-brand-600 shadow-card">
                    <ClipboardCheck size={20} strokeWidth={2} />
                  </span>
                  {t.doc}
                </p>
                <DemoBadge />
              </div>

              <ul className="mt-5 space-y-2.5">
                {t.options.map((label, i) => (
                  <li
                    key={label}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-3 text-body-sm font-semibold ring-1",
                      i === PICKED ? "text-brand-800 ring-2 ring-brand-500 dark:text-white" : "text-ink-700 ring-surface-border dark:ring-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-bold",
                        i === PICKED ? "bg-brand-600 text-white" : "bg-surface-tint text-ink-500"
                      )}
                    >
                      {LETTERS[i]}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-surface p-4">
                <svg viewBox="0 0 80 80" className="h-16 w-16 shrink-0 -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="stroke-brand-100 dark:stroke-white/10" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ring}
                    strokeDashoffset={ring * (1 - SAMPLE_PERCENT / 100)}
                    className="stroke-brand-600"
                  />
                </svg>
                <div>
                  <p className="font-display text-display-sm font-extrabold text-ink-950">{SAMPLE_PERCENT}%</p>
                  <p className="text-body-sm font-semibold text-ink-700">{t.result}</p>
                  <p className="text-caption text-ink-500">{t.resultNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
