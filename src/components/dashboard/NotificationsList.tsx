"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Bell } from "lucide-react";
import { EmptyState } from "@/components/states/EmptyState";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications";
import type { NotificationRow } from "@/lib/data/notifications";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "hozir";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [isPending, startTransition] = useTransition();

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.is_read : true));

  function toggleRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  function markAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
              filter === "all"
                ? "bg-brand-gradient text-white shadow-glow"
                : "border border-surface-border text-ink-700 dark:border-white/10 dark:text-white/70"
            )}
          >
            Barchasi ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
              filter === "unread"
                ? "bg-brand-gradient text-white shadow-glow"
                : "border border-surface-border text-ink-700 dark:border-white/10 dark:text-white/70"
            )}
          >
            O&apos;qilmagan ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-medium text-ink-700 hover:bg-surface-muted disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
        >
          <CheckCheck size={15} /> Barchasini o&apos;qilgan deb belgilash
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Bildirishnoma yo'q"
          description="Hozircha ko'rsatiladigan bildirishnoma mavjud emas."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => toggleRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                n.is_read
                  ? "border-surface-border bg-white dark:border-white/10 dark:bg-navy-800"
                  : "border-brand-200 bg-brand-50/60 dark:border-brand-400/20 dark:bg-brand-900/10"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                <Bell size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-body-sm font-semibold text-ink-900 dark:text-white">
                    {n.title}
                  </p>
                  {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </div>
                {n.message && (
                  <p className="mt-0.5 text-body-sm text-ink-600 dark:text-white/60">
                    {n.message}
                  </p>
                )}
                <p className="mt-1 text-caption text-ink-400 dark:text-white/40">
                  {timeAgo(n.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
