"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Plus, FileSearch2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ConfirmationModal } from "@/components/states/ConfirmationModal";
import { EmptyState } from "@/components/states/EmptyState";
import { SuccessToast } from "@/components/states/SuccessToast";
import { deleteDraftApplicationAction } from "@/lib/actions/applications";
import { displayApplicationStatus } from "@/lib/status-map";
import type { VisaApplication } from "@/lib/data/applications";
import { useDateLocale, useL } from "@/components/i18n/L";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ApplicationsTable({ applications }: { applications: VisaApplication[] }) {
  const router = useRouter();
  const l = useL();
  const locale = useDateLocale();
  const [pendingDelete, setPendingDelete] = useState<VisaApplication | null>(null);
  const [toast, setToast] = useState("");

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteDraftApplicationAction(pendingDelete.id);
    if (result.ok) {
      setToast(l("Ariza o'chirildi"));
      router.refresh();
    } else {
      setToast(result.error);
    }
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={FileSearch2}
        title="Hali arizangiz yo'q"
        description="Yangi viza tahlilini boshlab, birinchi arizangizni yarating."
        action={
          <Link
            href="/assessment"
            className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-brand-600 transition-colors hover:bg-brand-deep px-5 py-2.5 text-body-sm font-semibold text-white"
          >
            <Plus size={15} /> {l("Yangi tahlilni boshlash")}
          </Link>
        }
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-surface-border dark:border-white/10 lg:block">
        <table className="w-full min-w-[720px] text-left text-body-sm">
          <thead className="bg-surface-tint text-caption font-semibold uppercase tracking-wide text-ink-400 dark:bg-white/5 dark:text-white/40">
            <tr>
              <th className="px-5 py-3">{l("Davlat")}</th>
              <th className="px-5 py-3">{l("Viza turi")}</th>
              <th className="px-5 py-3">{l("Yaratilgan sana")}</th>
              <th className="px-5 py-3">{l("Tayyorgarlik")}</th>
              <th className="px-5 py-3">{l("Holat")}</th>
              <th className="px-5 py-3 text-right">{l("Amallar")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border dark:divide-white/10">
            {applications.map((app) => (
              <tr key={app.id} className="bg-surface">
                <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-white">
                  {l(app.destination_country)}
                </td>
                <td className="px-5 py-3.5 text-ink-600 dark:text-white/60">{l(app.visa_type)}</td>
                <td className="px-5 py-3.5 text-ink-600 dark:text-white/60">
                  {formatDate(app.created_at, locale)}
                </td>
                <td className="px-5 py-3.5 font-semibold text-ink-900 dark:text-white">
                  {app.readiness_score !== null ? `${app.readiness_score}/100` : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={displayApplicationStatus(app.status)} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href="/dashboard/readiness"
                      className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      <Eye size={14} /> {l("Ko'rish")}
                    </Link>
                    {app.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(app)}
                        className="text-red-500 hover:text-red-600"
                        aria-label={l("Arizani o'chirish")}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 lg:hidden">
        {applications.map((app) => (
          <div key={app.id} className="card p-5 dark:border-white/10 dark:bg-navy-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900 dark:text-white">
                  {l(app.destination_country)}
                </p>
                <p className="text-body-sm text-ink-600 dark:text-white/60">{l(app.visa_type)}</p>
              </div>
              {app.status === "draft" && (
                <button
                  type="button"
                  onClick={() => setPendingDelete(app)}
                  className="text-red-500"
                  aria-label={l("Arizani o'chirish")}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="mt-2 text-caption text-ink-400 dark:text-white/40">
              {formatDate(app.created_at, locale)}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink-900 dark:text-white">
                {app.readiness_score !== null ? `${app.readiness_score}/100` : "—"}
              </span>
              <StatusBadge status={displayApplicationStatus(app.status)} />
            </div>
            <Link
              href="/dashboard/readiness"
              className="mt-3 inline-flex items-center gap-1 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Eye size={14} /> {l("Ko'rish")}
            </Link>
          </div>
        ))}
      </div>

      <ConfirmationModal
        open={pendingDelete !== null}
        title={l("Arizani o'chirish")}
        description={l("\"{name}\" arizasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.", { name: l(pendingDelete?.destination_country ?? "") })}
        confirmLabel={l("Ha, o'chirish")}
        danger
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
      <SuccessToast open={!!toast} message={toast} onClose={() => setToast("")} />
    </>
  );
}
