"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Flag } from "@/components/site/Flag";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import {
  CHECKLIST_SELECTION_KEY,
  DEFAULT_SELECTION,
  VISA_KINDS,
  buildChecklist,
  checklistKey,
  type ChecklistItem,
  type ChecklistSaved,
  type ChecklistSelection,
} from "@/lib/dashboard/checklist-template";
import { cn } from "@/lib/utils";

const EMPTY: ChecklistSaved = { done: [], custom: [] };

export default function ChecklistPage() {
  const l = useL();
  const site = useSite();
  const [selection, setSelection] = useLocalState<ChecklistSelection>(CHECKLIST_SELECTION_KEY, DEFAULT_SELECTION);
  const [saved, setSaved] = useLocalState<ChecklistSaved>(checklistKey(selection.dest, selection.visa), EMPTY);
  const [draft, setDraft] = useState("");

  const groups = useMemo(() => buildChecklist(selection.dest, selection.visa, saved.custom), [selection, saved.custom]);
  const allIds = groups.flatMap((g) => g.items.map((i) => i.id));
  const done = new Set(saved.done.filter((id) => allIds.includes(id)));
  const percent = allIds.length ? Math.round((done.size / allIds.length) * 100) : 0;
  const nextItem = groups.flatMap((g) => g.items).find((i) => !done.has(i.id));

  function toggle(id: string) {
    setSaved((prev) => ({
      ...prev,
      done: prev.done.includes(id) ? prev.done.filter((x) => x !== id) : [...prev.done, id],
    }));
  }

  function addCustom(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const item: ChecklistItem = { id: `custom-${Date.now()}`, title, emoji: "📎", custom: true };
    setSaved((prev) => ({ ...prev, custom: [...prev.custom, item] }));
    setDraft("");
  }

  function removeCustom(id: string) {
    setSaved((prev) => ({ done: prev.done.filter((x) => x !== id), custom: prev.custom.filter((i) => i.id !== id) }));
  }

  return (
    <DashboardShell
      title="Shaxsiy checklist"
      subtitle="Davlat va viza turingizga mos hujjatlar ro'yxati."
      eyebrow={
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          💾 {l("Shu brauzerda saqlanadi")}
        </span>
      }
      actions={
        <button type="button" onClick={() => window.print()} className="btn-secondary btn-md">
          <Printer size={16} /> {l("Chop etish")}
        </button>
      }
    >
      {/* Selection */}
      <div className="card mb-5 grid gap-5 rounded-[28px] p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="mb-2.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">🌍 {l("Yo'nalish")}</p>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => setSelection((s) => ({ ...s, dest: d.slug as DestinationSlug }))}
                aria-pressed={selection.dest === d.slug}
                className={cn(
                  "inline-flex items-center gap-2 rounded-pill border py-1 pl-1 pr-3.5 text-body-sm font-semibold transition-colors",
                  selection.dest === d.slug
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                )}
              >
                <Flag code={d.flag} size={24} />
                {site.destinations[d.slug].name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">🛂 {l("Viza turi")}</p>
          <div className="grid grid-cols-2 gap-2">
            {VISA_KINDS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelection((s) => ({ ...s, visa: v.id }))}
                aria-pressed={selection.visa === v.id}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-body-sm font-semibold transition-colors",
                  selection.visa === v.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                )}
              >
                <span aria-hidden="true">{v.emoji}</span>
                {l(v.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {groups.map((group) => {
            const groupDone = group.items.filter((i) => done.has(i.id)).length;
            return (
              <section key={group.title} className="card rounded-[24px] p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2.5 font-display text-body-lg font-bold text-ink-950">
                    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 text-[18px] leading-none ring-1 ring-brand-100">
                      {group.emoji}
                    </span>
                    {l(group.title)}
                  </h2>
                  <span
                    className={cn(
                      "rounded-pill px-2.5 py-1 text-caption font-semibold",
                      groupDone === group.items.length ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-surface-tint text-ink-600"
                    )}
                  >
                    {groupDone}/{group.items.length}
                  </span>
                </div>
                <ul className="mt-4 divide-y divide-surface-border">
                  {group.items.map((item) => {
                    const checked = done.has(item.id);
                    return (
                      <li key={item.id} className="flex items-center gap-3 py-3">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5">
                          <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(item.id)} />
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
                              checked
                                ? "border-transparent bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-button"
                                : "border-surface-strong bg-surface"
                            )}
                          >
                            {checked && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-tint text-[17px] leading-none">
                            {item.emoji}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={cn(
                                "block text-body-sm font-semibold",
                                checked ? "text-ink-500 line-through decoration-ink-300" : "text-ink-900"
                              )}
                            >
                              {item.custom ? item.title : l(item.title)}
                            </span>
                            {item.note && <span className="block text-caption text-ink-500">{l(item.note)}</span>}
                          </span>
                        </label>
                        {item.custom ? (
                          <button
                            type="button"
                            onClick={() => removeCustom(item.id)}
                            aria-label={l("O'chirish")}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-ink-400 transition-colors hover:bg-red-500/10 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          item.upload &&
                          !checked && (
                            <Link
                              href="/dashboard/documents"
                              className="shrink-0 rounded-pill border border-surface-border px-3 py-1.5 text-caption font-semibold text-ink-700 transition-colors hover:border-surface-strong hover:text-ink-900"
                            >
                              {l("Yuklash")}
                            </Link>
                          )
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {/* Add your own item */}
          <form onSubmit={addCustom} className="card flex flex-col gap-3 rounded-[24px] p-5 sm:flex-row sm:items-center">
            <span aria-hidden="true" className="hidden text-[20px] sm:block">✍️</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={l("O'z bandingizni qo'shing, masalan: Notarial tarjima")}
              aria-label={l("Yangi band")}
              className="input h-11 flex-1"
              maxLength={120}
            />
            <button type="submit" disabled={!draft.trim()} className="btn-primary btn-md shrink-0">
              <Plus size={16} /> {l("Qo'shish")}
            </button>
          </form>

          <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10">
            ⚠️ {l("Bu ro'yxat namuna. Rasmiy talablar o'zgarishi mumkin — har doim elchixona yoki rasmiy viza markazi saytini tekshiring.")}
          </p>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="card spotlight rounded-[24px] p-6">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
              <span aria-hidden="true" className="text-[14px]">📊</span>
              {l("Umumiy progress")}
            </p>
            <p className="mt-3 font-accent text-[52px] font-medium italic leading-none text-ink-950">{percent}%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-300 ease-premium"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-caption font-medium text-ink-600">
              {l("{done}/{total} hujjat tayyor", { done: done.size, total: allIds.length })}
            </p>
            {percent === 100 ? (
              <p className="mt-4 rounded-2xl bg-emerald-500/10 px-3 py-2.5 text-body-sm font-semibold text-emerald-700 dark:text-emerald-300">
                🎉 {l("Barcha hujjatlar tayyor!")}
              </p>
            ) : (
              nextItem && (
                <div className="mt-4 rounded-2xl bg-surface-tint px-3 py-2.5">
                  <p className="text-caption text-ink-500">{l("Keyingi qadam")}</p>
                  <p className="text-body-sm font-semibold text-ink-900">
                    {nextItem.emoji} {nextItem.custom ? nextItem.title : l(nextItem.title)}
                  </p>
                </div>
              )
            )}
          </div>
          <Link href="/dashboard/documents" className="btn-primary btn-md w-full">
            {l("Hujjatlarni yuklash")} <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setSaved((prev) => ({ ...prev, done: [] }))}
            className="btn-ghost btn-md w-full"
          >
            <RotateCcw size={15} /> {l("Belgilarni tozalash")}
          </button>
        </aside>
      </div>
    </DashboardShell>
  );
}
