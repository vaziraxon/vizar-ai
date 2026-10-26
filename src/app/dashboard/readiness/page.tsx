"use client";

import { useState, useMemo } from "react";
import { ShieldAlert } from "lucide-react";
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
import { useL } from "@/components/i18n/L";

const cardTitle = "mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-950";
const Emoji = ({ e }: { e: string }) => (
  <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-tint text-[16px] leading-none">
    {e}
  </span>
);

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "Past";
  if (score >= 60) return "O'rta";
  return "Yuqori";
}

export default function ReadinessScorePage() {
  const [checkedActions, setCheckedActions] = useState<string[]>([]);
  const l = useL();
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overall score */}
        <div className="card spotlight relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[28px] p-8 text-center">
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-50 to-transparent" />
          <ScoreRing score={READINESS_OVERALL} size={140} strokeWidth={11} label="/ 100" />
          <p className="text-body-sm font-medium text-ink-700 dark:text-white/70">
            {l("Umumiy tayyorgarlik darajasi")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-caption text-ink-400 dark:text-white/40">
              {l("Rad etilish xavfi:")}
            </span>
            <StatusBadge status={risk} />
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card space-y-5 rounded-[28px] p-6 lg:col-span-2">
          <p className={cardTitle}>
            <Emoji e="🧩" /> {l("Kategoriyalar bo'yicha taqsimot")}
          </p>
          {READINESS_CATEGORIES.map((cat) => (
            <ProgressBar key={cat.label} label={cat.label} value={cat.score} />
          ))}
        </div>
      </div>

      {/* Score history + what changed */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TrendChartCard title="Ball tarixi" data={SCORE_HISTORY} suffix=" ball" />
        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="🕒" /> {l("Oxirgi tahlildan buyon nima o'zgardi")}
          </p>
          <ul className="space-y-2.5 text-body-sm text-ink-600 dark:text-white/60">
            {WHAT_CHANGED_SINCE_LAST.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scenario comparison */}
      <div className="mt-6 card rounded-[24px] p-6">
        <p className={cardTitle}>
          <Emoji e="🔀" /> {l("Stsenariy taqqoslash: joriy profil vs yaxshilangan profil")}
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
              {l("Joriy profil")}
            </p>
            <div className="space-y-3">
              {READINESS_CATEGORIES.map((c) => (
                <ProgressBar key={c.label} label={c.label} value={c.score} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-caption font-semibold uppercase text-brand-600">
              {l("Yaxshilangan profil (barcha tavsiyalar bajarilsa)")}
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
      <div className="mt-6 card rounded-[24px] p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-950">
            <Emoji e="✨" /> {l("Harakat ta'sirini simulyatsiya qilish")}
          </p>
          <div className="text-right">
            <p className="text-caption text-ink-400">{l("Simulyatsiya qilingan ball")}</p>
            <p className="font-accent text-[34px] font-medium italic leading-none text-brand-700">{simulatedScore}/100</p>
          </div>
        </div>
        <div className="space-y-2">
          {ACTION_IMPACTS.map((action) => (
            <label
              key={action.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 transition-colors hover:bg-surface-tint"
            >
              <span className="flex items-center gap-3 text-body-sm text-ink-700 dark:text-white/70">
                <input
                  type="checkbox"
                  checked={checkedActions.includes(action.id)}
                  onChange={() => toggleAction(action.id)}
                  className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-400"
                />
                {l(action.label)}
              </span>
              <span className="rounded-pill bg-emerald-500/10 px-2.5 py-1 text-caption font-semibold text-emerald-700 dark:text-emerald-300">{l("+{n} ball", { n: action.points })}</span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-caption text-ink-400 dark:text-white/40">
          {l("Masalan: bank mablag'ini tasdiqlovchi hujjat qo'shilsa, tayyorgarlik bahosi taxminan 6 ballga oshishi mumkin. Bu ko'rsatkich faqat tayyorgarlik ballini aks ettiradi — viza tasdiqlanish ehtimolini bildirmaydi.")}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="📈" /> {l("Kuchli tomonlar")}
          </p>
          <ul className="space-y-2.5">
            {READINESS_STRENGTHS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="📉" /> {l("Zaif tomonlar")}
          </p>
          <ul className="space-y-2.5">
            {READINESS_WEAKNESSES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="📂" /> {l("Yetishmayotgan hujjatlar")}
          </p>
          <ul className="space-y-2.5">
            {READINESS_MISSING_DOCS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="📌" /> {l("Ustuvor vazifalar")}
          </p>
          <ul className="space-y-2.5">
            {READINESS_PRIORITY_TASKS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="⚠️" /> {l("Xavf omillari")}
          </p>
          <ul className="space-y-2.5">
            {RISK_DRIVERS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={cardTitle}>
            <Emoji e="⚖️" /> {l("Kategoriyalar vazni")}
          </p>
          <ul className="space-y-2.5">
            {CATEGORY_WEIGHTS.map((c) => (
              <li key={c.label} className="flex items-center justify-between text-body-sm text-ink-700 dark:text-white/70">
                <span>{l(c.label)}</span>
                <span className="font-semibold text-ink-900 dark:text-white">{c.weight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-400/20 dark:bg-amber-400/10">
        <ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-body-sm text-amber-900 dark:text-amber-200">
          {l("Ushbu baho faqat axborot va tayyorgarlik maqsadida beriladi. Viza tasdiqlanishini kafolatlamaydi.")}
        </p>
      </div>
    </DashboardShell>
  );
}
