"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { BookOpen, Check, Copy, ExternalLink, Printer, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Button } from "@/components/ui/Button";
import { PLAYBOOK_COUNTRIES, type PlaybookLang } from "@/data/interview-playbook";
import { useSite } from "@/lib/i18n/site";
import { useLanguage } from "@/lib/language-context";
import {
  COST_ITEMS,
  CURRENCIES,
  GAP,
  LETTER_COUNTRIES,
  MAX_DAYS,
  OUT_LANGS,
  PLANS,
  PURPOSES,
  RELATIONS,
  countryName,
  coverLetter,
  defaultPlan,
  employerLetter,
  letterText,
  shortDate,
  sponsorLetter,
  tripDates,
  tripLength,
  type Block,
  type CostItem,
  type CoverData,
  type EmployerData,
  type LetterKind,
  type OutLang,
  type SponsorData,
} from "@/lib/site/visa-letters";
import { cn } from "@/lib/utils";

const EMBASSY_URL = "https://taschkent.diplo.de/uz-uz/service/05-visaeinreise/2435518-2435518";
const BOOK_URL = "/knowledge-base/book/bob-2";
const OUT_LANG_NAMES: Record<OutLang, string> = { en: "English", de: "Deutsch", ru: "Русский" };
const KINDS: { kind: LetterKind; emoji: string }[] = [
  { kind: "cover", emoji: "✉️" },
  { kind: "employer", emoji: "🏢" },
  { kind: "sponsor", emoji: "🤝" },
];

const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [key, value]) => out.split(`{${key}}`).join(String(value)), text);

const card = "rounded-[28px] border border-surface-border bg-surface p-5 shadow-xs sm:p-7";
const inputCls = "input h-11 w-full min-w-0";
const labelCls = "mb-1.5 block text-caption font-semibold text-ink-600";

// Only the letter is printed: everything else on the page is hidden.
const PRINT_CSS = `@media print {
  body > *:not(#visa-letter-print) { display: none !important; }
  #visa-letter-print { display: block !important; }
  #visa-letter-print mark { background: none; }
  @page { size: A4; margin: 18mm; }
}`;

const EMPTY_COVER: CoverData = {
  place: "",
  date: "",
  country: "",
  fullName: "",
  birthDate: "",
  passport: "",
  address: "",
  phone: "",
  email: "",
  homeCity: "",
  purpose: "tourism",
  from: "",
  to: "",
  days: [],
  funding: "self",
  sponsorName: "",
  relation: "father",
  position: "",
  employer: "",
};

const EMPTY_EMPLOYER: EmployerData = {
  place: "",
  date: "",
  country: "",
  fullName: "",
  birthDate: "",
  passport: "",
  position: "",
  since: "",
  salary: "",
  currency: "UZS",
  leaveFrom: "",
  leaveTo: "",
  returnOn: "",
  company: "",
  companyAddress: "",
  companyPhone: "",
  companyWeb: "",
  companyTin: "",
  signatory: "",
  signatoryTitle: "",
};

const EMPTY_SPONSOR: SponsorData = {
  place: "",
  date: "",
  country: "",
  sponsorName: "",
  sponsorBirth: "",
  sponsorPassport: "",
  sponsorAddress: "",
  sponsorPhone: "",
  sponsorPosition: "",
  sponsorEmployer: "",
  relation: "father",
  applicantName: "",
  applicantBirth: "",
  applicantPassport: "",
  from: "",
  to: "",
  costs: ["all"],
};

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={cn("block min-w-0", wide && "sm:col-span-2")}>
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-surface-border pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-body-sm font-semibold text-ink-900">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Missing details stand out in the preview */
const marked = (text: string) =>
  text.split(GAP).flatMap((part, i) =>
    i
      ? [
          <mark key={i} className="rounded bg-amber-200 px-0.5 text-inherit">
            {GAP}
          </mark>,
          part,
        ]
      : [part]
  );

function Paper({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4 font-serif text-[13px] leading-relaxed text-black">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "from":
            return (
              <div key={i} className="text-[12px] leading-snug">
                {b.lines.map((line, j) => (
                  <div key={j} className={j === 0 ? "font-bold" : undefined}>
                    {marked(line)}
                  </div>
                ))}
              </div>
            );
          case "meta":
            return (
              <div key={i} className="text-right text-[12px] leading-snug">
                {b.lines.map((line, j) => (
                  <div key={j}>{marked(line)}</div>
                ))}
              </div>
            );
          case "title":
            return (
              <p key={i} className="pt-2 text-center font-bold">
                {marked(b.text)}
              </p>
            );
          case "text":
            return <p key={i}>{marked(b.text)}</p>;
          case "fields":
            return (
              <dl key={i} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                {b.rows.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt>{k}:</dt>
                    <dd className="font-semibold">{marked(v)}</dd>
                  </div>
                ))}
              </dl>
            );
          case "table":
            return (
              <table key={i} className="w-full border-collapse text-[11.5px]">
                <thead>
                  <tr>
                    {b.head.map((h) => (
                      <th key={h} className="border border-black/50 px-1.5 py-1 text-left font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} className="border border-black/50 px-1.5 py-1 align-top">
                          {marked(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case "sign":
            return (
              <div key={i} className="pt-4">
                {b.lines.map((line, j) => (
                  <div key={j}>{marked(line)}</div>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}

export function VisaLettersTool() {
  const site = useSite();
  const c = site.visaLetters;
  const f = c.fields;
  const { language } = useLanguage();
  const [kind, setKind] = useState<LetterKind>("cover");
  const [lang, setLang] = useState<OutLang>("en");
  // Kept in memory only: never saved, never sent.
  const [cover, setCover] = useState<CoverData>(EMPTY_COVER);
  const [employer, setEmployer] = useState<EmployerData>(EMPTY_EMPLOYER);
  const [sponsor, setSponsor] = useState<SponsorData>(EMPTY_SPONSOR);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // After mount, so the server and the browser never disagree on "today".
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    setCover((d) => ({ ...d, date: d.date || today }));
    setEmployer((d) => ({ ...d, date: d.date || today }));
    setSponsor((d) => ({ ...d, date: d.date || today }));
    setMounted(true);
  }, []);

  const blocks = useMemo(
    () => (kind === "cover" ? coverLetter(cover, lang) : kind === "employer" ? employerLetter(employer, lang) : sponsorLetter(sponsor, lang)),
    [kind, lang, cover, employer, sponsor]
  );

  // Names from the playbook (uz/ru/en), else the browser's Intl data — which can differ from the server's, so after mount.
  const countries = useMemo(
    () =>
      mounted
        ? LETTER_COUNTRIES.map((code) => ({
            code,
            name: PLAYBOOK_COUNTRIES.find((p) => p.code.toUpperCase() === code)?.name[language as PlaybookLang] ?? countryName(code, language),
          })).sort((a, b) => a.name.localeCompare(b.name, language))
        : [],
    [language, mounted]
  );

  const setC = <K extends keyof CoverData>(key: K, value: CoverData[K]) => setCover((d) => ({ ...d, [key]: value }));
  const setE = <K extends keyof EmployerData>(key: K, value: EmployerData[K]) => setEmployer((d) => ({ ...d, [key]: value }));
  const setS = <K extends keyof SponsorData>(key: K, value: SponsorData[K]) => setSponsor((d) => ({ ...d, [key]: value }));

  const input = (value: string, onChange: (v: string) => void, type: "text" | "date" | "tel" | "email" = "text") => (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
  );

  const countrySelect = (value: string, onChange: (v: string) => void, emptyLabel: string) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">{emptyLabel}</option>
      {countries.map((x) => (
        <option key={x.code} value={x.code}>
          {x.name}
        </option>
      ))}
    </select>
  );

  const letterDate = (place: string, date: string, onPlace: (v: string) => void, onDate: (v: string) => void) => (
    <Section title={c.sections.letter}>
      <Field label={f.place}>{input(place, onPlace)}</Field>
      <Field label={f.date}>{input(date, onDate, "date")}</Field>
    </Section>
  );

  const coverDates = tripDates(cover.from, cover.to);
  const coverReversed = Boolean(cover.from && cover.to && !tripLength(cover.from, cover.to));
  const setDay = (i: number, patch: Partial<CoverData["days"][number]>) =>
    setCover((d) => {
      const days = [...d.days];
      while (days.length <= i) days.push({ city: "", stay: "", plan: null });
      days[i] = { ...days[i]!, ...patch };
      return { ...d, days };
    });

  async function copy() {
    try {
      await navigator.clipboard.writeText(letterText(blocks));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the visitor can still select the preview text.
    }
  }

  return (
    <>
      <PageHero emoji="📝" decor={["✉️", "🏢", "🤝"]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

      <section className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page max-w-6xl space-y-6">
          <div className="grid gap-3 md:grid-cols-3" role="group" aria-label={c.title}>
            {KINDS.map(({ kind: k, emoji }) => (
              <button
                key={k}
                type="button"
                aria-pressed={k === kind}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-[24px] border p-4 text-left transition-colors",
                  k === kind ? "border-brand-400 bg-brand-50 dark:bg-brand-400/10" : "border-surface-border bg-surface hover:bg-surface-tint"
                )}
              >
                <span className="flex items-center gap-2 text-body-sm font-semibold text-ink-900">
                  <span aria-hidden="true">{emoji}</span> {c.kinds[k].label}
                </span>
                <span className="mt-1.5 block text-caption text-ink-600">{c.kinds[k].desc}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className={cn(card, "space-y-5")}>
              <div>
                <p className={labelCls}>{c.outLang}</p>
                <div className="inline-flex rounded-pill border border-surface-border p-1" role="group" aria-label={c.outLang}>
                  {OUT_LANGS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={l === lang}
                      onClick={() => setLang(l)}
                      className={cn(
                        "rounded-pill px-3.5 py-1.5 text-body-sm font-semibold transition-colors",
                        l === lang ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-surface-tint"
                      )}
                    >
                      {OUT_LANG_NAMES[l]}
                    </button>
                  ))}
                </div>
                {kind === "cover" && cover.country === "DE" && lang !== "de" && (
                  <p className="mt-2 text-caption font-medium text-amber-700 dark:text-amber-300">⚠️ {c.germanHint}</p>
                )}
                <p className="mt-2 text-caption text-ink-500">{c.latinHint}</p>
              </div>

              {kind === "cover" && (
                <>
                  <Section title={c.sections.applicant}>
                    <Field label={f.fullName}>{input(cover.fullName, (v) => setC("fullName", v))}</Field>
                    <Field label={f.birthDate}>{input(cover.birthDate, (v) => setC("birthDate", v), "date")}</Field>
                    <Field label={f.passport}>{input(cover.passport, (v) => setC("passport", v))}</Field>
                    <Field label={f.homeCity}>{input(cover.homeCity, (v) => setC("homeCity", v))}</Field>
                    <Field label={f.address} wide>
                      {input(cover.address, (v) => setC("address", v))}
                    </Field>
                    <Field label={f.phone}>{input(cover.phone, (v) => setC("phone", v), "tel")}</Field>
                    <Field label={f.email}>{input(cover.email, (v) => setC("email", v), "email")}</Field>
                  </Section>
                  <Section title={c.sections.trip}>
                    <Field label={f.country}>{countrySelect(cover.country, (v) => setC("country", v), "—")}</Field>
                    <Field label={f.purpose}>
                      <select value={cover.purpose} onChange={(e) => setC("purpose", e.target.value as CoverData["purpose"])} className={inputCls}>
                        {PURPOSES.map((p) => (
                          <option key={p} value={p}>
                            {c.purposes[p]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={f.from}>{input(cover.from, (v) => setC("from", v), "date")}</Field>
                    <Field label={f.to}>{input(cover.to, (v) => setC("to", v), "date")}</Field>
                    {coverReversed && (
                      <p role="alert" className="text-body-sm font-medium text-red-600 sm:col-span-2">
                        {c.invalidDates}
                      </p>
                    )}
                  </Section>
                  {coverDates.length > 0 && (
                    <fieldset className="border-t border-surface-border pt-5">
                      <legend className="mb-3 text-body-sm font-semibold text-ink-900">{c.sections.programme}</legend>
                      <ol className="space-y-3">
                        {coverDates.map((iso, i) => {
                          const day = cover.days[i];
                          return (
                            <li key={iso} className="rounded-2xl bg-surface-tint/60 p-3">
                              <p className="mb-2 text-caption font-semibold text-ink-700">
                                {fill(c.dayLabel, { n: i + 1 })} · {shortDate(iso)}
                              </p>
                              <div className="grid gap-2 sm:grid-cols-3">
                                <Field label={f.city}>{input(day?.city ?? "", (v) => setDay(i, { city: v }))}</Field>
                                <Field label={f.stay}>{input(day?.stay ?? "", (v) => setDay(i, { stay: v }))}</Field>
                                <Field label={f.plan}>
                                  <select
                                    value={day?.plan ?? defaultPlan(i, coverDates.length)}
                                    onChange={(e) => setDay(i, { plan: e.target.value as (typeof PLANS)[number] })}
                                    className={inputCls}
                                  >
                                    {PLANS.map((p) => (
                                      <option key={p} value={p}>
                                        {c.plans[p]}
                                      </option>
                                    ))}
                                  </select>
                                </Field>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                      {tripLength(cover.from, cover.to) > MAX_DAYS && <p className="mt-2 text-caption text-ink-500">{fill(c.longTrip, { n: MAX_DAYS })}</p>}
                    </fieldset>
                  )}
                  <Section title={c.sections.funding}>
                    <div className="flex flex-wrap gap-4 sm:col-span-2" role="radiogroup" aria-label={f.funding}>
                      {(["self", "sponsor"] as const).map((v) => (
                        <label key={v} className="inline-flex items-center gap-2 text-body-sm text-ink-800">
                          <input type="radio" name="funding" checked={cover.funding === v} onChange={() => setC("funding", v)} className="accent-brand-600" />
                          {v === "self" ? f.fundingSelf : f.fundingSponsor}
                        </label>
                      ))}
                    </div>
                    {cover.funding === "sponsor" && (
                      <>
                        <Field label={f.sponsorName}>{input(cover.sponsorName, (v) => setC("sponsorName", v))}</Field>
                        <Field label={f.relation}>
                          <select value={cover.relation} onChange={(e) => setC("relation", e.target.value as CoverData["relation"])} className={inputCls}>
                            {RELATIONS.map((r) => (
                              <option key={r} value={r}>
                                {c.relations[r]}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </>
                    )}
                  </Section>
                  <Section title={c.sections.work}>
                    <Field label={f.position}>{input(cover.position, (v) => setC("position", v))}</Field>
                    <Field label={f.employer}>{input(cover.employer, (v) => setC("employer", v))}</Field>
                  </Section>
                  {letterDate(cover.place, cover.date, (v) => setC("place", v), (v) => setC("date", v))}
                </>
              )}

              {kind === "employer" && (
                <>
                  <Section title={c.sections.employee}>
                    <Field label={f.fullName}>{input(employer.fullName, (v) => setE("fullName", v))}</Field>
                    <Field label={f.birthDate}>{input(employer.birthDate, (v) => setE("birthDate", v), "date")}</Field>
                    <Field label={f.passport}>{input(employer.passport, (v) => setE("passport", v))}</Field>
                    <Field label={f.position}>{input(employer.position, (v) => setE("position", v))}</Field>
                    <Field label={f.since}>{input(employer.since, (v) => setE("since", v), "date")}</Field>
                    <div className="grid grid-cols-[1fr_6.5rem] gap-2">
                      <Field label={f.salary}>{input(employer.salary, (v) => setE("salary", v))}</Field>
                      <Field label={f.currency}>
                        <select value={employer.currency} onChange={(e) => setE("currency", e.target.value)} className={inputCls}>
                          {CURRENCIES.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label={f.leaveFrom}>{input(employer.leaveFrom, (v) => setE("leaveFrom", v), "date")}</Field>
                    <Field label={f.leaveTo}>{input(employer.leaveTo, (v) => setE("leaveTo", v), "date")}</Field>
                    <Field label={f.returnOn}>{input(employer.returnOn, (v) => setE("returnOn", v), "date")}</Field>
                  </Section>
                  <Section title={c.sections.company}>
                    <Field label={f.company}>{input(employer.company, (v) => setE("company", v))}</Field>
                    <Field label={f.companyTin}>{input(employer.companyTin, (v) => setE("companyTin", v))}</Field>
                    <Field label={f.companyAddress} wide>
                      {input(employer.companyAddress, (v) => setE("companyAddress", v))}
                    </Field>
                    <Field label={f.companyPhone}>{input(employer.companyPhone, (v) => setE("companyPhone", v), "tel")}</Field>
                    <Field label={f.companyWeb}>{input(employer.companyWeb, (v) => setE("companyWeb", v))}</Field>
                    <Field label={f.signatory}>{input(employer.signatory, (v) => setE("signatory", v))}</Field>
                    <Field label={f.signatoryTitle}>{input(employer.signatoryTitle, (v) => setE("signatoryTitle", v))}</Field>
                    <Field label={f.country} wide>
                      {countrySelect(employer.country, (v) => setE("country", v), f.noCountry)}
                    </Field>
                  </Section>
                  {letterDate(employer.place, employer.date, (v) => setE("place", v), (v) => setE("date", v))}
                </>
              )}

              {kind === "sponsor" && (
                <>
                  <Section title={c.sections.sponsor}>
                    <Field label={f.fullName}>{input(sponsor.sponsorName, (v) => setS("sponsorName", v))}</Field>
                    <Field label={f.birthDate}>{input(sponsor.sponsorBirth, (v) => setS("sponsorBirth", v), "date")}</Field>
                    <Field label={f.passport}>{input(sponsor.sponsorPassport, (v) => setS("sponsorPassport", v))}</Field>
                    <Field label={f.phone}>{input(sponsor.sponsorPhone, (v) => setS("sponsorPhone", v), "tel")}</Field>
                    <Field label={f.address} wide>
                      {input(sponsor.sponsorAddress, (v) => setS("sponsorAddress", v))}
                    </Field>
                    <Field label={f.position}>{input(sponsor.sponsorPosition, (v) => setS("sponsorPosition", v))}</Field>
                    <Field label={f.employer}>{input(sponsor.sponsorEmployer, (v) => setS("sponsorEmployer", v))}</Field>
                    <Field label={f.relation} wide>
                      <select value={sponsor.relation} onChange={(e) => setS("relation", e.target.value as SponsorData["relation"])} className={inputCls}>
                        {RELATIONS.map((r) => (
                          <option key={r} value={r}>
                            {c.relations[r]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </Section>
                  <Section title={c.sections.applicant}>
                    <Field label={f.applicantName}>{input(sponsor.applicantName, (v) => setS("applicantName", v))}</Field>
                    <Field label={f.applicantBirth}>{input(sponsor.applicantBirth, (v) => setS("applicantBirth", v), "date")}</Field>
                    <Field label={f.applicantPassport}>{input(sponsor.applicantPassport, (v) => setS("applicantPassport", v))}</Field>
                  </Section>
                  <Section title={c.sections.trip}>
                    <Field label={f.country} wide>
                      {countrySelect(sponsor.country, (v) => setS("country", v), "—")}
                    </Field>
                    <Field label={f.from}>{input(sponsor.from, (v) => setS("from", v), "date")}</Field>
                    <Field label={f.to}>{input(sponsor.to, (v) => setS("to", v), "date")}</Field>
                    <div className="sm:col-span-2">
                      <p className={labelCls}>{f.costs}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {COST_ITEMS.map((item) => (
                          <label key={item} className="inline-flex items-center gap-2 text-body-sm text-ink-800">
                            <input
                              type="checkbox"
                              className="accent-brand-600"
                              checked={sponsor.costs.includes(item)}
                              onChange={(e) =>
                                setS(
                                  "costs",
                                  e.target.checked
                                    ? item === "all"
                                      ? ["all"]
                                      : [...sponsor.costs.filter((x) => x !== "all"), item]
                                    : sponsor.costs.filter((x): x is CostItem => x !== item)
                                )
                              }
                            />
                            {c.costs[item]}
                          </label>
                        ))}
                      </div>
                    </div>
                  </Section>
                  {letterDate(sponsor.place, sponsor.date, (v) => setS("place", v), (v) => setS("date", v))}
                </>
              )}
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <div className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-body-sm font-semibold uppercase tracking-[0.08em] text-ink-500">{c.previewTitle}</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => window.print()}>
                      <Printer size={15} aria-hidden="true" /> {c.print}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
                      {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {copied ? c.copied : c.copy}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 max-h-[70vh] overflow-auto rounded-xl bg-white p-5 shadow-inner ring-1 ring-black/10 sm:p-7">
                  <Paper blocks={blocks} />
                </div>
                <p className="mt-3 text-caption text-ink-500">{c.gapsNote}</p>
                <p className="mt-1 text-caption text-ink-500">{c.printHint}</p>
              </div>

              <p className="flex gap-2 rounded-[24px] border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                {c.privacy}
              </p>
            </div>
          </div>

          <div className={card}>
            <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10">
              ⚠️ {c.truth}
            </p>
            <p className="mt-5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{c.sourcesTitle}</p>
            <ul className="mt-2 space-y-1.5">
              <li>
                <a
                  href={EMBASSY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                >
                  {c.sourceEmbassy} <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <Link href={BOOK_URL} className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-700 underline-offset-2 hover:underline">
                  <BookOpen size={14} aria-hidden="true" /> {c.bookLink}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <FinalCTA />

      {/* A fixed string: as a text child, the server would escape its ">" and break hydration */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      {mounted &&
        createPortal(
          <div id="visa-letter-print" className="hidden bg-white">
            <Paper blocks={blocks} />
          </div>,
          document.body
        )}
    </>
  );
}
