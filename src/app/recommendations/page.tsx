"use client";

import { useState } from "react";
import { Bell, Globe2, MessagesSquare, UserCog, ListChecks } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RECOMMENDATION_TASKS, READINESS_MISSING_DOCS } from "@/data/mockData";
import type { TaskStatus } from "@/types";

export default function RecommendationsPage() {
  const [tasks, setTasks] = useState(RECOMMENDATION_TASKS);

  function cycleStatus(id: string) {
    const order: TaskStatus[] = ["Boshlanmagan", "Jarayonda", "Bajarildi"];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.status === "Muhim") return t;
        const idx = order.indexOf(t.status as TaskStatus);
        const nextStatus = order[(idx + 1) % order.length]!;
        return { ...t, status: nextStatus };
      })
    );
  }

  return (
    <DashboardShell
      title="Shaxsiy tavsiyalar"
      subtitle="Sizning holatingizga mos ustuvor vazifalar va tavsiyalar."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 dark:border-white/10 dark:bg-navy-800 lg:col-span-2">
          <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <ListChecks size={16} className="text-brand-600" /> Ustuvor vazifalar ro&apos;yxati
          </p>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-surface-border px-4 py-3 dark:border-white/10"
              >
                <div>
                  <p className="text-body-sm font-medium text-ink-900 dark:text-white">
                    {task.title}
                  </p>
                  <p className="text-caption text-ink-400 dark:text-white/40">
                    Muddat: {task.dueLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cycleStatus(task.id)}
                  disabled={task.status === "Muhim"}
                  className="disabled:cursor-not-allowed"
                >
                  <StatusBadge status={task.status} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <Bell size={16} className="text-warning" /> Eslatmalar
            </p>
            <ul className="space-y-2.5 text-body-sm text-ink-600 dark:text-white/60">
              {READINESS_MISSING_DOCS.map((doc) => (
                <li key={doc}>{doc} hujjatini yuklashni unutmang.</li>
              ))}
            </ul>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <Globe2 size={16} className="text-brand-600" /> Davlatga oid maslahat
            </p>
            <p className="text-body-sm text-ink-600 dark:text-white/60">
              Janubiy Koreya konsulligi moliyaviy barqarorlik va aniq safar
              rejasiga alohida e&apos;tibor beradi.
            </p>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <MessagesSquare size={16} className="text-brand-600" /> Intervyu mashqi
            </p>
            <p className="text-body-sm text-ink-600 dark:text-white/60">
              Qaytish niyatingiz haqidagi savollarga tayyorgarlik ko&apos;rish
              tavsiya etiladi.
            </p>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <UserCog size={16} className="text-brand-600" /> Konsultatsiya
            </p>
            <p className="text-body-sm text-ink-600 dark:text-white/60">
              Moliyaviy hujjatlaringizni mutaxassis bilan ko&apos;rib chiqish
              tavsiya etiladi.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
