"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import {
  FileWarning,
  MessagesSquare,
  ListChecks,
  StickyNote,
  History,
  Plus,
  FolderOpen,
  CalendarClock,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SuccessToast } from "@/components/states/SuccessToast";
import { AGENCY_NAV, AGENCY_CLIENTS, SPECIALISTS } from "@/data/mockData";
import type { ClientStatus } from "@/types";

const STATUS_OPTIONS: ClientStatus[] = [
  "Yangi",
  "Jarayonda",
  "Konsultatsiya kerak",
  "Tayyor",
  "Yakunlangan",
];

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = AGENCY_CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [specialist, setSpecialist] = useState(client.assignedSpecialist);
  const [notes, setNotes] = useState(client.notes);
  const [noteText, setNoteText] = useState("");
  const [toast, setToast] = useState("");

  function addNote() {
    if (!noteText.trim()) return;
    setNotes((prev) => [
      { id: `n-${Date.now()}`, author: "Siz", text: noteText.trim(), date: "hozir" },
      ...prev,
    ]);
    setNoteText("");
    setToast("Izoh qo'shildi");
  }

  return (
    <DashboardShell
      title={client.name}
      subtitle={`${client.flag} ${client.country} — ${client.visaType}`}
      navItems={AGENCY_NAV}
      showOnboarding={false}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile summary */}
        <div className="card flex flex-col items-center gap-3 p-6 text-center dark:border-white/10 dark:bg-navy-800">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-body font-semibold text-white">
            {client.initials}
          </span>
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            {client.name}
          </p>
          <StatusBadge status={status} />
          <ScoreRing score={client.readinessScore} size={100} strokeWidth={8} label="/ 100" />

          <div className="w-full space-y-3 border-t border-surface-border pt-4 text-left dark:border-white/10">
            <div>
              <label className="mb-1 block text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
                Holatni o&apos;zgartirish
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ClientStatus);
                  setToast("Holat yangilandi");
                }}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
                Mas&apos;ul mutaxassis
              </label>
              <select
                value={specialist}
                onChange={(e) => {
                  setSpecialist(e.target.value);
                  setToast("Mutaxassis tayinlandi");
                }}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
              >
                {SPECIALISTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setToast("Hujjatlar ochildi (demo)")}
                className="flex items-center justify-center gap-1.5 rounded-pill border border-surface-border px-3 py-2 text-caption font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
              >
                <FolderOpen size={13} /> Hujjatlar
              </button>
              <button
                type="button"
                onClick={() => setToast("Konsultatsiya rejalashtirildi (demo)")}
                className="flex items-center justify-center gap-1.5 rounded-pill border border-surface-border px-3 py-2 text-caption font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
              >
                <CalendarClock size={13} /> Konsultatsiya
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
              <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
                <FileWarning size={16} className="text-red-500" /> Xavf omillari
              </p>
              {client.riskFactors.length === 0 ? (
                <p className="text-body-sm text-ink-400 dark:text-white/40">Aniqlangan xavf yo&apos;q.</p>
              ) : (
                <ul className="space-y-2 text-body-sm text-ink-600 dark:text-white/60">
                  {client.riskFactors.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
              <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
                <MessagesSquare size={16} className="text-brand-600" /> Intervyu natijasi
              </p>
              <p className="font-display text-2xl font-bold text-ink-900 dark:text-white">
                {client.interviewScore}/100
              </p>
              <p className="text-caption text-ink-400 dark:text-white/40">
                Oxirgi AI Interview mashqi natijasi
              </p>
            </div>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <ListChecks size={16} className="text-brand-600" /> Hujjatlar checklisti
            </p>
            <ul className="space-y-2">
              {client.documents.map((d) => (
                <li key={d.label} className="flex items-center justify-between text-body-sm">
                  <span className="text-ink-700 dark:text-white/70">{d.label}</span>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <ListChecks size={16} className="text-success" /> Tavsiyalar
            </p>
            <ul className="space-y-2 text-body-sm text-ink-600 dark:text-white/60">
              {client.recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <History size={16} className="text-brand-600" /> Faoliyat jadvali
            </p>
            <ul className="space-y-3 border-l border-surface-border pl-4 dark:border-white/10">
              {client.timeline.map((t) => (
                <li key={t.label + t.date} className="relative text-body-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                  <span className="font-medium text-ink-900 dark:text-white">{t.label}</span>
                  <span className="ml-2 text-caption text-ink-400 dark:text-white/40">{t.date}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <StickyNote size={16} className="text-warning" /> Izohlar
            </p>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Izoh qo'shish..."
                className="flex-1 rounded-lg border border-surface-border bg-white px-3 py-2 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addNote}
                className="flex items-center gap-1 rounded-lg bg-brand-gradient px-3 py-2 text-caption font-semibold text-white shadow-glow"
              >
                <Plus size={14} /> Qo&apos;shish
              </button>
            </div>
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-surface-tint p-3 text-body-sm dark:bg-white/5">
                  <p className="text-ink-700 dark:text-white/70">{n.text}</p>
                  <p className="mt-1 text-caption text-ink-400 dark:text-white/40">
                    {n.author} · {n.date}
                  </p>
                </li>
              ))}
              {notes.length === 0 && (
                <p className="text-body-sm text-ink-400 dark:text-white/40">Hali izoh yo&apos;q.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      <SuccessToast open={!!toast} message={toast} onClose={() => setToast("")} />
    </DashboardShell>
  );
}
