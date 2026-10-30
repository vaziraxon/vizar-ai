"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  FileText,
  Lightbulb,
  UploadCloud,
  UserRound,
  CalendarDays,
} from "lucide-react";
import { DemoBadge, DocStateChip, ProgressBar } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import type { ToolId } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

export function Ring({ value, size = 112, stroke = 10 }: { value: number; size?: number; stroke?: number }) {
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
          className="ring-draw stroke-violet-600"
          style={{ ["--ring-circumference" as string]: `${c}px` }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold tracking-tight text-ink-900">
        {value}
      </span>
    </div>
  );
}

function Frame({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("panel p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-surface-border pb-4">
        <p className="text-body-sm font-semibold text-ink-900">{title}</p>
        <DemoBadge />
      </div>
      {children}
    </div>
  );
}

const label = "text-caption font-medium text-ink-500";

/* -------------------------------------------------------------------------- */
/* Tools                                                                       */
/* -------------------------------------------------------------------------- */

function ReadinessDemo() {
  const site = useSite();
  const d = site.demos.readiness;
  return (
    <Frame title={d.title}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <Ring value={82} />
        <div className="w-full flex-1 space-y-3.5">
          {d.categories.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-medium text-ink-700">{c.label}</span>
                <span className="font-semibold text-ink-900">{c.value}</span>
              </div>
              <ProgressBar value={c.value} label={c.label} tone={c.value < 75 ? "gold" : "violet"} className="mt-1.5" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-surface-tint p-4">
        <span className="min-w-0">
          <span className={cn(label, "block")}>{d.nextLabel}</span>
          <span className="mt-0.5 block text-body-sm font-semibold text-ink-900">{d.nextText}</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
          <ArrowRight size={15} />
        </span>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-ink-500">{site.common.notGuaranteed}</p>
    </Frame>
  );
}

function DocumentsDemo() {
  const site = useSite();
  const d = site.demos.documents;
  return (
    <Frame title={site.tools.documents.tagline}>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-strong bg-surface-tint/60 px-4 py-7 text-center transition-colors hover:border-violet-300 hover:bg-brand-50/40">
        <span className="icon-tile">
          <UploadCloud size={19} strokeWidth={1.8} />
        </span>
        <p className="mt-3 text-body-sm font-semibold text-ink-900">{d.dropTitle}</p>
        <p className="text-caption text-ink-500">{d.dropHint}</p>
      </div>
      <ul className="mt-5 space-y-2">
        {d.files.map((f) => (
          <li key={f.name} className="flex items-center justify-between gap-3 rounded-xl border border-surface-border px-4 py-3">
            <span className="flex min-w-0 items-center gap-2.5 text-body-sm font-medium text-ink-900">
              <FileText size={16} strokeWidth={1.8} className="shrink-0 text-ink-400" />
              <span className="truncate">{f.name}</span>
            </span>
            <DocStateChip state={f.state} />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-400/10 p-4">
        <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" />
        <p className="text-body-sm text-amber-900 dark:text-amber-100">
          <span className="font-semibold">{d.noteTitle}: </span>
          {d.note}
        </p>
      </div>
    </Frame>
  );
}

function ChecklistDemo() {
  const site = useSite();
  const d = site.demos.checklist;
  const all = d.groups.flatMap((g) => g.items);
  const [done, setDone] = useState<Set<string>>(() => new Set(all.slice(0, 3)));
  const percent = Math.round((done.size / all.length) * 100);

  const toggle = (item: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });

  return (
    <Frame title={d.title}>
      <div className="flex items-center justify-between text-body-sm">
        <span className="font-semibold text-ink-900">
          {done.size}/{all.length} {d.progress}
        </span>
        <span className="font-semibold text-violet-600 dark:text-violet-400">{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-violet-600 transition-[width] duration-300 ease-premium"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-6 space-y-5">
        {d.groups.map((group) => (
          <fieldset key={group.title}>
            <legend className={label}>{group.title}</legend>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const checked = done.has(item);
                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-tint"
                  >
                    <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(item)} />
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500 peer-focus-visible:ring-offset-2",
                        checked ? "border-violet-600 bg-violet-600 text-white" : "border-surface-strong bg-surface"
                      )}
                    >
                      {checked && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "text-body-sm transition-colors",
                        checked ? "text-ink-500 line-through decoration-ink-300" : "font-medium text-ink-900"
                      )}
                    >
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Frame>
  );
}

function InterviewDemo() {
  const site = useSite();
  const d = site.demos.interview;
  const [q, setQ] = useState(0);
  const [answer, setAnswer] = useState("");
  return (
    <Frame title={d.title}>
      <div className="flex items-center justify-between">
        <span className={label}>
          {d.counter} {q + 1}/{d.questions.length}
        </span>
        <div className="flex gap-1">
          {d.questions.map((_, i) => (
            <span key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", i <= q ? "bg-violet-600" : "bg-surface-muted")} />
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
          <UserRound size={16} />
        </span>
        <p key={q} className="animate-fade-up rounded-xl rounded-tl-md bg-surface-tint px-4 py-3 text-body font-medium text-ink-900">
          {d.questions[q]}
        </p>
      </div>
      <label className="sr-only" htmlFor="demo-answer">
        {d.placeholder}
      </label>
      <textarea
        id="demo-answer"
        rows={3}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={d.placeholder}
        className="input mt-5 h-auto resize-none py-3"
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setQ((v) => (v + 1) % d.questions.length);
            setAnswer("");
          }}
          className="btn-dark btn-md"
        >
          {d.next}
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
        <p className="flex items-center gap-2 text-body-sm font-semibold text-violet-800">
          <Lightbulb size={16} />
          {d.tipTitle}
        </p>
        <ul className="mt-2 space-y-1.5">
          {d.tips.map((tip) => (
            <li key={tip} className="flex gap-2 text-body-sm text-ink-700">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

function TrackerDemo() {
  const site = useSite();
  const d = site.demos.tracker;
  const current = 2;
  return (
    <Frame title={d.title}>
      <ol className="relative">
        {d.stages.map((stage, i) => {
          const done = i < current;
          const isCurrent = i === current;
          return (
            <li key={stage.title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < d.stages.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("absolute left-[15px] top-8 h-[calc(100%-24px)] w-px", done ? "bg-violet-600" : "bg-surface-border")}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-bold",
                  done && "bg-violet-600 text-white",
                  isCurrent && "bg-violet-600 text-white ring-4 ring-brand-100",
                  !done && !isCurrent && "border border-surface-strong bg-surface text-ink-500"
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <div className="flex flex-1 items-center justify-between gap-3 pt-1">
                <p className={cn("text-body-sm font-semibold", done || isCurrent ? "text-ink-900" : "text-ink-600")}>
                  {stage.title}
                </p>
                <span
                  className={cn(
                    "rounded-pill px-2 py-1 text-[11px] font-semibold leading-none",
                    done && "bg-surface-tint text-ink-700",
                    isCurrent && "bg-brand-50 text-brand-700",
                    !done && !isCurrent && "text-ink-500"
                  )}
                >
                  {stage.desc}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

function RejectionDemo() {
  const site = useSite();
  const d = site.demos.rejection;
  const [selected, setSelected] = useState(0);
  return (
    <Frame title={site.tools.rejection.tagline}>
      <p className="text-body-sm font-semibold text-ink-900" id="reason-label">
        {d.prompt}
      </p>
      <div role="radiogroup" aria-labelledby="reason-label" className="mt-3 flex flex-col gap-2">
        {d.reasons.map((r, i) => (
          <button
            key={r.label}
            type="button"
            role="radio"
            aria-checked={selected === i}
            onClick={() => setSelected(i)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-body-sm font-medium transition-[border-color,background-color] duration-150",
              selected === i
                ? "border-violet-600 bg-brand-50/60 text-ink-900"
                : "border-surface-border text-ink-700 hover:border-surface-strong"
            )}
          >
            {r.label}
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                selected === i ? "border-violet-600" : "border-surface-strong"
              )}
            >
              {selected === i && <span className="h-2 w-2 rounded-full bg-violet-600" />}
            </span>
          </button>
        ))}
      </div>
      <div key={selected} className="mt-6 animate-fade-up rounded-xl bg-surface-tint p-4">
        <p className={label}>{d.actionsTitle}</p>
        <ul className="mt-3 space-y-2.5">
          {d.reasons[selected]!.actions.map((a) => (
            <li key={a} className="flex items-start gap-2.5 text-body-sm text-ink-900">
              <ArrowRight size={15} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400" />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

function ExpertsDemo() {
  const site = useSite();
  const d = site.demos.experts;
  const [topic, setTopic] = useState(0);
  const [slot, setSlot] = useState<number | null>(1);
  return (
    <Frame title={site.tools.experts.tagline}>
      <div className="flex items-center gap-3 rounded-xl bg-surface-tint p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-700 ring-1 ring-surface-border">
          <UserRound size={20} />
        </span>
        <div>
          <p className="text-body-sm font-semibold text-ink-900">{d.role}</p>
          <p className="text-caption text-ink-500">VIZAR AI</p>
        </div>
      </div>

      <p className={cn(label, "mt-6")}>{d.topicLabel}</p>
      <div className="mt-2 inline-flex rounded-pill bg-surface-tint p-1">
        {d.topics.map((t, i) => (
          <button
            key={t}
            type="button"
            aria-pressed={topic === i}
            onClick={() => setTopic(i)}
            className={cn(
              "rounded-pill px-3.5 py-1.5 text-body-sm font-semibold transition-[background-color,color,box-shadow] duration-150",
              topic === i ? "bg-surface text-ink-900 shadow-card" : "text-ink-600 hover:text-ink-900"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <p className={cn(label, "mt-6 flex items-center gap-1.5")}>
        <CalendarDays size={13} /> {d.slotLabel}
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {d.slots.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-pressed={slot === i}
            onClick={() => setSlot(i)}
            className={cn(
              "rounded-xl border py-2.5 text-body-sm font-semibold transition-[border-color,background-color,color] duration-150",
              slot === i ? "border-violet-600 bg-violet-600 text-white" : "border-surface-border text-ink-700 hover:border-surface-strong"
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <Link href="/register" className="btn-charcoal btn-sheen btn-md mt-6 w-full">
        {d.cta}
        <ArrowRight size={16} />
      </Link>
      <p className="mt-3 text-center text-[11px] font-medium text-ink-500">{d.note}</p>
    </Frame>
  );
}

function RoadmapDemo() {
  const site = useSite();
  const steps = site.home.hero.panel.roadmap;
  return (
    <Frame title="Visa Roadmap">
      <ol className="relative">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("absolute left-[7px] top-5 h-[calc(100%-12px)] w-px", step.state === "done" ? "bg-violet-600" : "bg-surface-border")}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-[3px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full",
                step.state === "done" && "bg-violet-600 text-white",
                step.state === "current" && "bg-violet-600 ring-4 ring-brand-100",
                step.state === "todo" && "border border-surface-strong bg-surface"
              )}
            >
              {step.state === "done" && <Check size={9} strokeWidth={3.5} />}
            </span>
            <div className="flex flex-1 items-baseline justify-between gap-3">
              <p className={cn("text-body-sm font-medium", step.state === "todo" ? "text-ink-600" : "text-ink-900")}>{step.title}</p>
              <p className={cn("shrink-0 text-caption", step.state === "current" ? "font-semibold text-brand-700" : "text-ink-500")}>
                {step.when}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

/** Demos keyed for the homepage product tour (includes the roadmap view). */
export const TOUR_DEMOS = {
  readiness: ReadinessDemo,
  documents: DocumentsDemo,
  checklist: ChecklistDemo,
  roadmap: RoadmapDemo,
  interview: InterviewDemo,
};

export { RejectionDemo, ExpertsDemo, TrackerDemo };

const DEMOS: Record<ToolId, () => JSX.Element> = {
  readiness: ReadinessDemo,
  documents: DocumentsDemo,
  checklist: ChecklistDemo,
  interview: InterviewDemo,
  tracker: TrackerDemo,
  rejection: RejectionDemo,
  experts: ExpertsDemo,
};

export function ToolDemo({ id }: { id: ToolId }) {
  const Demo = DEMOS[id];
  return <Demo />;
}
