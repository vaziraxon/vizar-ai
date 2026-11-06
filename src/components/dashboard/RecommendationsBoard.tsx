"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { useL } from "@/components/i18n/L";
import { updateRecommendationStatusAction } from "@/lib/actions/recommendations";
import { TASK_HREF } from "@/lib/dashboard/assessment-review";
import { NEXT_STATUS, STATUS_LABEL, openFirst, type RecommendationStatus } from "@/lib/dashboard/recommendations";
import { cn } from "@/lib/utils";

export interface RecommendationItem {
  id: string;
  title: string;
  priority: string | null;
  status: RecommendationStatus;
  created_at: string;
}

const PRIORITY_STYLE: Record<string, string> = {
  Muhim: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
  "O'rtacha": "bg-amber-400/15 text-amber-700 ring-amber-400/25 dark:text-amber-300",
  Past: "bg-surface-tint text-ink-700 ring-surface-border",
};

/** `demo`: Supabase isn't configured, so the sample list changes in memory only. */
export function RecommendationsBoard({ items, demo }: { items: RecommendationItem[]; demo: boolean }) {
  const l = useL();
  const [list, setList] = useState(items);
  const [error, setError] = useState("");

  const setStatus = (id: string, status: RecommendationStatus) =>
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));

  async function advance(item: RecommendationItem) {
    setError("");
    setStatus(item.id, NEXT_STATUS[item.status]);
    if (demo) return;
    const result = await updateRecommendationStatusAction(item.id, NEXT_STATUS[item.status]);
    if (!result.ok) {
      setStatus(item.id, item.status);
      setError(result.error);
    }
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Hali tavsiya yo'q"
        description="Viza tahlilini yakunlang — javoblaringizdan keyingi qadamlar shu yerda paydo bo'ladi."
        action={
          <Link href="/assessment" className="btn-primary btn-md mt-2">
            {l("Yangi tahlilni boshlash")} <ArrowRight size={15} />
          </Link>
        }
      />
    );
  }

  const sorted = openFirst(list);
  const open = sorted.filter((item) => item.status !== "done");
  const done = sorted.filter((item) => item.status === "done");

  const row = (item: RecommendationItem) => {
    const href = TASK_HREF[item.title];
    return (
      <li
        key={item.id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 transition-colors hover:bg-surface-tint"
      >
        <div className="min-w-0 flex-1">
          <p className={cn("text-body-sm font-semibold text-ink-900", item.status === "done" && "text-ink-500 line-through")}>{l(item.title)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {item.priority && (
              <span className={cn("rounded-pill px-2.5 py-0.5 text-[12px] font-semibold ring-1", PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.Past)}>
                {l(item.priority)}
              </span>
            )}
            {href && item.status !== "done" && (
              <Link href={href} className="inline-flex items-center gap-1 text-caption font-semibold text-brand-600 hover:text-brand-deep dark:text-brand-300 dark:hover:text-white">
                {l("Ochish")} <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
        <button type="button" onClick={() => advance(item)} aria-label={l("Holatni o'zgartirish")} className="shrink-0">
          <StatusBadge status={STATUS_LABEL[item.status]} />
        </button>
      </li>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card rounded-[28px] p-6 sm:p-7 lg:col-span-2">
        <p className="mb-4 flex flex-wrap items-center gap-2 font-display text-body-lg font-bold text-ink-950">
          <span aria-hidden="true">📌</span> {l("Ustuvor vazifalar ro'yxati")}
          {demo && (
            <span className="rounded-md bg-surface-tint px-1.5 py-0.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500">
              {l("Namuna")}
            </span>
          )}
        </p>
        <p className="-mt-2 mb-4 text-caption text-ink-500">👆 {l("Holatni o'zgartirish uchun belgini bosing — saqlanadi.")}</p>
        {error && <p role="alert" className="mb-3 text-body-sm font-medium text-red-600">{l(error)}</p>}
        {open.length > 0 ? (
          <ul className="space-y-3">{open.map(row)}</ul>
        ) : (
          <p className="text-body-sm text-ink-600">{l("Hozircha ochiq vazifalar yo'q.")}</p>
        )}
        {done.length > 0 && (
          <details className="mt-6 border-t border-surface-border pt-4">
            <summary className="cursor-pointer text-body-sm font-semibold text-ink-700">{l("Bajarilganlar ({n})", { n: done.length })}</summary>
            <ul className="mt-3 space-y-3">{done.map(row)}</ul>
          </details>
        )}
      </div>

      <div className="card h-fit rounded-[24px] p-6">
        <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
          <span aria-hidden="true">🧭</span> {l("Qayerdan keladi")}
        </p>
        <p className="text-body-sm text-ink-600">
          {l("Bu ro'yxat viza tahlilidagi javoblaringizdan tuziladi. Har bir yangi tahlil o'z qadamlarini qo'shadi.")}
        </p>
        <div className="mt-1.5 flex flex-col">
          <Link href="/assessment" className="inline-flex items-center gap-1.5 py-2.5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep dark:text-brand-300 dark:hover:text-white">
            {l("Yangi viza tahlili")} <ArrowRight size={14} />
          </Link>
          <Link href="/dashboard/readiness" className="inline-flex items-center gap-1.5 py-2.5 text-body-sm font-semibold text-brand-600 hover:text-brand-deep dark:text-brand-300 dark:hover:text-white">
            {l("Tayyorgarlik")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
