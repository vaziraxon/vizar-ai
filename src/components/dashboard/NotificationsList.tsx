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
import { useL } from "@/components/i18n/L";

type Filter = "all" | "unread";

function timeAgo(iso: string, l: ReturnType<typeof useL>) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return l("hozir");
  if (mins < 60) return l("{n} daqiqa oldin", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return l("{n} soat oldin", { n: hours });
  const days = Math.floor(hours / 24);
  return l("{n} kun oldin", { n: days });
}

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const l = useL();
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
                ? "bg-night text-white dark:bg-white dark:text-night"
                : "border border-surface-border text-ink-700 dark:border-white/10 dark:text-white/70"
            )}
          >
            {l("Barchasi")} ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
              filter === "unread"
                ? "bg-night text-white dark:bg-white dark:text-night"
                : "border border-surface-border text-ink-700 dark:border-white/10 dark:text-white/70"
            )}
          >
            {l("O'qilmagan")} ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-medium text-ink-700 hover:bg-surface-muted disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
        >
          <CheckCheck size={15} /> {l("Barchasini o'qilgan deb belgilash")}
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
                  ? "border-surface-border bg-surface"
                  : "border-brand-200 bg-brand-50/60 dark:border-brand-400/20 dark:bg-brand-600/10"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Bell size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-body-sm font-semibold text-ink-900 dark:text-white">
                    {l(n.title)}
                  </p>
                  {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </div>
                {n.message && (
                  <p className="mt-0.5 text-body-sm text-ink-600 dark:text-white/60">
                    {l(n.message)}
                  </p>
                )}
                <p className="mt-1 text-caption text-ink-400 dark:text-white/40">
                  {timeAgo(n.created_at, l)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
