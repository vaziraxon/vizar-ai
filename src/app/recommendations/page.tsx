"use client";


import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RECOMMENDATION_TASKS, READINESS_MISSING_DOCS } from "@/data/mockData";
import type { TaskStatus } from "@/types";
import { useL } from "@/components/i18n/L";
import { useLocalState } from "@/lib/dashboard/use-local-state";

const TIP_EMOJI = ["🏦", "🏨", "🎤", "👤", "🤝"];

export default function RecommendationsPage() {
  const [tasks, setTasks] = useLocalState("vizar-rec-tasks", RECOMMENDATION_TASKS);
  const l = useL();

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card rounded-[28px] p-6 sm:p-7 lg:col-span-2">
          <p className="mb-4 flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true">📌</span> {l("Ustuvor vazifalar ro'yxati")}
          </p>
          <p className="-mt-2 mb-4 text-caption text-ink-500">👆 {l("Holatni o'zgartirish uchun belgini bosing — saqlanadi.")}</p>
          <ul className="space-y-3">
            {tasks.map((task, i) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface px-3 py-3 transition-colors hover:bg-surface-tint"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 text-[18px] ring-1 ring-brand-100">
                    {TIP_EMOJI[i] ?? "📌"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-ink-900">{l(task.title)}</p>
                    <p className="text-caption text-ink-400">
                      🗓️ {l("Muddat:")} {l(task.dueLabel)}
                    </p>
                  </div>
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
          <div className="card rounded-[24px] p-6">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
              <span aria-hidden="true">🔔</span> {l("Eslatmalar")}
            </p>
            <ul className="space-y-2.5 text-body-sm text-ink-600 dark:text-white/60">
              {READINESS_MISSING_DOCS.map((doc) => (
                <li key={doc}>{l("{doc} hujjatini yuklashni unutmang.", { doc: l(doc) })}</li>
              ))}
            </ul>
          </div>

          <div className="card rounded-[24px] p-6">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
              <span aria-hidden="true">🌍</span> {l("Davlatga oid maslahat")}
            </p>
            <p className="text-body-sm text-ink-600">
              {l("Janubiy Koreya konsulligi moliyaviy barqarorlik va aniq safar rejasiga alohida e'tibor beradi.")}
            </p>
          </div>

          <div className="card rounded-[24px] p-6">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
              <span aria-hidden="true">🎤</span> {l("Intervyu mashqi")}
            </p>
            <p className="text-body-sm text-ink-600">
              {l("Qaytish niyatingiz haqidagi savollarga tayyorgarlik ko'rish tavsiya etiladi.")}
            </p>
          </div>

          <div className="card rounded-[24px] p-6">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
              <span aria-hidden="true">🤝</span> {l("Konsultatsiya")}
            </p>
            <p className="text-body-sm text-ink-600">
              {l("Moliyaviy hujjatlaringizni mutaxassis bilan ko'rib chiqish tavsiya etiladi.")}
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
