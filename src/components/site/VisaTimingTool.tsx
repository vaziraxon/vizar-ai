"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, ExternalLink, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Button } from "@/components/ui/Button";
import { useSite } from "@/lib/i18n/site";
import { shortDate } from "@/lib/site/visa-letters";
import {
  addMonths,
  buildIcs,
  icsStamp,
  passportOk,
  reminderDates,
  timing,
  type IcsEvent,
  type TimingCountry,
  type TimingStatus,
} from "@/lib/site/visa-timing";
import { cn } from "@/lib/utils";

const COUNTRIES: TimingCountry[] = ["schengen", "uk"];
const SOURCES: Record<TimingCountry, { label: "sourceEu" | "sourceGb" | "sourceEmbassy"; url: string }[]> = {
  schengen: [
    { label: "sourceEu", url: "https://eur-lex.europa.eu/eli/reg/2009/810/oj" },
    { label: "sourceEmbassy", url: "https://taschkent.diplo.de/uz-uz/service/05-visaeinreise/2435518-2435518" },
  ],
  uk: [{ label: "sourceGb", url: "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa" }],
};

const STATUS_STYLE: Record<TimingStatus, string> = {
  early: "bg-brand-50 text-brand-800 dark:text-brand-200",
  open: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  late: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  past: "bg-red-500/10 text-red-700 dark:text-red-300",
};

const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [key, value]) => out.split(`{${key}}`).join(String(value)), text);

const card = "rounded-[28px] border border-surface-border bg-surface p-5 shadow-xs sm:p-7";
const inputCls = "input h-11 w-full min-w-0";
const labelCls = "mb-1.5 block text-caption font-semibold text-ink-600";

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** embedded: inside the dashboard — no public hero, sign-up CTA or page margins */
export function VisaTimingTool({ embedded = false }: { embedded?: boolean } = {}) {
  const site = useSite();
  const c = site.visaTiming;
  const [country, setCountry] = useState<TimingCountry>("schengen");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [expiry, setExpiry] = useState("");
  // After mount, so the server and the browser never disagree on "today".
  const [today, setToday] = useState("");

  useEffect(() => setToday(new Date().toLocaleDateString("en-CA")), []);

  const t = timing(country, start, today);
  const passport = country === "schengen" ? passportOk(expiry, end) : null;
  const dates = reminderDates(country, start, today);
  const label = c.countries[country].label;

  function download() {
    const events: IcsEvent[] = dates.map((r) => ({
      uid: `${country}-${r.kind}-${start}`,
      date: r.date,
      summary: `${label}: ${r.kind === "opens" ? c.reminders.opens : c.reminders.latest}`,
      description: fill(c.reminders.desc, { country: label }),
    }));
    save(new Blob([buildIcs(events, icsStamp(new Date()))], { type: "text/calendar;charset=utf-8" }), `vizar-visa-timing-${country}.ics`);
  }

  return (
    <>
      {!embedded && <PageHero emoji="🗓️" decor={["✈️", "⏳", "📅"]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />}

      <section className={embedded ? undefined : "pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16"}>
        <div className={cn(!embedded && "container-page", "grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-5")}>
          <div className={cn(card, "space-y-5 lg:col-span-2")}>
            <div>
              <p className={labelCls}>{c.countryLabel}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={c.countryLabel}>
                {COUNTRIES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={code === country}
                    onClick={() => setCountry(code)}
                    className={cn(
                      "rounded-pill border px-3.5 py-1.5 text-body-sm font-semibold transition-colors",
                      code === country ? "border-brand-400 bg-brand-50 text-brand-800 dark:text-brand-200" : "border-surface-border text-ink-700 hover:bg-surface-tint"
                    )}
                  >
                    {c.countries[code].label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-caption text-ink-600">{c.countries[country].rule}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="block">
                <span className={labelCls}>{c.fields.start}</span>
                <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>{c.fields.end}</span>
                <input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
              </label>
              {country === "schengen" && (
                <label className="block">
                  <span className={labelCls}>{c.fields.expiry}</span>
                  <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputCls} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            {t && (
              <div className={card} aria-live="polite">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-tint p-4">
                    <p className="text-caption font-semibold text-ink-600">{c.results.earliest}</p>
                    <p className="mt-1 font-luxe text-[1.9rem] font-semibold leading-none text-ink-950">{shortDate(t.earliest)}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-tint p-4">
                    <p className="text-caption font-semibold text-ink-600">{c.results.latest}</p>
                    <p className="mt-1 font-luxe text-[1.9rem] font-semibold leading-none text-ink-950">
                      {t.latest ? shortDate(t.latest) : <span className="text-body font-semibold text-ink-500">{c.results.none}</span>}
                    </p>
                  </div>
                </div>
                <p className={cn("mt-4 rounded-2xl px-4 py-3 text-body-sm font-medium", STATUS_STYLE[t.status])}>
                  {t.status === "early" ? fill(c.status.early, { date: shortDate(t.earliest) }) : c.status[t.status]}
                </p>
              </div>
            )}

            {country === "schengen" && (
              <div className={card}>
                <h2 className="flex items-center gap-2 text-body font-semibold text-ink-950">
                  <ShieldCheck size={18} className="text-emerald-600" aria-hidden="true" /> {c.fields.expiry}
                </h2>
                <p className="mt-2 text-body-sm text-ink-700">{c.passport.rule}</p>
                {passport === null ? (
                  <p className="mt-3 text-body-sm text-ink-500">{c.passport.notAsked}</p>
                ) : passport ? (
                  <p className="mt-3 rounded-2xl bg-emerald-500/10 px-4 py-3 text-body-sm font-medium text-emerald-800 dark:text-emerald-300">✓ {c.passport.ok}</p>
                ) : (
                  <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-body-sm font-medium text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                    ⚠️ {fill(c.passport.bad, { date: shortDate(addMonths(end, 3)) })}
                  </p>
                )}
              </div>
            )}

            <div className={cn(card, "space-y-3")}>
              <Button type="button" className="w-full whitespace-normal py-2.5 text-left" disabled={!dates.length} onClick={download}>
                <CalendarPlus size={16} aria-hidden="true" /> {c.reminders.button}
              </Button>
              <p className="text-caption text-ink-500">{dates.length ? c.reminders.note : c.reminders.none}</p>
            </div>
          </div>

          <div className={cn(card, "lg:col-span-5")}>
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{c.sourcesTitle}</p>
            <ul className="mt-2 space-y-1.5">
              {SOURCES[country].map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-my-2 inline-flex items-center gap-1 py-2 text-body-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    {c[s.label]} <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10">
              ⚠️ {c.disclaimer}
            </p>
            <p className="mt-3 text-caption text-ink-500">🔒 {c.privacy}</p>
          </div>
        </div>
      </section>

      {!embedded && <FinalCTA />}
    </>
  );
}
