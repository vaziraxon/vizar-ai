"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { useL } from "@/components/i18n/L";
import { readinessLevel, type ServerReadinessFacts } from "@/lib/dashboard/readiness";
import { useReadiness } from "@/lib/dashboard/use-readiness";
import { cn } from "@/lib/utils";

const cardTitle = "mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-950";
const Emoji = ({ e }: { e: string }) => (
  <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-tint text-[16px] leading-none">
    {e}
  </span>
);

export function ReadinessView({ facts, missingDocs }: { facts: ServerReadinessFacts; missingDocs: string[] }) {
  const l = useL();
  const { score, parts, steps } = useReadiness(facts);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card spotlight relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[28px] p-8 text-center">
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-50 to-transparent" />
          <ScoreRing score={score} size={140} strokeWidth={11} label="/ 100" empty={score === 0} />
          <p className="text-body-sm font-medium text-ink-700 dark:text-white/70">{l("Umumiy tayyorgarlik darajasi")}</p>
          <span className="rounded-pill bg-brand-50 px-3 py-1 text-caption font-semibold text-brand-700 ring-1 ring-brand-100">
            {l(readinessLevel(score))}
          </span>
        </div>

        <div className="card rounded-[28px] p-6 lg:col-span-2">
          <p className={cardTitle}>
            {l("Ball nimadan iborat")}
          </p>
          <ul className="space-y-1">
            {parts.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="block rounded-2xl p-2 transition-colors hover:bg-surface-tint">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="flex min-w-0 items-center gap-2 text-body-sm font-semibold text-ink-900">
                      {l(item.label)}
                    </span>
                    <span className="text-caption font-semibold tabular-nums text-ink-600">
                      {l("{points}/{weight} ball", { points: item.points, weight: item.weight })}
                    </span>
                  </span>
                  <span className="mt-2 block h-2 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </span>
                  <span className="mt-1.5 block text-caption text-ink-500">{l(item.detail.text, item.detail.vars)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={cn("card rounded-[24px] p-6", missingDocs.length === 0 && "lg:col-span-2")}>
          <p className={cardTitle}>
            {l("Keyingi qadamlar")}
          </p>
          {steps.length === 0 ? (
            <p className="text-body-sm text-ink-700 dark:text-white/70">
              {l("Hammasi bajarildi. Hujjatlaringizni rasmiy talablar bilan yana bir bor solishtiring.")}
            </p>
          ) : (
            <ul className="space-y-2">
              {steps.map((step) => (
                <li key={step.key}>
                  <Link
                    href={step.href}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 transition-colors hover:bg-surface-tint"
                  >
                    <span className="flex min-w-0 items-center gap-3 text-body-sm font-semibold text-ink-900">
                      
                      <span className="min-w-0">{l(step.action)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="rounded-pill bg-emerald-500/10 px-2.5 py-1 text-caption font-semibold text-emerald-700 dark:text-emerald-300">
                        {l("+{n} ball", { n: step.gain })}
                      </span>
                      <ArrowRight size={14} className="text-ink-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {missingDocs.length > 0 && (
          <div className="card rounded-[24px] p-6">
            <p className={cardTitle}>
              {l("Yetishmayotgan hujjatlar")}
            </p>
            <ul className="space-y-2.5">
              {missingDocs.map((doc) => (
                <li key={doc} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {l(doc)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-400/20 dark:bg-amber-400/10">
        <ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="space-y-1 text-body-sm text-amber-900 dark:text-amber-200">
          <p>{l("Ball faqat nimalarni bajarganingizni sanaydi: hujjat mazmunini tekshirmaydi va viza qarorini oldindan aytmaydi. Viza tasdiqlanishini kafolatlamaydi.")}</p>
          <p>{l("Checklist va mashq natijalari shu brauzerda saqlanadi, boshqa qurilmada ko'rinmaydi.")}</p>
        </div>
      </div>
    </>
  );
}
