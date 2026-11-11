"use client";

import { useState } from "react";
import { Eye, Printer, Gauge, FolderOpen, MessagesSquare, FileWarning, FileBarChart2, FileBarChart } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Modal } from "@/components/modals/Modal";
import { EmptyState } from "@/components/states/EmptyState";
import type { ReportRow } from "@/lib/data/reports";
import { AssessmentFindings } from "@/components/dashboard/AssessmentFindings";
import type { AssessmentFinding } from "@/lib/dashboard/assessment-review";
import { useFormatDate, useL } from "@/components/i18n/L";

const TYPE_ICON: Record<string, typeof Gauge> = {
  readiness: Gauge,
  documents: FolderOpen,
  interview: MessagesSquare,
  refusal: FileWarning,
  summary: FileBarChart2,
};

const TYPE_LABEL: Record<string, string> = {
  readiness: "Visa Readiness hisoboti",
  documents: "Hujjatlar tahlili hisoboti",
  interview: "Intervyuga tayyorgarlik hisoboti",
  refusal: "Rad etilish tahlili hisoboti",
  summary: "To'liq ariza xulosasi",
};

/** Reports saved by the visa assessment carry its findings; older ones only raw data. */
function findingsOf(data: unknown): AssessmentFinding[] | null {
  const findings = data && typeof data === "object" ? (data as { findings?: unknown }).findings : null;
  return Array.isArray(findings) ? (findings as AssessmentFinding[]) : null;
}

export function ReportsGrid({ reports }: { reports: ReportRow[] }) {
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const l = useL();
  const fmt = useFormatDate();

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FileBarChart}
        title="Hali hisobot yo'q"
        description="Viza tahlilini yakunlaganingizdan so'ng, hisobotlar shu yerda paydo bo'ladi."
      />
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = TYPE_ICON[report.report_type ?? ""] ?? FileBarChart2;
          return (
            <div
              key={report.id}
              className="card spotlight flex flex-col gap-4 rounded-[24px] p-6"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <Icon size={19} />
                </span>
                <StatusBadge status={report.status === "ready" ? "Tayyor" : "Yaratilmoqda"} />
              </div>
              <div>
                <p className="font-display text-body font-semibold text-ink-900 dark:text-white">
                  {l(report.title || TYPE_LABEL[report.report_type ?? ""] || "Hisobot")}
                </p>
              </div>
              <p className="text-caption text-ink-400 dark:text-white/60">
                {fmt(report.created_at)}
              </p>
              <button
                type="button"
                disabled={report.status !== "ready"}
                onClick={() => setSelected(report)}
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
              >
                <Eye size={14} /> {l("Ko'rish")}
              </button>
            </div>
          );
        })}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={l(selected?.title || "Hisobot")}
      >
        {selected && (
          <div>
            <div
              id="report-print-area"
              className="rounded-xl border border-surface-border bg-surface p-5 text-ink-900 dark:border-white/10"
            >
              <div className="mb-3 flex items-center justify-between border-b border-surface-border pb-3">
                <span className="font-display text-body font-bold text-brand-600">VIZAR AI</span>
                <span className="text-caption text-ink-400">
                  {fmt(selected.created_at)}
                </span>
              </div>
              <p className="text-body-sm font-semibold">{l(selected.title ?? "")}</p>
              {findingsOf(selected.report_data) ? (
                <AssessmentFindings findings={findingsOf(selected.report_data)!} className="mt-3" />
              ) : (
                <pre className="mt-3 whitespace-pre-wrap break-words text-caption text-ink-600">
                  {JSON.stringify(selected.report_data, null, 2)}
                </pre>
              )}
              <p className="mt-4 text-caption italic text-ink-400">
                {l("Ushbu hisobot faqat axborot va tayyorgarlik maqsadida beriladi. Viza tasdiqlanishini kafolatlamaydi.")}
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-brand-600 transition-colors hover:bg-brand-deep px-4 py-2.5 text-body-sm font-semibold text-white"
              >
                <Printer size={15} /> {l("Chop etish yoki PDF")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
