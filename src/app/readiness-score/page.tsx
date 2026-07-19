"use client";

import { useState, useMemo } from "react";
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  FileWarning,
  ListChecks,
  History,
  GitCompareArrows,
  Sparkles,
  Scale,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TrendChartCard } from "@/components/charts/TrendChartCard";
import {
  READINESS_OVERALL,
  READINESS_CATEGORIES,
  READINESS_STRENGTHS,
  READINESS_WEAKNESSES,
  READINESS_MISSING_DOCS,
  READINESS_PRIORITY_TASKS,
  SCORE_HISTORY,
  WHAT_CHANGED_SINCE_LAST,
  IMPROVED_PROFILE_CATEGORIES,
  ACTION_IMPACTS,
  RISK_DRIVERS,
  CATEGORY_WEIGHTS,
} from "@/data/mockData";
import type { RiskLevel } from "@/types";

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "Past";
  if (score >= 60) return "O'rta";
  return "Yuqori";
}

export default function ReadinessScorePage() {
  const [checkedActions, setCheckedActions] = useState<string[]>([]);
  const risk = riskFromScore(READINESS_OVERALL);

  const simulatedScore = useMemo(() => {
    const extra = ACTION_IMPACTS.filter((a) => checkedActions.includes(a.id)).reduce(
      (sum, a) => sum + a.points,
      0
    );
    return Math.min(READINESS_OVERALL + extra, 100);
  }, [checkedActions]);

  function toggleAction(id: string) {
    setCheckedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  return (
    <DashboardShell
      title="Visa Readiness Score"
      subtitle="Hujjatlaringiz va ma'lumotlaringiz asosida hisoblangan tayyorgarlik darajasi."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall score */}
        <div className="card flex flex-col items-center justify-center gap-3 p-8 text-center dark:border-white/10 dark:bg-navy-800">
          <ScoreRing score={READINESS_OVERALL} size={140} strokeWidth={11} label="/ 100" />
          <p className="text-body-sm font-medium text-ink-700 dark:text-white/70">
            Umumiy tayyorgarlik darajasi
          </p>
          <div className="flex items-center gap-2">
            <span className="text-caption text-ink-400 dark:text-white/40">
              Rad etilish xavfi:
            </span>
            <StatusBadge status={risk} />
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card space-y-5 p-6 dark:border-white/10 dark:bg-navy-800 lg:col-span-2">
          <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
            Kategoriyalar bo&apos;yicha taqsimot
          </p>
          {READINESS_CATEGORIES.map((cat) => (
            <ProgressBar key={cat.label} label={cat.label} value={cat.score} />
          ))}
        </div>
      </div>

      {/* Score history + what changed */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TrendChartCard title="Ball tarixi" data={SCORE_HISTORY} suffix=" ball" />
        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <History size={16} className="text-brand-600" /> Oxirgi tahlildan buyon nima o&apos;zgardi
          </p>
          <ul className="space-y-2.5 text-body-sm text-ink-600 dark:text-white/60">
            {WHAT_CHANGED_SINCE_LAST.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scenario comparison */}
      <div className="mt-6 card p-6 dark:border-white/10 dark:bg-navy-800">
        <p className="mb-5 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
          <GitCompareArrows size={16} className="text-brand-600" /> Stsenariy taqqoslash: joriy profil vs yaxshilangan profil
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
              Joriy profil
            </p>
            <div className="space-y-3">
              {READINESS_CATEGORIES.map((c) => (
                <ProgressBar key={c.label} label={c.label} value={c.score} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-caption font-semibold uppercase text-brand-600">
              Yaxshilangan profil (barcha tavsiyalar bajarilsa)
            </p>
            <div className="space-y-3">
              {IMPROVED_PROFILE_CATEGORIES.map((c) => (
                <ProgressBar key={c.label} label={c.label} value={c.score} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action impact simulator */}
      <div className="mt-6 card p-6 dark:border-white/10 dark:bg-navy-800">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <Sparkles size={16} className="text-brand-600" /> Harakat ta&apos;sirini simulyatsiya qilish
          </p>
          <div className="text-right">
            <p className="text-caption text-ink-400 dark:text-white/40">Simulyatsiya qilingan ball</p>
            <p className="font-display text-xl font-bold text-brand-600">{simulatedScore}/100</p>
          </div>
        </div>
        <div className="space-y-2">
          {ACTION_IMPACTS.map((action) => (
            <label
              key={action.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-surface-border px-4 py-3 dark:border-white/10"
            >
              <span className="flex items-center gap-3 text-body-sm text-ink-700 dark:text-white/70">
                <input
                  type="checkbox"
                  checked={checkedActions.includes(action.id)}
                  onChange={() => toggleAction(action.id)}
                  className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-400"
                />
                {action.label}
              </span>
              <span className="text-caption font-semibold text-success">+{action.points} ball</span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-caption text-ink-400 dark:text-white/40">
          Masalan: bank mablag&apos;ini tasdiqlovchi hujjat qo&apos;shilsa,
          tayyorgarlik bahosi taxminan 6 ballga oshishi mumkin. Bu ko&apos;rsatkich
          faqat tayyorgarlik ballini aks ettiradi — viza tasdiqlanish
          ehtimolini bildirmaydi.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <TrendingUp size={16} className="text-success" /> Kuchli tomonlar
          </p>
          <ul className="space-y-2.5">
            {READINESS_STRENGTHS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <TrendingDown size={16} className="text-red-500" /> Zaif tomonlar
          </p>
          <ul className="space-y-2.5">
            {READINESS_WEAKNESSES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <FileWarning size={16} className="text-warning" /> Yetishmayotgan hujjatlar
          </p>
          <ul className="space-y-2.5">
            {READINESS_MISSING_DOCS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <ListChecks size={16} className="text-brand-600" /> Ustuvor vazifalar
          </p>
          <ul className="space-y-2.5">
            {READINESS_PRIORITY_TASKS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <ShieldAlert size={16} className="text-red-500" /> Xavf omillari
          </p>
          <ul className="space-y-2.5">
            {RISK_DRIVERS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <Scale size={16} className="text-brand-600" /> Kategoriyalar vazni
          </p>
          <ul className="space-y-2.5">
            {CATEGORY_WEIGHTS.map((c) => (
              <li key={c.label} className="flex items-center justify-between text-body-sm text-ink-700 dark:text-white/70">
                <span>{c.label}</span>
                <span className="font-semibold text-ink-900 dark:text-white">{c.weight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-400/20 dark:bg-amber-400/10">
        <ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-body-sm text-amber-900 dark:text-amber-200">
          Ushbu baho faqat axborot va tayyorgarlik maqsadida beriladi. Viza
          tasdiqlanishini kafolatlamaydi.
        </p>
      </div>
    </DashboardShell>
  );
}
