"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed, Clock, ExternalLink, FileX, RotateCcw, Save, TriangleAlert, type LucideIcon } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { useFormatDate, useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";
import { readLocal, useLocalState } from "@/lib/dashboard/use-local-state";
import { CHECKLIST_SELECTION_KEY, VISA_KINDS, buildChecklist, checklistKey, type ChecklistSaved, type VisaKind } from "@/lib/dashboard/checklist-template";
import { ANSWERS, ANSWER_LABELS, cleanAnswers, docCheckKey, scoreAnswers, syncChecklistDone, type Answer } from "@/lib/document-check/score";
import { adviseDocumentCheckAction, saveDocumentCheckAction } from "@/lib/actions/document-checks";
import { markPrepChanged, pullPrepState } from "@/lib/dashboard/prep-sync";
import type { BookRule } from "@/lib/document-check/book";
import type { DocumentCheckRow } from "@/lib/data/document-checks";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<Answer, LucideIcon> = { ready: CircleCheck, partial: TriangleAlert, preparing: Clock, missing: FileX };

const STATUS_STYLE: Record<Answer, string> = {
  ready: "text-emerald-700 dark:text-emerald-300",
  partial: "text-amber-700 dark:text-amber-300",
  preparing: "text-violet-700 dark:text-violet-300",
  missing: "text-red-600 dark:text-red-300",
};

/** What to do next for a document that isn't ready (Uzbek source text) */
const NEXT_STEP: Record<Exclude<Answer, "ready">, string> = {
  missing: "Hali yo'q — tayyorlashni hozir boshlang.",
  partial: "Muammosi bor — talab bilan solishtirib, kamchilikni tuzating.",
  preparing: "Tayyorlanmoqda — topshirish sanasigacha ulgurishini rejalashtiring.",
};

/** Tools on the site that help with a document */
const HELPER: Record<string, { href: string; label: string }> = {
  photo: { href: "/dashboard/tools/photo", label: "Viza fotosurati" },
  employment: { href: "/dashboard/tools/letters", label: "Viza xatlari" },
  "biz-letter": { href: "/dashboard/tools/letters", label: "Viza xatlari" },
  itinerary: { href: "/dashboard/tools/letters", label: "Viza xatlari" },
};

interface Props {
  initialDest: DestinationSlug;
  initialVisa: VisaKind;
  applicationId: string | null;
  latest: DocumentCheckRow | null;
  bookRules: Partial<Record<DestinationSlug, { code: string | null; rules: BookRule[] }>>;
  aiEnabled: boolean;
  canSave: boolean;
}

export function DocumentReadinessTest({ initialDest, initialVisa, applicationId, latest, bookRules, aiEnabled, canSave }: Props) {
  const l = useL();
  const fmt = useFormatDate();
  const site = useSite();
  const [dest, setDest] = useState<DestinationSlug>(initialDest);
  const [visa, setVisa] = useState<VisaKind>(initialVisa);
  const [answers, setAnswers] = useLocalState<Record<string, Answer>>(docCheckKey(dest, visa), {});
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<{ ok: boolean; text: string } | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  const items = useMemo(() => buildChecklist(dest, visa).flatMap((g) => g.items), [dest, visa]);
  const result = useMemo(() => scoreAnswers(items, answers), [items, answers]);

  // A new destination or visa type is a new test
  useEffect(() => {
    setShowResult(false);
    setSaveState(null);
    setAdvice(null);
  }, [dest, visa]);

  // Signed in: take the account's answers when they are newer (e.g. from another device)
  useEffect(() => {
    let alive = true;
    void pullPrepState(dest, visa).then((fresh) => {
      if (alive && fresh) setAnswers(fresh.answers);
    });
    return () => {
      alive = false;
    };
  }, [dest, visa, setAnswers]);

  const choose = (id: string, a: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: a }));
    markPrepChanged(dest, visa);
    setShowResult(false);
    setSaveState(null);
  };

  const restart = () => {
    setAnswers({});
    markPrepChanged(dest, visa);
    setShowResult(false);
    setSaveState(null);
    setAdvice(null);
  };

  // The personal checklist follows the finished test: "ready" ticks, other answers untick
  const syncChecklist = () => {
    const key = checklistKey(dest, visa);
    const saved = readLocal<ChecklistSaved>(key, { done: [], custom: [] });
    try {
      localStorage.setItem(key, JSON.stringify({ ...saved, done: syncChecklistDone(saved.done, cleanAnswers(items, answers)) }));
      localStorage.setItem(CHECKLIST_SELECTION_KEY, JSON.stringify({ dest, visa }));
    } catch {
      /* storage blocked: the checklist just stays as it was */
    }
  };

  const finish = async () => {
    setShowResult(true);
    syncChecklist();
    markPrepChanged(dest, visa);
    if (aiEnabled) {
      const { advice: text } = await adviseDocumentCheckAction({ destination: dest, visaKind: visa, answers }).catch(() => ({ advice: null }));
      setAdvice(text);
    }
  };

  const save = async () => {
    setSaving(true);
    setSaveState(null);
    try {
      const res = await saveDocumentCheckAction({ destination: dest, visaKind: visa, applicationId, answers });
      setSaveState(res.ok ? { ok: true, text: "Natija saqlandi." } : { ok: false, text: res.error });
    } catch {
      setSaveState({ ok: false, text: "Amalni bajarib bo'lmadi. Qayta urinib ko'ring." });
    } finally {
      setSaving(false);
    }
  };

  const book = bookRules[dest];
  const destName = site.destinations[dest].name;
  const visaLabel = l(VISA_KINDS.find((v) => v.id === visa)?.label ?? "");

  return (
    <div className="space-y-6">
      {latest && (
        <p className="rounded-2xl border border-surface-border bg-surface px-4 py-3 text-body-sm text-ink-700">
          {l("Oxirgi saqlangan natija: {percent}% · {date} · {dest}, {visa}", {
            percent: latest.readiness_percent,
            date: fmt(latest.created_at, "medium"),
            dest: site.destinations[latest.destination]?.name ?? latest.destination,
            visa: l(VISA_KINDS.find((v) => v.id === latest.visa_kind)?.label ?? latest.visa_kind),
          })}
        </p>
      )}

      {/* 1 — what the test is */}
      <section className="card rounded-[28px] p-6 sm:p-7">
        <h2 className="font-display text-[1.35rem] font-semibold text-ink-950">{l("Hujjat tayyorgarligi testi")}</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-ink-700">
          {l("Hech qanday fayl yuklanmaydi. Har bir hujjat uchun hozirgi holatini tanlang — natija faqat siz bergan javoblarga asoslanadi.")}
        </p>

        <div className="mt-5">
          <p className="mb-2.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l("Yo'nalish")}</p>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => setDest(d.slug)}
                aria-pressed={dest === d.slug}
                className={cn(
                  "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-body-sm font-semibold transition-colors",
                  dest === d.slug ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                )}
              >
                <Flag code={d.flag} size={20} />
                {site.destinations[d.slug].name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l("Viza turi")}</p>
          <div className="flex flex-wrap gap-2">
            {VISA_KINDS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVisa(v.id)}
                aria-pressed={visa === v.id}
                className={cn(
                  "rounded-pill border px-3.5 py-1.5 text-body-sm font-semibold transition-colors",
                  visa === v.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                )}
              >
                {l(v.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — one question per document, four options */}
      <section aria-labelledby="doc-questions" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="doc-questions" className="font-display text-body-lg font-semibold text-ink-950">
            {destName} · {visaLabel}
          </h2>
          <p className="text-body-sm font-medium text-ink-600" aria-live="polite">
            {l("{done}/{total} javob berildi", { done: result.answered, total: result.total })}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${result.total ? (result.answered / result.total) * 100 : 0}%` }} />
        </div>

        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={item.id} className="card rounded-[24px] p-5">
              <fieldset>
                <legend className="text-body font-semibold text-ink-950">
                  <span className="mr-2 text-ink-400">{i + 1}.</span>
                  {l(item.title)}
                </legend>
                {item.note && <p className="mt-1 text-caption text-ink-500">{l(item.note)}</p>}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {ANSWERS.map((a) => {
                    const checked = answers[item.id] === a;
                    return (
                      <label
                        key={a}
                        className={cn(
                          "flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-body-sm transition-colors focus-within:ring-2 focus-within:ring-brand-400",
                          checked ? "border-brand-500 bg-brand-50 font-semibold text-brand-800 dark:bg-brand-600/20 dark:text-white" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                        )}
                      >
                        <input
                          type="radio"
                          name={`doc-${item.id}`}
                          value={a}
                          checked={checked}
                          onChange={() => choose(item.id, a)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-bold",
                            checked ? "bg-brand-600 text-white" : "bg-surface-tint text-ink-600"
                          )}
                        >
                          {ANSWER_LABELS[a].letter}
                        </span>
                        {l(ANSWER_LABELS[a].label)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="button" onClick={() => void finish()} disabled={!result.complete} className="btn-primary btn-md disabled:cursor-not-allowed disabled:opacity-50">
            {l("Natijani ko'rish")} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={restart} className="btn-secondary btn-md">
            <RotateCcw size={15} aria-hidden="true" /> {l("Qayta boshlash")}
          </button>
          {!result.complete && result.answered > 0 && (
            <p className="text-caption text-ink-500">{l("Natija uchun barcha hujjatlarga javob bering ({n} ta qoldi).", { n: result.total - result.answered })}</p>
          )}
        </div>
      </section>

      {/* 3 — result */}
      {showResult && result.complete && (
        <section aria-labelledby="doc-result" className="space-y-5">
          <div className="card rounded-[28px] p-6 sm:p-7">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l("Siz bergan javoblarga ko'ra")}</p>
            <h2 id="doc-result" className="mt-1 font-display text-[1.6rem] font-semibold text-ink-950">
              {l("Hujjatlar tayyorgarligi: {n}%", { n: result.percent })}
            </h2>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-500" style={{ width: `${result.percent}%` }} />
            </div>
            <p className="mt-3 text-body-sm text-ink-600">
              {l("Bu faqat siz tanlagan javoblar asosidagi dastlabki baho: hujjatlaringiz sifati tekshirilmagan va bu viza berilishi ehtimoli emas.")}{" "}
              {l("Hisob: A — 100%, B — 50%, C — 25%, D — 0%.")}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-emerald-500/10 px-4 py-3 text-body-sm text-emerald-800 dark:text-emerald-200">
              <CircleCheck size={16} aria-hidden="true" className="shrink-0" />
              <span className="min-w-0 flex-1">{l("Shaxsiy checklist yangilandi: \"Bor, tayyor\" deb belgilagan hujjatlaringiz belgilandi.")}</span>
              <Link href="/dashboard/checklist" className="inline-flex min-h-[44px] items-center gap-1 font-semibold underline-offset-4 hover:underline">
                {l("Checklistni ochish")} <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(
              [
                ["ready", "Tayyor"],
                ["partial", "Muammoli"],
                ["preparing", "Tayyorlanmoqda"],
                ["missing", "Yetishmayapti"],
              ] as [Answer, string][]
            ).map(([a, label]) => {
              const Icon = STATUS_ICON[a];
              return (
                <div key={a} className="card rounded-[24px] p-5">
                  <p className={cn("flex items-center gap-1.5 text-caption font-semibold uppercase tracking-[0.08em]", STATUS_STYLE[a])}>
                    <Icon size={14} aria-hidden="true" /> {l(label)}
                  </p>
                  <p className="mt-2 font-display text-[2rem] font-semibold leading-none text-ink-950">{result.counts[a]}</p>
                </div>
              );
            })}
          </div>

          <div className="card rounded-[28px] p-6 sm:p-7">
            <h3 className="font-display text-body-lg font-semibold text-ink-950">{l("Birinchi navbatda")}</h3>
            {result.priorities.length === 0 ? (
              <p className="mt-2 text-body-sm text-ink-700">
                {l("Siz bergan javoblarga ko'ra barcha hujjatlar tayyor. Topshirishdan oldin har birini rasmiy talab bilan yana bir bor solishtiring.")}
              </p>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {result.priorities.map(({ item, answer }, i) => {
                  const Icon = STATUS_ICON[answer];
                  const helper = HELPER[item.id];
                  return (
                    <li key={item.id} className="flex gap-3 rounded-2xl bg-surface-tint px-4 py-3">
                      <span className="w-5 shrink-0 font-semibold text-ink-400">{i + 1}.</span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-950">
                          <Icon size={15} aria-hidden="true" className={STATUS_STYLE[answer]} />
                          {l(item.title)}
                        </p>
                        <p className="mt-0.5 text-body-sm text-ink-700">
                          {l(NEXT_STEP[answer])}
                          {item.note ? ` ${l(item.note)}.` : ""}
                        </p>
                        {helper && (
                          <Link href={helper.href} className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-brand-700 hover:underline">
                            {l(helper.label)} <ArrowRight size={12} aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* The visa book: shown as information to check, never as a confirmed requirement */}
          <div className="card rounded-[28px] p-6 sm:p-7">
            <h3 className="font-display text-body-lg font-semibold text-ink-950">{l("Viza kitobida")}</h3>
            {book?.rules.length ? (
              <ul className="mt-3 space-y-3">
                {book.rules.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-surface-border px-4 py-3">
                    <p className="flex flex-wrap items-center gap-2 text-body-sm font-semibold text-ink-950">
                      {r.topic}
                      {!r.verified && (
                        <span className="rounded-pill bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                          {l("Rasmiy manba bilan hali tasdiqlanmagan")}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 line-clamp-4 text-body-sm text-ink-700">{r.text}</p>
                    {r.sources.length > 0 && (
                      <p className="mt-2 flex flex-wrap gap-2">
                        {r.sources.slice(0, 3).map((s) => (
                          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption font-semibold text-brand-700 hover:underline">
                            {s.title} <ExternalLink size={11} aria-hidden="true" />
                          </a>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-body-sm text-ink-700">{l("Bu yo'nalish bo'yicha qoidalarni Viza bazasidan ko'ring.")}</p>
            )}
            <Link
              href={book?.code ? `/dashboard/library/countries/${book.code}` : "/dashboard/library#davlatlar"}
              className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-700 hover:underline"
            >
              {l("Viza bazasida ochish")} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {advice && (
            <div className="card rounded-[28px] p-6 sm:p-7">
              <h3 className="font-display text-body-lg font-semibold text-ink-950">{l("AI tavsiyasi")}</h3>
              <p className="mt-1 text-caption text-ink-500">{l("Siz bergan javoblarga ko'ra; hujjatlaringiz ko'rilmagan.")}</p>
              <p className="mt-3 whitespace-pre-line text-body-sm text-ink-800">{advice}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {canSave && (
              <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary btn-md disabled:opacity-60">
                <Save size={15} aria-hidden="true" /> {saving ? l("Saqlanmoqda...") : l("Natijani saqlash")}
              </button>
            )}
            <button type="button" onClick={restart} className="btn-secondary btn-md">
              <CircleDashed size={15} aria-hidden="true" /> {l("Testni qayta boshlash")}
            </button>
            {saveState && (
              <p role={saveState.ok ? "status" : "alert"} className={cn("text-body-sm font-medium", saveState.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300")}>
                {l(saveState.text)}
              </p>
            )}
          </div>
          <p className="text-caption text-ink-500">
            {l("Rasmiy talablar o'zgarishi mumkin — topshirishdan oldin elchixona yoki rasmiy viza markazi saytini tekshiring.")}
          </p>
        </section>
      )}
    </div>
  );
}
