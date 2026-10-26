"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RotateCcw, ArrowRight, Check } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SelectField } from "@/components/forms/SelectField";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/site/Flag";
import { COUNTRY_OPTIONS, VISA_TYPE_OPTIONS } from "@/data/mockData";
import { useDateLocale, useL } from "@/components/i18n/L";
import { matchDestination } from "@/lib/site/destination-match";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import {
  REFUSAL_ADVICE,
  REFUSAL_KEY,
  REFUSAL_REASONS,
  suggestedWaitMonths,
  type RefusalReasonId,
  type RefusalSaved,
} from "@/lib/dashboard/refusal-rules";
import { cn } from "@/lib/utils";

export default function RefusalAnalysisPage() {
  const l = useL();
  const locale = useDateLocale();
  const [country, setCountry] = useState("");
  const [visaType, setVisaType] = useState("");
  const [refusalDate, setRefusalDate] = useState("");
  const [reasons, setReasons] = useState<RefusalReasonId[]>([]);
  const [note, setNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useLocalState<RefusalSaved | null>(REFUSAL_KEY, null);

  function toggleReason(id: RefusalReasonId) {
    setReasons((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!country || !visaType || reasons.length === 0) {
      setError(l("Davlat, viza turi va kamida bitta sababni tanlang."));
      return;
    }
    setError("");
    setAnalyzing(true);
    setTimeout(() => {
      setSaved({ country, visaType, date: refusalDate, reasons, note: note.trim(), at: new Date().toISOString() });
      setAnalyzing(false);
    }, 700);
  }

  function startOver() {
    setSaved(null);
    setReasons([]);
    setNote("");
  }

  const result = saved;
  const wait = result ? suggestedWaitMonths(result.reasons) : 0;
  const reapplyFrom =
    result?.date && !Number.isNaN(new Date(result.date).getTime())
      ? new Date(new Date(result.date).setMonth(new Date(result.date).getMonth() + wait)).toLocaleDateString(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;
  const visual = result ? matchDestination(result.country) : null;

  return (
    <DashboardShell title="Rad javobini tahlil qilish" subtitle="Oldingi rad javobingiz sabablarini AI yordamida tahlil qiling.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card space-y-4 rounded-[28px] p-6 sm:p-7">
          <p className="flex items-center gap-2.5 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 text-[18px] ring-1 ring-brand-100">
              📝
            </span>
            {l("Rad javobi ma'lumotlari")}
          </p>
          <SelectField
            id="country"
            label="Davlat"
            placeholder="Davlatni tanlang"
            options={COUNTRY_OPTIONS}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <SelectField
            id="visaType"
            label="Viza turi"
            placeholder="Viza turini tanlang"
            options={VISA_TYPE_OPTIONS}
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
          />
          <TextField id="refusalDate" label="Rad etilgan sana" type="date" value={refusalDate} onChange={(e) => setRefusalDate(e.target.value)} />

          <fieldset>
            <legend className="mb-2 block text-body-sm font-medium text-ink-900">{l("Rad javobidagi sabablar")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {REFUSAL_REASONS.map((r) => {
                const on = reasons.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleReason(r.id)}
                    aria-pressed={on}
                    className={cn(
                      "flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left text-body-sm font-medium transition-colors",
                      on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                    )}
                  >
                    <span aria-hidden="true" className="text-[17px]">
                      {r.emoji}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{l(r.label)}</span>
                    {on && <Check size={15} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="context" className="mb-1.5 block text-body-sm font-medium text-ink-700">
              {l("Qo'shimcha kontekst (ixtiyoriy)")}
            </label>
            <textarea
              id="context"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={l("Vaziyat haqida qo'shimcha ma'lumot")}
              className="w-full resize-none rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
            />
          </div>

          {error && <p className="text-body-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" size="md" className="w-full" disabled={analyzing}>
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {l("Tahlil qilish")}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={result.at}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card h-fit overflow-hidden rounded-[28px] p-0"
            >
              <div className="grain relative bg-gradient-to-br from-brand-600 to-violet-600 px-6 py-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-display text-body-lg font-bold">
                    <span aria-hidden="true">🤖</span> {l("Tahlil natijasi")}
                  </p>
                  {visual && <Flag code={visual.flag} size={34} className="ring-2 ring-white/40" />}
                </div>
                <p className="mt-1 text-body-sm text-white/85">
                  {l(result.country)} · {l(result.visaType)}
                </p>
              </div>

              <div className="space-y-4 p-6">
                {result.reasons.map((id) => {
                  const reason = REFUSAL_REASONS.find((r) => r.id === id)!;
                  const advice = REFUSAL_ADVICE[id];
                  return (
                    <div key={id} className="rounded-2xl border border-surface-border bg-surface p-4">
                      <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-950">
                        <span aria-hidden="true">{reason.emoji}</span> {l(reason.label)}
                      </p>
                      <p className="mt-1 text-body-sm text-ink-600">{l(advice.risk)}</p>
                      <ul className="mt-3 space-y-1.5">
                        {advice.actions.map((a) => (
                          <li key={a} className="flex gap-2 text-body-sm text-ink-800">
                            <span aria-hidden="true" className="mt-px text-emerald-600">✓</span> {l(a)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <div className="flex items-start gap-2 rounded-2xl bg-surface-tint p-3">
                  <span aria-hidden="true">⏳</span>
                  <p className="text-body-sm text-ink-700">
                    {l("Tavsiya: hujjatlarni to'g'rilab, qayta topshirishdan oldin kamida {n} oy tayyorlaning.", { n: wait })}
                    {reapplyFrom && (
                      <span className="mt-1 block font-semibold text-ink-900">
                        🗓️ {l("Taxminan {date} dan keyin", { date: reapplyFrom })}
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Link href="/dashboard/checklist" className="btn-secondary btn-md">
                    ✅ {l("Checklistni ochish")}
                  </Link>
                  <Link href="/dashboard/interview" className="btn-secondary btn-md">
                    🎤 {l("Suhbatni mashq qilish")}
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-caption text-ink-400">{l("Qoidaga asoslangan tahlil — konsullik qarori emas.")}</p>
                  <button type="button" onClick={startOver} className="inline-flex shrink-0 items-center gap-1.5 text-caption font-semibold text-ink-600 hover:text-ink-900">
                    <RotateCcw size={13} /> {l("Yangidan")}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card hero-sky-soft grain relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[28px] p-10 text-center">
              <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-surface text-[32px] shadow-float">
                🔍
              </span>
              <p className="max-w-xs text-body-sm text-ink-600">{l("Natija shu yerda ko'rinadi — formani to'ldirib yuboring.")}</p>
              <p className="flex items-center gap-1.5 text-caption text-ink-500">
                <ArrowRight size={13} /> {l("Sabablarni tanlang — har biri uchun aniq qadamlar chiqadi.")}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
