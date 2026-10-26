"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { Flag } from "@/components/site/Flag";
import { useDateLocale, useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG } from "@/lib/site/registry";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import {
  CHECKLIST_SELECTION_KEY,
  DEFAULT_SELECTION,
  VISA_KINDS,
  checklistKey,
  checklistProgress,
  type ChecklistSaved,
  type ChecklistSelection,
} from "@/lib/dashboard/checklist-template";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;
const daysUntil = (iso: string) => {
  const t = new Date(`${iso}T00:00:00`).getTime();
  if (Number.isNaN(t)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((t - today.getTime()) / DAY);
};

/** Travel + appointment countdown, saved in this browser. */
export function TripCountdown({ className }: { className?: string }) {
  const l = useL();
  const locale = useDateLocale();
  const [trip, setTrip] = useLocalState<{ travel: string; appointment: string }>("vizar-trip-dates", { travel: "", appointment: "" });
  const travelDays = trip.travel ? daysUntil(trip.travel) : null;
  const apptDays = trip.appointment ? daysUntil(trip.appointment) : null;
  const docsBy =
    trip.appointment && apptDays !== null
      ? new Date(new Date(`${trip.appointment}T00:00:00`).getTime() - 7 * DAY).toLocaleDateString(locale, { day: "numeric", month: "long" })
      : null;

  const big =
    travelDays === null ? null : travelDays > 0 ? String(travelDays) : travelDays === 0 ? "🎉" : "✓";
  const bigLabel =
    travelDays === null
      ? ""
      : travelDays > 0
        ? l("kun qoldi")
        : travelDays === 0
          ? l("Safar bugun!")
          : l("Safar sanasi o'tdi");

  return (
    <section aria-labelledby="trip-title" className={cn("card spotlight relative overflow-hidden rounded-[28px] p-6 sm:p-7", className)}>
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-500/15 to-violet-500/15 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p id="trip-title" className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">
            <span aria-hidden="true">✈️</span> {l("Safargacha")}
          </p>
          {big ? (
            <p className="mt-2 flex items-baseline gap-3">
              <span className="font-accent text-[64px] font-medium italic leading-none text-ink-950">{big}</span>
              <span className="text-body font-semibold text-ink-700">{bigLabel}</span>
            </p>
          ) : (
            <p className="mt-2 max-w-sm text-body-sm text-ink-600">{l("Safar sanasini kiriting — qolgan kunlar va muhim muddatlar shu yerda ko'rinadi.")}</p>
          )}
        </div>
        <span className="rounded-pill border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          💾 {l("Shu brauzerda saqlanadi")}
        </span>
      </div>

      {(apptDays !== null || docsBy) && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {apptDays !== null && (
            <span className="rounded-pill bg-surface-tint px-3 py-1.5 text-caption font-semibold text-ink-800">
              🗓️ {apptDays > 0 ? l("Uchrashuvgacha {n} kun", { n: apptDays }) : apptDays === 0 ? l("Uchrashuv bugun") : l("Uchrashuv o'tdi")}
            </span>
          )}
          {docsBy && apptDays !== null && apptDays > 0 && (
            <span className="rounded-pill bg-amber-400/15 px-3 py-1.5 text-caption font-semibold text-amber-800 dark:text-amber-300">
              📄 {l("Hujjatlarni {date} gacha tayyorlang", { date: docsBy })}
            </span>
          )}
        </div>
      )}

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-caption font-semibold text-ink-600">
            <CalendarDays size={13} /> {l("Safar sanasi")}
          </span>
          <input
            type="date"
            value={trip.travel}
            onChange={(e) => setTrip((t) => ({ ...t, travel: e.target.value }))}
            className="input h-11"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-caption font-semibold text-ink-600">
            <CalendarDays size={13} /> {l("Elchixona uchrashuvi (ixtiyoriy)")}
          </span>
          <input
            type="date"
            value={trip.appointment}
            onChange={(e) => setTrip((t) => ({ ...t, appointment: e.target.value }))}
            className="input h-11"
          />
        </label>
      </div>
    </section>
  );
}

/** Progress of the personal checklist (reads the same saved state). */
export function ChecklistMini({ className }: { className?: string }) {
  const l = useL();
  const site = useSite();
  const [selection] = useLocalState<ChecklistSelection>(CHECKLIST_SELECTION_KEY, DEFAULT_SELECTION);
  const [saved] = useLocalState<ChecklistSaved>(checklistKey(selection.dest, selection.visa), { done: [], custom: [] });
  const progress = checklistProgress(selection, saved);
  const dest = DESTINATION_BY_SLUG[selection.dest];
  const visa = VISA_KINDS.find((v) => v.id === selection.visa);

  return (
    <section aria-labelledby="checklist-mini" className={cn("card spotlight flex flex-col rounded-[28px] p-6 sm:p-7", className)}>
      <p id="checklist-mini" className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">
        <span aria-hidden="true">✅</span> {l("Checklist")}
      </p>
      <div className="mt-4 flex items-center gap-4">
        <ScoreRing score={progress.percent} size={92} strokeWidth={9} label="%" />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900">
            {dest && <Flag code={dest.flag} size={22} />}
            <span className="truncate">{site.destinations[selection.dest].name}</span>
          </p>
          <p className="text-caption text-ink-500">
            {visa?.emoji} {l(visa?.label ?? "")}
          </p>
          <p className="mt-2 text-caption font-medium text-ink-600">
            {l("{done}/{total} hujjat tayyor", { done: progress.done, total: progress.total })}
          </p>
        </div>
      </div>
      <Link href="/dashboard/checklist" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep">
        {l("Checklistni ochish")} <ArrowRight size={14} />
      </Link>
    </section>
  );
}
