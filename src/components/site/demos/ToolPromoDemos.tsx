"use client";

import type { ReactNode } from "react";
import { CalendarPlus, Check, Download, Printer } from "lucide-react";
import { DemoBadge } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import type { ToolKey } from "@/lib/dashboard/tool-promos";
import { PHOTO_SPEC_BY_ID, guideLines } from "@/lib/site/visa-photo";
import { coverLetter, shortDate, type CoverData } from "@/lib/site/visa-letters";
import { timing } from "@/lib/site/visa-timing";
import { MAX_DAYS, checkStays, type Stay } from "@/lib/site/schengen";
import { cn } from "@/lib/utils";

/*
 * The demo cards on the four promo pages. Every number comes from the tool's
 * own code run on fixed, made-up input, so the card shows what the tool
 * really produces — and the DEMO badge says it is a sample.
 */

const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [key, value]) => out.split(`{${key}}`).join(String(value)), text);

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-surface-border pb-4">
        <p className="text-body-sm font-semibold text-ink-900">{title}</p>
        <DemoBadge />
      </div>
      {children}
    </div>
  );
}

const ok = (text: string) => (
  <li className="flex items-start gap-2 text-body-sm text-ink-700">
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
      <Check size={11} strokeWidth={3} />
    </span>
    {text}
  </li>
);

const fakeButton = (icon: ReactNode, text: string, primary = false) => (
  <span
    aria-hidden="true"
    className={cn(
      "flex items-center justify-center gap-2 rounded-pill px-4 py-2.5 text-body-sm font-semibold",
      primary ? "bg-brand-600 text-white" : "border border-surface-border bg-surface text-ink-800"
    )}
  >
    {icon} {text}
  </span>
);

function PhotoDemo() {
  const site = useSite();
  const c = site.visaPhoto;
  const g = guideLines(PHOTO_SPEC_BY_ID.schengen);
  return (
    <Frame title={c.title}>
      <div className="flex flex-wrap gap-1.5">
        {(["schengen", "usa", "canada"] as const).map((id, i) => (
          <span
            key={id}
            className={cn(
              "rounded-pill border px-2.5 py-1 text-caption font-semibold",
              i === 0 ? "border-brand-400 bg-brand-50 text-brand-800 dark:text-brand-200" : "border-surface-border text-ink-600"
            )}
          >
            {site.destinations[id].name}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[120px_1fr] items-start gap-5">
        <svg viewBox="0 0 35 45" className="w-full rounded-md ring-1 ring-surface-border" aria-hidden="true">
          <rect width="35" height="45" fill="#f6f6f4" />
          <ellipse cx="17.5" cy="50" rx="19" ry="9" fill="#2f3b52" />
          <rect x="14" y="35" width="7" height="7" fill="#e3bd99" />
          <ellipse cx="17.5" cy="20" rx="13.5" ry="18.5" fill="#3b2a20" />
          <ellipse cx="17.5" cy="23" rx="11.3" ry="16.5" fill="#e9c7a6" />
          <ellipse cx="13.3" cy="20.5" rx="1" ry="0.6" fill="#222" />
          <ellipse cx="21.7" cy="20.5" rx="1" ry="0.6" fill="#222" />
          <line x1="15" x2="20" y1="31.5" y2="31.5" stroke="#a0522d" strokeWidth="0.5" />
          <rect x="0" y={g.topHigh} width="35" height={g.topLow - g.topHigh} fill="rgba(124,58,237,0.18)" />
          <line x1="0" x2="35" y1={g.topHigh} y2={g.topHigh} stroke="#7c3aed" strokeWidth="0.35" strokeDasharray="1.2 0.9" />
          <line x1="0" x2="35" y1={g.topLow} y2={g.topLow} stroke="#7c3aed" strokeWidth="0.35" strokeDasharray="1.2 0.9" />
          <line x1="0" x2="35" y1={g.chin} y2={g.chin} stroke="#059669" strokeWidth="0.5" />
        </svg>
        <div className="min-w-0">
          <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{c.checksTitle}</p>
          <ul className="mt-2 space-y-2">
            {ok(c.checkCovered)}
            {ok(fill(c.checkSharp, { dpi: 600 }))}
            {ok(c.checkBackground)}
          </ul>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        {fakeButton(<Download size={14} />, fill(c.downloadPhoto, { w: 827, h: 1063 }), true)}
        {fakeButton(<Printer size={14} />, fill(c.downloadSheet, { n: 8 }))}
      </div>
    </Frame>
  );
}

// Made-up applicant for the letter sample
const SAMPLE_LETTER: CoverData = {
  place: "Taschkent",
  date: "2027-04-20",
  country: "DE",
  fullName: "Aziza Karimova",
  birthDate: "1995-03-08",
  passport: "FA1234567",
  address: "Chilonzor 9, Tashkent",
  phone: "+998 90 000 00 00",
  email: "",
  homeCity: "Tashkent",
  purpose: "tourism",
  from: "2027-05-12",
  to: "2027-05-14",
  days: [{ city: "Berlin", stay: "Hotel Example", plan: null }],
  funding: "self",
  sponsorName: "",
  relation: "father",
  position: "",
  employer: "",
};

function LettersDemo() {
  const site = useSite();
  const c = site.visaLetters;
  const blocks = coverLetter(SAMPLE_LETTER, "de");
  const title = blocks.find((b) => b.type === "title");
  const fields = blocks.find((b) => b.type === "fields");
  const table = blocks.find((b) => b.type === "table");
  return (
    <Frame title={c.title}>
      <div className="flex gap-1.5">
        {["English", "Deutsch", "Русский"].map((name) => (
          <span
            key={name}
            className={cn("rounded-pill px-2.5 py-1 text-caption font-semibold", name === "Deutsch" ? "bg-brand-600 text-white" : "border border-surface-border text-ink-600")}
          >
            {name}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-white p-4 font-serif text-[11px] leading-snug text-black ring-1 ring-black/10">
        <p className="font-bold">Aziza Karimova</p>
        {title?.type === "title" && <p className="mt-2 text-center font-bold">{title.text}</p>}
        {fields?.type === "fields" && (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2">
            {fields.rows.slice(3).map(([k, v]) => (
              <div key={k} className="contents">
                <dt>{k}:</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {table?.type === "table" && (
          <table className="mt-2 w-full border-collapse text-[10px]">
            <thead>
              <tr>
                {table.head.map((h) => (
                  <th key={h} className="border border-black/40 px-1 py-0.5 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} className="border border-black/40 px-1 py-0.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4">{fakeButton(<Printer size={14} />, c.print, true)}</div>
    </Frame>
  );
}

function TimingDemo() {
  const site = useSite();
  const c = site.visaTiming;
  const t = timing("schengen", "2027-06-01", "2027-01-15")!;
  return (
    <Frame title={c.title}>
      <span className="rounded-pill border border-brand-400 bg-brand-50 px-2.5 py-1 text-caption font-semibold text-brand-800 dark:text-brand-200">
        {c.countries.schengen.label}
      </span>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-tint p-3.5">
          <p className="text-caption font-semibold text-ink-600">{c.results.earliest}</p>
          <p className="mt-1 font-luxe text-[1.45rem] font-semibold leading-none text-ink-950">{shortDate(t.earliest)}</p>
        </div>
        <div className="rounded-2xl bg-surface-tint p-3.5">
          <p className="text-caption font-semibold text-ink-600">{c.results.latest}</p>
          <p className="mt-1 font-luxe text-[1.45rem] font-semibold leading-none text-ink-950">{t.latest ? shortDate(t.latest) : c.results.none}</p>
        </div>
      </div>
      <p className="mt-3 rounded-2xl bg-emerald-500/10 px-3.5 py-2.5 text-body-sm font-medium text-emerald-800 dark:text-emerald-300">{c.status[t.status]}</p>
      <ul className="mt-3">{ok(c.passport.ok)}</ul>
      <div className="mt-4">{fakeButton(<CalendarPlus size={14} />, c.reminders.button, true)}</div>
    </Frame>
  );
}

// Made-up trips for the calculator sample
const SAMPLE_TRIPS: Stay[] = [
  { entry: "2026-09-01", exit: "2026-09-20" },
  { entry: "2026-12-20", exit: "2027-01-10" },
];

function SchengenDemo() {
  const site = useSite();
  const c = site.schengenCalc;
  // Fixed, valid sample trips: there is always a result
  const result = checkStays(SAMPLE_TRIPS, "2027-01-10")!;
  return (
    <Frame title={c.title}>
      <ul className="space-y-2">
        {SAMPLE_TRIPS.map((s) => (
          <li key={s.entry} className="flex items-center justify-between rounded-xl border border-surface-border px-3.5 py-2.5 text-body-sm text-ink-800">
            <span>
              {c.entry}: <b>{shortDate(s.entry)}</b>
            </span>
            <span>
              {c.exit}: <b>{shortDate(s.exit)}</b>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-tint p-3.5">
          <p className="text-caption font-semibold text-ink-600">{c.usedLabel}</p>
          <p className="mt-1 font-luxe text-[2rem] font-semibold leading-none text-ink-950">
            {result.used}
            <span className="font-sans text-body font-semibold text-ink-400">/{MAX_DAYS}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 p-3.5">
          <p className="text-caption font-semibold text-ink-600">{c.leftLabel}</p>
          <p className="mt-1 font-luxe text-[2rem] font-semibold leading-none text-ink-950">{result.left}</p>
        </div>
      </div>
      <p className="mt-3 rounded-2xl bg-emerald-500/10 px-3.5 py-2.5 text-body-sm font-medium text-emerald-800 dark:text-emerald-300">✓ {c.ok}</p>
    </Frame>
  );
}

export function ToolPromoDemo({ tool }: { tool: ToolKey }) {
  if (tool === "visaPhoto") return <PhotoDemo />;
  if (tool === "visaLetters") return <LettersDemo />;
  if (tool === "visaTiming") return <TimingDemo />;
  return <SchengenDemo />;
}
