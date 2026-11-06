"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  Compass,
  FileWarning,
  Flag as FlagIcon,
  FolderOpen,
  Gauge,
  ListTodo,
  MessagesSquare,
  Target,
  UserCog,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { ChecklistMini, TripCountdown } from "@/components/dashboard/OverviewWidgets";
import { useL } from "@/components/i18n/L";
import { TASK_HREF, currentTaskTitle } from "@/lib/dashboard/assessment-review";
import { readinessLevel, type ServerReadinessFacts } from "@/lib/dashboard/readiness";
import { useReadiness } from "@/lib/dashboard/use-readiness";
import { matchDestination } from "@/lib/site/destination-match";
import { cn } from "@/lib/utils";

export interface OverviewData {
  destination: string;
  visaType: string;
  status: string;
  /** The user's progress; null in demo mode, which shows demoScore instead */
  readiness: ServerReadinessFacts | null;
  demoScore: number;
  steps: { label: string; done: boolean }[];
  /** Open tasks, most urgent first; chip is the priority (or the sample status in demo mode) */
  tasks: { id: string; title: string; chip: string }[];
  nextAction: string;
  uploadedCount: number;
  totalSlots: number;
  missingCount: number;
  docsPercent: number;
  consultation: { name: string | null; when: string } | null;
}

// Journey steps: profile, documents, assessment, ready
const STEP_ICONS: LucideIcon[] = [UserRound, FolderOpen, Compass, FlagIcon];

// Priority / task status → chip tone (keys are the Uzbek data values)
const CHIP_STYLE: Record<string, string> = {
  Muhim: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
  "O'rtacha": "bg-amber-400/15 text-amber-700 ring-amber-400/25 dark:text-amber-300",
  Past: "bg-surface-tint text-ink-700 ring-surface-border",
  Jarayonda: "bg-brand-50 text-brand-700 ring-brand-100",
  Boshlanmagan: "bg-surface-tint text-ink-700 ring-surface-border",
  Bajarildi: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
};

// Quick access — the services people come back to most
const QUICK_LINKS: { href: string; label: string; text: string; icon: LucideIcon }[] = [
  { href: "/dashboard/interview", label: "AI suhbat mashqi", text: "Konsul savollariga javob bering", icon: MessagesSquare },
  { href: "/dashboard/documents", label: "Hujjatlar", text: "Yuklang va bir joyda saqlang", icon: FolderOpen },
  { href: "/dashboard/rejection-analysis", label: "Rad javobi tahlili", text: "Sabablar va keyingi qadamlar", icon: FileWarning },
  { href: "/dashboard/experts", label: "Mutaxassis konsultatsiyasi", text: "Murakkab holatda so'rov qoldiring", icon: UserCog },
];

const cardTitle = "flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500";
const link =
  "-my-3 inline-flex items-center gap-1.5 py-3 text-body-sm font-semibold text-brand-600 hover:text-brand-deep dark:text-brand-300 dark:hover:text-white";

function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 text-brand-700 ring-1 ring-brand-100",
        className
      )}
    >
      <Icon size={18} strokeWidth={1.9} />
    </span>
  );
}

/** One of the three headline numbers */
function Metric({
  icon,
  label,
  value,
  unit,
  hint,
  percent,
  href,
  linkText,
}: {
  icon: LucideIcon;
  label: string;
  /** null when there is nothing to measure yet */
  value: string | null;
  unit?: string;
  hint: string;
  percent?: number;
  href: string;
  linkText: string;
}) {
  const l = useL();
  return (
    <section className="card spotlight flex flex-col rounded-[24px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className={cardTitle}>{l(label)}</p>
        <IconTile icon={icon} />
      </div>
      <p className="mt-3 font-display text-[2.4rem] font-semibold leading-none text-ink-950">
        {value ?? "—"}
        {value !== null && unit && <span className="ml-1 font-sans text-body font-semibold text-ink-500">{unit}</span>}
      </p>
      {percent !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
          <div
            className="h-full origin-left animate-fill-x rounded-full bg-gradient-to-r from-brand-500 to-violet-500 motion-reduce:animate-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      <p className="mt-2 text-caption font-medium text-ink-600">{hint}</p>
      <Link href={href} className={cn(link, "mt-auto pt-4")}>
        {l(linkText)} <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </section>
  );
}

const NO_READINESS_FACTS: ServerReadinessFacts = { hasApplication: false, assessmentDone: false, docsUploaded: 0, docsTotal: 0 };

export function DashboardOverview({ data }: { data: OverviewData }) {
  const l = useL();
  const visual = matchDestination(data.destination);
  const readiness = useReadiness(data.readiness ?? NO_READINESS_FACTS);
  const score = data.readiness ? readiness.score : data.demoScore;
  const notAssessed = Boolean(data.readiness) && score === 0;
  const urgent = data.tasks.filter((t) => t.chip === "Muhim").length;

  // Next action: the most urgent open task from the assessment; without tasks,
  // the readiness part that would add the most points. Both come from fixed rules.
  const firstTask = data.tasks[0];
  const gap = data.readiness ? readiness.steps[0] : undefined;
  const next = firstTask
    ? {
        title: currentTaskTitle(firstTask.title),
        chip: firstTask.chip,
        why: "Viza tahlilidagi javoblaringizdan kelib chiqqan va eng muhim deb belgilangan vazifa.",
        href: TASK_HREF[currentTaskTitle(firstTask.title)] ?? "/recommendations",
      }
    : gap
      ? {
          title: gap.action,
          chip: null,
          why: "Tayyorgarlik balingizga eng ko'p ball qo'shadigan qadam (+{n}).",
          whyVars: { n: gap.gain },
          href: gap.href,
        }
      : null;
  const after = firstTask ? data.tasks[1] : undefined;

  return (
    <div className="space-y-5">
      {/* 1 — Smart overview: the three numbers that matter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric
          icon={Gauge}
          label="Tayyorgarlik bali"
          value={notAssessed ? null : String(score)}
          unit="/100"
          hint={l(notAssessed ? "Tayyorgarlik hali baholanmagan" : readinessLevel(score))}
          percent={notAssessed ? undefined : score}
          href="/dashboard/readiness"
          linkText="Batafsil ko'rish"
        />
        <Metric
          icon={FolderOpen}
          label="Hujjatlar"
          value={`${data.uploadedCount}/${data.totalSlots}`}
          hint={l("{n}% yuklangan", { n: data.docsPercent })}
          percent={data.docsPercent}
          href="/dashboard/documents"
          linkText={data.missingCount > 0 ? "Hujjat yuklash" : "Hujjatlar"}
        />
        <Metric
          icon={ListTodo}
          label="Kutilayotgan vazifalar"
          value={String(data.tasks.length)}
          hint={
            data.tasks.length === 0
              ? l("Hozircha ochiq vazifalar yo'q.")
              : urgent > 0
                ? l("{n} tasi muhim", { n: urgent })
                : l("Muhim vazifa yo'q")
          }
          href="/recommendations"
          linkText="Barchasi"
        />
      </div>

      {/* 2 — Next best action + application journey */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section
          aria-labelledby="next-action"
          className="grain relative flex flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-[#5B21B6] to-[#7138EC] p-6 text-white shadow-float"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(60% 45% at 100% 0%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 70%)" }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-white/85">
              <Target size={14} aria-hidden="true" /> {l("Keyingi eng muhim qadam")}
            </p>
            {next?.chip && (
              <span className="rounded-pill bg-white/15 px-2.5 py-1 text-[12px] font-semibold leading-none text-white ring-1 ring-white/25">
                {l(next.chip)}
              </span>
            )}
          </div>
          {next ? (
            <>
              <h2 id="next-action" className="relative mt-4 font-display text-[1.45rem] font-semibold leading-snug text-white">
                {l(next.title)}
              </h2>
              <p className="relative mt-2 text-body-sm text-white/85">{l(next.why, "whyVars" in next ? next.whyVars : undefined)}</p>
              <Link
                href={next.href}
                className="btn btn-sheen btn-md relative mt-5 w-full bg-gold-300 text-night shadow-float hover:bg-gold-200"
              >
                {l("Boshlash")} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {after && (
                <p className="relative mt-3 truncate text-caption text-white/75">
                  {l("Keyin: {title}", { title: l(currentTaskTitle(after.title)) })}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 id="next-action" className="relative mt-4 font-display text-[1.45rem] font-semibold leading-snug text-white">
                {l("Hammasi bajarilgan")}
              </h2>
              <p className="relative mt-2 text-body-sm text-white/85">{l("Ochiq vazifa yo'q. Hujjatlaringizni oxirgi marta tekshirib chiqing.")}</p>
            </>
          )}
        </section>

        <section aria-labelledby="app-card" className="card spotlight rounded-[28px] p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {visual && <Flag code={visual.flag} size={44} className="shadow-card ring-4 ring-surface" />}
              <div className="min-w-0">
                <p className={cardTitle}>{l("Joriy ariza")}</p>
                <h2 id="app-card" className="mt-1 font-display text-[1.6rem] font-semibold leading-tight text-ink-950">
                  {l(data.destination)}
                </h2>
                <p className="text-body-sm text-ink-600">{l(data.visaType)}</p>
              </div>
            </div>
          </div>

          <p className={cn(cardTitle, "mt-6")}>{l("Tayyorgarlik yo'li")}</p>
          <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-2">
            {data.steps.map((step, i) => {
              const current = !step.done && (i === 0 || data.steps[i - 1]?.done);
              const Icon = STEP_ICONS[i] ?? FlagIcon;
              return (
                <li key={step.label} className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 transition-colors",
                      step.done && "bg-surface text-brand-700 ring-surface-border",
                      current && "bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-[0_0_0_5px_rgba(124,58,237,0.15)] ring-white/40",
                      !step.done && !current && "bg-surface text-ink-400 ring-surface-border"
                    )}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    {step.done && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-surface">
                        <Check size={9} strokeWidth={3.5} />
                      </span>
                    )}
                  </span>
                  <span className={cn("text-caption font-semibold leading-tight", step.done || current ? "text-ink-900" : "text-ink-500")}>
                    {l(step.label)}
                    <span className="sr-only">
                      {" — "}
                      {l(step.done ? "bajarilgan" : current ? "joriy qadam" : "kutilmoqda")}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {/* 3 — Quick access */}
      <section aria-labelledby="quick-title">
        <h2 id="quick-title" className="sr-only">
          {l("Tezkor kirish")}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="card spotlight group flex h-full items-center gap-3 rounded-[20px] p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <IconTile icon={item.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-sm font-semibold text-ink-900">{l(item.label)}</span>
                  <span className="block text-caption text-ink-500">{l(item.text)}</span>
                </span>
                <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-ink-400 transition-colors group-hover:text-brand-600" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 4 — Tasks and consultation */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section aria-labelledby="tasks-title" className="card rounded-[24px] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 id="tasks-title" className="flex items-center gap-2 font-display text-body-lg font-semibold text-ink-950">
              <ListTodo size={18} aria-hidden="true" className="text-brand-700" />
              {l("Yaqinlashayotgan vazifalar")}
            </h2>
            <Link href="/recommendations" className={link}>
              {l("Barchasi")}
            </Link>
          </div>
          {data.tasks.length === 0 ? (
            <p className="mt-5 text-body-sm text-ink-600">{l("Hozircha ochiq vazifalar yo'q.")}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.tasks.slice(0, 4).map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface px-4 py-2.5"
                >
                  <span className="truncate text-body-sm font-medium text-ink-900">{l(currentTaskTitle(task.title))}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-pill px-2.5 py-1 text-[12px] font-semibold leading-none ring-1",
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

        <section aria-labelledby="consult-title" className="card rounded-[24px] p-6">
          <p id="consult-title" className={cardTitle}>
            <CalendarClock size={14} aria-hidden="true" />
            {l("Konsultatsiya")}
          </p>
          {data.consultation ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-tint p-3">
              <IconTile icon={UserCog} />
              <div className="min-w-0">
                <p className="truncate text-body-sm font-semibold text-ink-900">{l(data.consultation.name ?? "—")}</p>
                <p className="text-caption text-ink-500">{l(data.consultation.when)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-body-sm text-ink-600">{l("Ochiq konsultatsiya so'rovi yo'q.")}</p>
          )}
          <Link href="/dashboard/experts" className={cn(link, "mt-2")}>
            {l("Mutaxassislar")} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>

      {/* 5 — Planning, saved in this browser */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TripCountdown className="lg:col-span-2" />
        <ChecklistMini />
      </div>
    </div>
  );
}
