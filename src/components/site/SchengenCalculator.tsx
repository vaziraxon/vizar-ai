"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FinalCTA } from "@/components/site/FinalCTA";
import { useSite } from "@/lib/i18n/site";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import { MAX_DAYS, MAX_STAYS, checkStays, isValidStay, longestStayFrom, type Stay } from "@/lib/site/schengen";
import { cn } from "@/lib/utils";

const OFFICIAL_URL = "https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en";

/** dd.mm.yyyy in every language, so no locale data is needed to show a date. */
const showDate = (iso: string) => iso.split("-").reverse().join(".");
const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [key, value]) => out.replace(`{${key}}`, String(value)), text);
/** Today in the visitor's own time zone, as YYYY-MM-DD */
const localToday = () => new Date().toLocaleDateString("en-CA");

const card = "rounded-[28px] border border-surface-border bg-surface p-5 shadow-xs sm:p-7";
const dateInput = "input h-11 w-full min-w-0";
const label = "mb-1.5 block text-caption font-semibold text-ink-600";

/** embedded: inside the dashboard — no public hero, sign-up CTA or page margins */
export function SchengenCalculator({ embedded = false }: { embedded?: boolean } = {}) {
  const site = useSite();
  const c = site.schengenCalc;
  // Saved in this browser only, so a returning visitor keeps their trips.
  const [stays, setStays] = useLocalState<Stay[]>("vizar-schengen-trips", [{ entry: "", exit: "" }]);
  const [checkOn, setCheckOn] = useState("");
  const [planEntry, setPlanEntry] = useState("");

  // After mount, so the server and the browser never disagree on "today".
  useEffect(() => setCheckOn((current) => current || localToday()), []);

  const update = (index: number, key: keyof Stay, value: string) =>
    setStays((prev) => prev.map((stay, i) => (i === index ? { ...stay, [key]: value } : stay)));
  const reversed = stays.some((s) => s.entry && s.exit && !isValidStay(s));
  const result = checkOn ? checkStays(stays, checkOn) : null;
  const plan = planEntry ? longestStayFrom(stays, planEntry) : null;

  return (
    <>
      {!embedded && <PageHero emoji="🧮" decor={["🇪🇺", "📅", "✈️"]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />}

      <section className={embedded ? undefined : "pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16"}>
        <div className={cn(!embedded && "container-page", "grid max-w-6xl gap-6 lg:grid-cols-5")}>
          <div className={cn(card, "lg:col-span-3")}>
            <h2 className="luxe-firm flex items-center gap-3 font-luxe text-[1.35rem] font-semibold tracking-[-0.01em] text-ink-950 sm:text-[1.6rem]">
              <span aria-hidden="true">🧳</span> {c.tripsTitle}
            </h2>
            <p className="mt-1 text-body-sm text-ink-600">{c.tripsHint}</p>

            <ol className="mt-5 space-y-3">
              {stays.map((stay, i) => (
                <li key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <label htmlFor={`entry-${i}`} className={label}>
                      {c.entry}
                    </label>
                    <input id={`entry-${i}`} type="date" value={stay.entry} onChange={(e) => update(i, "entry", e.target.value)} className={dateInput} />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor={`exit-${i}`} className={label}>
                      {c.exit}
                    </label>
                    <input
                      id={`exit-${i}`}
                      type="date"
                      value={stay.exit}
                      min={stay.entry || undefined}
                      onChange={(e) => update(i, "exit", e.target.value)}
                      className={dateInput}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStays((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [{ entry: "", exit: "" }]))}
                    aria-label={c.removeTrip}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ol>

            {reversed && (
              <p role="alert" className="mt-3 text-body-sm font-medium text-red-600">
                {c.invalid}
              </p>
            )}

            <button
              type="button"
              disabled={stays.length >= MAX_STAYS}
              onClick={() => setStays((prev) => [...prev, { entry: "", exit: "" }])}
              className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-800 transition-colors hover:bg-surface-tint disabled:opacity-50"
            >
              <Plus size={15} /> {c.addTrip}
            </button>

            <div className="mt-6 max-w-xs border-t border-surface-border pt-5">
              <label htmlFor="check-on" className={label}>
                {c.checkOn}
              </label>
              <input id="check-on" type="date" value={checkOn} onChange={(e) => setCheckOn(e.target.value)} className={dateInput} />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className={card} aria-live="polite">
              <h2 className="text-body-sm font-semibold uppercase tracking-[0.08em] text-ink-500">{c.resultTitle}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-tint p-4">
                  <p className="text-caption font-semibold text-ink-600">{c.usedLabel}</p>
                  <p className="mt-1 font-luxe text-[2.4rem] font-semibold leading-none text-ink-950">
                    {result?.used ?? 0}
                    <span className="font-sans text-body font-semibold text-ink-400">/{MAX_DAYS}</span>
                  </p>
                </div>
                <div className={cn("rounded-2xl p-4", (result?.left ?? MAX_DAYS) > 0 ? "bg-emerald-500/10" : "bg-red-500/10")}>
                  <p className="text-caption font-semibold text-ink-600">{c.leftLabel}</p>
                  <p className="mt-1 font-luxe text-[2.4rem] font-semibold leading-none text-ink-950">{result?.left ?? MAX_DAYS}</p>
                </div>
              </div>
              {result && (
                <p className="mt-3 text-caption text-ink-500">
                  {fill(c.period, { from: showDate(result.periodStart), to: showDate(result.periodEnd) })}
                </p>
              )}
              {result &&
                (result.overstay ? (
                  <p role="alert" className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-body-sm font-medium text-red-700 dark:text-red-300">
                    ⚠️ {fill(c.overstay, { date: showDate(result.overstay.date), n: result.overstay.used })}
                  </p>
                ) : (
                  <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-body-sm font-medium text-emerald-800 dark:text-emerald-300">✓ {c.ok}</p>
                ))}
            </div>

            <div className={card}>
              <h2 className="flex items-center gap-2 text-body font-semibold text-ink-950">
                <span aria-hidden="true">🗓️</span> {c.planTitle}
              </h2>
              <label htmlFor="plan-entry" className={cn(label, "mt-4")}>
                {c.planEntry}
              </label>
              <input id="plan-entry" type="date" value={planEntry} onChange={(e) => setPlanEntry(e.target.value)} className={dateInput} />
              {plan && (
                <p
                  className={cn(
                    "mt-4 rounded-2xl px-4 py-3 text-body-sm font-medium",
                    plan.days ? "bg-brand-50 text-brand-800 dark:text-brand-300" : "bg-red-500/10 text-red-700 dark:text-red-300"
                  )}
                >
                  {plan.days && plan.lastDay
                    ? fill(c.planResult, { date: showDate(planEntry), n: plan.days, last: showDate(plan.lastDay) })
                    : fill(c.planNone, { date: showDate(planEntry) })}
                </p>
              )}
            </div>
          </div>

          <div className={cn(card, "lg:col-span-5")}>
            <h2 className="flex items-center gap-2 text-body font-semibold text-ink-950">
              <span aria-hidden="true">📏</span> {c.ruleTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-body-sm text-ink-700">{c.ruleText}</p>
            <p className="mt-4 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10">
              ⚠️ {c.disclaimer}{" "}
              <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 underline-offset-2 hover:underline">
                {c.official} <ExternalLink size={13} />
              </a>
            </p>
          </div>
        </div>
      </section>

      {!embedded && <FinalCTA />}
    </>
  );
}
