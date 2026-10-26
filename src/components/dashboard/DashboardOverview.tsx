"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Plane } from "lucide-react";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Flag } from "@/components/site/Flag";
import { EmojiSticker } from "@/components/site/primitives";
import { ChecklistMini, TripCountdown } from "@/components/dashboard/OverviewWidgets";
import { useL } from "@/components/i18n/L";
import { matchDestination } from "@/lib/site/destination-match";
import { cn } from "@/lib/utils";

export interface OverviewData {
  destination: string;
  visaType: string;
  status: string;
  score: number;
  steps: { label: string; done: boolean }[];
  tasks: { id: string; title: string; chip: string }[];
  nextAction: string;
  uploadedCount: number;
  totalSlots: number;
  missingCount: number;
  docsPercent: number;
  unreadCount: number;
  activity: { id: string; text: string; time: string; unread: boolean }[];
  consultation: { name: string | null; when: string } | null;
}

// Quick launch — mirrors the sidebar tools so the overview is a hub.
const TOOL_LINKS = [
  { href: "/dashboard/readiness", label: "Tayyorgarlik", emoji: "🎯" },
  { href: "/dashboard/documents", label: "Hujjatlar", emoji: "📄" },
  { href: "/dashboard/checklist", label: "Checklist", emoji: "✅" },
  { href: "/dashboard/interview", label: "Suhbat mashqi", emoji: "🎤" },
  { href: "/dashboard/tracker", label: "Ariza kuzatuvi", emoji: "📍" },
  { href: "/dashboard/rejection-analysis", label: "Rad javobi tahlili", emoji: "🔍" },
  { href: "/dashboard/experts", label: "Mutaxassislar", emoji: "🤝" },
];

// Step markers along the application journey
const STEP_EMOJI = ["👤", "📂", "🤖", "🎤", "🏁"];
// Task bullets — matched loosely by topic, otherwise a pin
const TASK_EMOJI: [RegExp, string][] = [
  [/bank|statement|ko.chirma/i, "🏦"],
  [/mehmonxona|hotel|bron/i, "🏨"],
  [/interview|intervyu|suhbat/i, "🎤"],
  [/konsultatsiya|mutaxassis|expert/i, "🤝"],
  [/profil/i, "👤"],
  [/sug.urta|insurance/i, "🩺"],
];
const taskEmoji = (title: string) => TASK_EMOJI.find(([re]) => re.test(title))?.[1] ?? "📌";

// Priority / task status → chip tone (keys are the Uzbek data values)
const CHIP_STYLE: Record<string, string> = {
  Muhim: "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-300",
  "O'rtacha": "bg-amber-400/15 text-amber-700 ring-amber-400/25 dark:text-amber-300",
  Past: "bg-surface-tint text-ink-700 ring-surface-border",
  Jarayonda: "bg-brand-50 text-brand-700 ring-brand-100",
  Boshlanmagan: "bg-surface-tint text-ink-700 ring-surface-border",
  Bajarildi: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
};

const cardTitle = "flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500";

function TileEmoji({ emoji }: { emoji: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 text-[22px] leading-none ring-1 ring-brand-100"
    >
      {emoji}
    </span>
  );
}

export function DashboardOverview({ data }: { data: OverviewData }) {
  const l = useL();
  const visual = matchDestination(data.destination);

  return (
    <div className="space-y-5">
      {/* Row 1 — journey card + next best action */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section aria-labelledby="app-card" className="card spotlight overflow-hidden rounded-[28px] p-0 lg:col-span-2">
          <div className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                {visual ? (
                  <Flag code={visual.flag} size={52} className="shadow-card ring-4 ring-surface" />
                ) : (
                  <TileEmoji emoji="🛂" />
                )}
                <div className="min-w-0">
                  <p className={cardTitle}>
                    <span aria-hidden="true">🛂</span>
                    {l("Joriy ariza")}
                  </p>
                  <h2 id="app-card" className="mt-1 font-display text-display-md font-extrabold tracking-[-0.03em] text-ink-950">
                    {l(data.destination)}
                  </h2>
                  <p className="text-body-sm text-ink-600">{l(data.visaType)}</p>
                </div>
              </div>
              <StatusBadge status={data.status} />
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <ScoreRing score={data.score} size={120} strokeWidth={10} />
              <div>
                <p className="text-body font-semibold text-ink-900">{l("Tayyorgarlik darajasi")}</p>
                <p className="mt-1 max-w-md text-body-sm text-ink-600">
                  {l("Javoblaringiz va hujjatlaringiz asosida hisoblangan dastlabki ko'rsatkich — viza kafolati emas.")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {visual && (
                    <span className="inline-flex items-center gap-2 rounded-pill border border-surface-border bg-surface-tint px-3 py-1.5 text-caption font-bold tracking-[0.06em] text-ink-800">
                      TAS
                      <Plane size={13} className="text-brand-600" />
                      {visual.airport}
                    </span>
                  )}
                  <Link
                    href="/dashboard/readiness"
                    className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep"
                  >
                    {l("Batafsil ko'rish")} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border bg-surface-tint/50 px-6 py-6 sm:px-7">
            <p className={cardTitle}>
              <span aria-hidden="true">🗺️</span>
              {l("Ariza jarayoni")}
            </p>
            <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))] sm:gap-2">
              {data.steps.map((step, i) => {
                const current = !step.done && (i === 0 || data.steps[i - 1]?.done);
                return (
                  <li key={step.label} className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[17px] leading-none ring-1",
                        step.done && "bg-surface ring-surface-border",
                        current && "bg-gradient-to-br from-brand-500 to-violet-600 shadow-[0_0_0_5px_rgba(124,58,237,0.15)] ring-white/40",
                        !step.done && !current && "bg-surface opacity-60 ring-surface-border"
                      )}
                    >
                      {STEP_EMOJI[i] ?? "•"}
                      {step.done && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-surface">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                      )}
                    </span>
                    <span className={cn("text-caption font-semibold leading-tight", step.done || current ? "text-ink-900" : "text-ink-500")}>
                      {l(step.label)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Next best action */}
        <section
          aria-labelledby="next-action"
          className="grain relative flex flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 p-6 text-white shadow-float sm:p-7"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(60% 45% at 100% 0%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 70%)" }}
          />
          <EmojiSticker emoji="🎯" size="sm" tilt={10} className="absolute right-5 top-5" />
          <div className="relative flex items-center gap-2 pr-14 text-caption font-semibold uppercase tracking-[0.08em] text-white/85">
            <span aria-hidden="true">✨</span> {l("Keyingi eng muhim qadam")}
          </div>
          <h2 id="next-action" className="relative mt-5 pr-12 font-display text-display-sm font-bold text-white">
            {l(data.nextAction)}
          </h2>
          <p className="relative mt-2 text-body-sm text-white/80">{l("Shu qadam tayyorgarlik darajangizga eng katta ta'sir ko'rsatadi.")}</p>
          {data.tasks.length > 0 && (
            <p className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-caption font-semibold text-white">
              📌 {l("{n} ta ochiq vazifa", { n: data.tasks.length })}
            </p>
          )}
          <div className="relative mt-auto pt-8">
            <Link
              href={data.tasks.length ? "/recommendations" : "/assessment"}
              className="btn btn-md w-full bg-white text-brand-deep shadow-float hover:bg-[#eff5ff]"
            >
              {l("Boshlash")} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>

      {/* Row 2 — personal planning widgets (saved in this browser) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TripCountdown className="lg:col-span-2" />
        <ChecklistMini />
      </div>

      {/* Row 3 — progress tiles */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card spotlight rounded-[24px] p-6">
          <div className="flex items-center justify-between">
            <p className={cardTitle}>{l("Hujjatlar")}</p>
            <TileEmoji emoji="📄" />
          </div>
          <p className="mt-3 font-accent text-[44px] font-medium italic leading-none text-ink-950">
            {data.uploadedCount}
            <span className="font-sans text-body-lg font-semibold not-italic text-ink-400">/{data.totalSlots}</span>
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full origin-left animate-fill-x rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
              style={{ width: `${data.docsPercent}%` }}
            />
          </div>
          <p className="mt-2 text-caption font-medium text-ink-600">{l("{n}% yuklangan", { n: data.docsPercent })}</p>
        </div>
        <div className="card spotlight rounded-[24px] p-6">
          <div className="flex items-center justify-between">
            <p className={cardTitle}>{l("Yetishmayotgan")}</p>
            <TileEmoji emoji="⚠️" />
          </div>
          <p className="mt-3 font-accent text-[44px] font-medium italic leading-none text-ink-950">{data.missingCount}</p>
          <Link
            href="/dashboard/documents"
            className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep"
          >
            {l("Hujjat yuklash")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card spotlight rounded-[24px] p-6">
          <div className="flex items-center justify-between">
            <p className={cardTitle}>{l("Yangi xabarlar")}</p>
            <TileEmoji emoji="🔔" />
          </div>
          <p className="mt-3 font-accent text-[44px] font-medium italic leading-none text-ink-950">{data.unreadCount}</p>
          <Link
            href="/notifications"
            className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep"
          >
            {l("Bildirishnomalar")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Row 3 — tasks + activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <section aria-labelledby="tasks-title" className="card rounded-[24px] p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 id="tasks-title" className="flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
              <span aria-hidden="true">📌</span>
              {l("Yaqinlashayotgan vazifalar")}
            </h2>
            <Link href="/recommendations" className="text-body-sm font-semibold text-brand-600 hover:text-brand-deep">
              {l("Barchasi")}
            </Link>
          </div>
          {data.tasks.length === 0 ? (
            <p className="mt-6 text-body-sm text-ink-600">{l("Hozircha ochiq vazifalar yo'q.")}</p>
          ) : (
            <ul className="mt-5 space-y-2">
              {data.tasks.slice(0, 4).map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface px-3 py-2.5 transition-colors hover:bg-surface-tint"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-tint text-[17px] leading-none">
                      {taskEmoji(task.title)}
                    </span>
                    <span className="truncate text-body-sm font-medium text-ink-900">{l(task.title)}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-semibold leading-none ring-1",
                      CHIP_STYLE[task.chip] ?? "bg-surface-tint text-ink-700 ring-surface-border"
                    )}
                  >
                    {l(task.chip)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="activity-title" className="card rounded-[24px] p-6 sm:p-7">
          <h2 id="activity-title" className="flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true">🕒</span>
            {l("So'nggi faoliyat")}
          </h2>
          {data.activity.length === 0 ? (
            <p className="mt-6 text-body-sm text-ink-600">{l("Hozircha faoliyat yo'q.")}</p>
          ) : (
            <ol className="mt-5 space-y-4 border-l-2 border-dashed border-surface-border pl-5">
              {data.activity.map((item) => (
                <li key={item.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-surface",
                      item.unread ? "bg-gradient-to-br from-brand-500 to-violet-600" : "bg-ink-300"
                    )}
                  />
                  <p className="text-body-sm font-medium text-ink-900">{l(item.text)}</p>
                  <p className="text-caption text-ink-500">{l(item.time)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Row 4 — consultation + tools */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_2fr]">
        <section aria-labelledby="consult-title" className="card rounded-[24px] p-6 sm:p-7">
          <p id="consult-title" className={cardTitle}>
            <span aria-hidden="true">🗓️</span>
            {l("Konsultatsiya")}
          </p>
          {data.consultation ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-tint p-3">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-[22px] shadow-button"
              >
                🤝
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-sm font-semibold text-ink-900">{data.consultation.name ?? "—"}</p>
                <p className="text-caption text-ink-500">{l(data.consultation.when)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-body-sm text-ink-600">{l("Rejalashtirilgan konsultatsiya yo'q.")}</p>
          )}
          <Link
            href="/dashboard/experts"
            className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep"
          >
            {l("Mutaxassislar")} <ArrowRight size={14} />
          </Link>
        </section>

        <section aria-labelledby="tools-title" className="card rounded-[24px] p-6 sm:p-7">
          <p id="tools-title" className={cardTitle}>
            <span aria-hidden="true">🧰</span>
            {l("Vositalar")}
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 xl:grid-cols-3">
            {TOOL_LINKS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="spotlight group flex h-full items-center gap-3 rounded-2xl border border-surface-border bg-surface px-3 py-3 text-body-sm font-semibold text-ink-900 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-card-hover"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 text-[17px] leading-none transition-transform duration-200 group-hover:-rotate-6"
                  >
                    {tool.emoji}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">{l(tool.label)}</span>
                  <ArrowUpRight size={14} className="shrink-0 text-ink-300 transition-colors group-hover:text-brand-600" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
