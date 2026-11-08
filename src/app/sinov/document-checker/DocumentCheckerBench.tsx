"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleSlash, FlaskConical, XCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  checkDocument,
  overall,
  paddleOcrLocalReader,
  qwenLocalReader,
  syntheticReader,
  type DocKind,
  type ExtractedFields,
  type FindingLevel,
} from "@/lib/document-check/checker";
import { SYNTHETIC_SAMPLES, type SyntheticSample } from "@/lib/document-check/synthetic";
import { cn } from "@/lib/utils";

const KIND_LABELS: Record<DocKind, string> = {
  passport: "Pasport",
  bank: "Bank ko'chirmasi",
  employment: "Ish joyidan ma'lumotnoma",
  insurance: "Sug'urta polisi",
  other: "Boshqa",
};

const FIELD_LABELS: [keyof Omit<ExtractedFields, "kind">, string][] = [
  ["surname", "Familiya"],
  ["givenNames", "Ism"],
  ["documentNumber", "Hujjat raqami"],
  ["birthDate", "Tug'ilgan sana"],
  ["expiryDate", "Amal qilish muddati"],
  ["issuingCountry", "Bergan davlat"],
];

const READERS = [
  { reader: syntheticReader, label: "Sun'iy ma'lumotlar", note: "Faqat shu sahifadagi soxta namunalar" },
  { reader: qwenLocalReader, label: "Qwen (mahalliy AI)", note: "O'zbekistondagi server hali ulanmagan" },
  { reader: paddleOcrLocalReader, label: "PaddleOCR (mahalliy)", note: "O'zbekistondagi server hali ulanmagan" },
];

const LEVEL_STYLE: Record<FindingLevel, { icon: typeof CheckCircle2; tone: string; label: string }> = {
  ok: { icon: CheckCircle2, tone: "text-emerald-700 dark:text-emerald-300", label: "Joyida" },
  warn: { icon: AlertTriangle, tone: "text-amber-700 dark:text-amber-300", label: "E'tibor bering" },
  fail: { icon: XCircle, tone: "text-red-600 dark:text-red-300", label: "Tuzatish kerak" },
};

const FIRST = SYNTHETIC_SAMPLES[0] as SyntheticSample;

export function DocumentCheckerBench() {
  const [sampleId, setSampleId] = useState(FIRST.id);
  const sample = SYNTHETIC_SAMPLES.find((s) => s.id === sampleId) ?? FIRST;
  const [fields, setFields] = useState<ExtractedFields>(sample.input.fields);
  const [travelEnd, setTravelEnd] = useState("2027-03-01");
  const [months, setMonths] = useState(3);
  const [required, setRequired] = useState<DocKind[]>(["passport", "bank", "insurance"]);

  const pick = (id: string) => {
    const next = SYNTHETIC_SAMPLES.find((s) => s.id === id);
    if (!next) return;
    setSampleId(id);
    setFields(next.input.fields);
  };

  // Everything runs here in the browser: nothing is sent or stored
  const findings = useMemo(
    () => checkDocument({ fields, file: sample.input.file }, { travelEnd, passportMonthsAfterTrip: months, requiredKinds: required }),
    [fields, sample, travelEnd, months, required]
  );
  const result = overall(findings);
  const ResultIcon = LEVEL_STYLE[result].icon;

  return (
    <div className="hero-sky grain relative min-h-screen dark:bg-navy-950">
      <header className="relative flex items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <Link href="/" aria-label="VIZAR AI" className="rounded-lg">
          <Logo />
        </Link>
        <ThemeToggle variant="pill" />
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-4 sm:px-6">
        <Link href="/sinov" className="inline-flex min-h-[44px] items-center gap-1.5 text-body-sm font-semibold text-brand-700">
          <ArrowLeft size={16} aria-hidden="true" /> Sinov sahifasi
        </Link>

        <div className="mt-4">
          <p className="flex items-center gap-2 text-body-sm font-semibold text-brand-700">
            <FlaskConical size={16} aria-hidden="true" /> Yopiq sinov rejimi · faqat adminlar
          </p>
          <h1 className="mt-2 font-display text-display-lg font-extrabold tracking-[-0.03em] text-ink-950">Hujjat tekshiruvi sinovi</h1>
          <p className="mt-3 max-w-2xl text-body text-ink-600">
            Kelajakdagi mahalliy tekshiruv qoidalari shu yerda sinab ko&apos;riladi: maydonlar to&apos;liqligi, amal qilish muddati, fayl
            sifati va ro&apos;yxatga mosligi. Hujjat haqiqiyligi yoki viza berilishi baholanmaydi.
          </p>
        </div>

        <div role="note" className="mt-6 rounded-[22px] border border-amber-300/60 bg-amber-50 p-5 text-body-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <p className="font-semibold">Faqat sun&apos;iy ma&apos;lumotlar</p>
          <p className="mt-1">
            Namunalar ataylab soxta (TEST ismlar va raqamlar). Hech narsa yuklanmaydi, saqlanmaydi yoki AI&apos;ga yuborilmaydi — hisob
            shu brauzerda bajariladi. Mahalliy AI (Qwen) va OCR hali ulanmagan.
          </p>
        </div>

        {/* Readers */}
        <section aria-labelledby="b-readers" className="mt-8">
          <h2 id="b-readers" className="mb-3 font-display text-body-lg font-bold text-ink-950">
            O&apos;quvchi modullar
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {READERS.map(({ reader, label, note }) => (
              <li key={reader.id} className="card rounded-[20px] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-sm font-semibold text-ink-950">{label}</p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-semibold",
                      reader.connected ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-surface-tint text-ink-500"
                    )}
                  >
                    {reader.connected ? <CheckCircle2 size={13} aria-hidden="true" /> : <CircleSlash size={13} aria-hidden="true" />}
                    {reader.connected ? "Ishlayapti" : "Ulanmagan"}
                  </span>
                </div>
                <p className="mt-1 text-caption text-ink-500">{note}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input */}
          <section aria-labelledby="b-input" className="card min-w-0 rounded-[28px] p-5 sm:p-6">
            <h2 id="b-input" className="font-display text-body-lg font-bold text-ink-950">
              Namuna
            </h2>
            <label className="mt-4 block text-body-sm font-semibold text-ink-700">
              Sun&apos;iy hujjat
              <select value={sampleId} onChange={(e) => pick(e.target.value)} className="input mt-1.5 w-full">
                {SYNTHETIC_SAMPLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-4 text-caption text-ink-500">
              Turi: {KIND_LABELS[fields.kind]} · Fayl: {sample.input.file.mimeType}, {Math.round(sample.input.file.sizeBytes / 1024)} KB
              {sample.input.file.width ? `, ${sample.input.file.width}×${sample.input.file.height} px` : ""}
            </p>

            {fields.kind === "passport" && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FIELD_LABELS.map(([key, label]) => (
                  <label key={key} className="block text-body-sm font-semibold text-ink-700">
                    {label}
                    <input
                      type={key.endsWith("Date") ? "date" : "text"}
                      value={fields[key] ?? ""}
                      onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value || undefined }))}
                      className="input mt-1.5 w-full"
                    />
                  </label>
                ))}
              </div>
            )}

            <h3 className="mt-6 text-body-sm font-bold text-ink-950">Ariza sharti</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-body-sm font-semibold text-ink-700">
                Safar tugaydi
                <input type="date" value={travelEnd} onChange={(e) => setTravelEnd(e.target.value)} className="input mt-1.5 w-full" />
              </label>
              <label className="block text-body-sm font-semibold text-ink-700">
                Pasport safardan keyin
                <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="input mt-1.5 w-full">
                  <option value={3}>3 oy (Shengen)</option>
                  <option value={6}>6 oy</option>
                </select>
              </label>
            </div>
            <fieldset className="mt-4">
              <legend className="text-body-sm font-semibold text-ink-700">Ro&apos;yxatdagi hujjatlar</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(KIND_LABELS) as DocKind[]).map((k) => {
                  const on = required.includes(k);
                  return (
                    <label
                      key={k}
                      className={cn(
                        "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-pill px-3.5 text-body-sm font-semibold ring-1",
                        on ? "bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-100" : "bg-surface text-ink-600 ring-ink-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setRequired((r) => (on ? r.filter((x) => x !== k) : [...r, k]))}
                        className="h-4 w-4 accent-brand-600"
                      />
                      {KIND_LABELS[k]}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>

          {/* Result */}
          <section aria-labelledby="b-result" aria-live="polite" className="card min-w-0 rounded-[28px] p-5 sm:p-6">
            <h2 id="b-result" className="font-display text-body-lg font-bold text-ink-950">
              Natija
            </h2>
            <p className={cn("mt-3 flex items-center gap-2 text-display-sm font-bold", LEVEL_STYLE[result].tone)}>
              <ResultIcon size={22} aria-hidden="true" /> {LEVEL_STYLE[result].label}
            </p>
            <ul className="mt-4 space-y-2.5">
              {findings.map((f) => {
                const Icon = LEVEL_STYLE[f.level].icon;
                return (
                  <li key={f.id} className="flex items-start gap-2.5 rounded-2xl bg-surface-tint p-3 text-body-sm text-ink-800">
                    <Icon size={18} aria-hidden="true" className={cn("mt-0.5 shrink-0", LEVEL_STYLE[f.level].tone)} />
                    <span>
                      <span className="sr-only">{LEVEL_STYLE[f.level].label}: </span>
                      {f.message}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-caption text-ink-500">
              Bu sinov qoidalari: hujjat haqiqiyligi tekshirilmaydi va natija viza berilishini anglatmaydi.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
