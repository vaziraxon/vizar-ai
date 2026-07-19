"use client";

import { Printer, Share2 } from "lucide-react";
import { Modal } from "@/components/modals/Modal";
import { CURRENT_USER, CURRENT_APPLICATION, READINESS_CATEGORIES } from "@/data/mockData";
import type { ReportItem } from "@/types";

export function ReportPreviewModal({
  report,
  onClose,
}: {
  report: ReportItem | null;
  onClose: () => void;
}) {
  return (
    <Modal open={report !== null} onClose={onClose} title={report?.title ?? ""}>
      {report && (
        <div>
          <div
            id="report-print-area"
            className="rounded-xl border border-surface-border bg-white p-5 text-ink-900 dark:border-white/10"
          >
            <div className="mb-3 flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-display text-body font-bold text-brand-600">
                VIZAR AI
              </span>
              <span className="text-caption text-ink-400">{report.date}</span>
            </div>
            <p className="text-body-sm font-semibold">{report.title}</p>
            <p className="mt-1 text-caption text-ink-500">
              Foydalanuvchi: {CURRENT_USER.firstName} {CURRENT_USER.lastName}
            </p>
            <p className="text-caption text-ink-500">
              Yo&apos;nalish: {CURRENT_APPLICATION.destination} — {CURRENT_APPLICATION.visaType}
            </p>

            <div className="mt-4 space-y-2">
              {READINESS_CATEGORIES.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-caption">
                  <span>{c.label}</span>
                  <span className="font-semibold">{c.score}%</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-caption italic text-ink-400">
              Ushbu hisobot faqat axborot va tayyorgarlik maqsadida beriladi.
              Viza tasdiqlanishini kafolatlamaydi.
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-brand-gradient px-4 py-2.5 text-body-sm font-semibold text-white shadow-glow"
            >
              <Printer size={15} /> Yuklab olish (demo)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-pill border border-surface-border px-4 py-2.5 text-body-sm font-semibold text-ink-700 dark:border-white/10 dark:text-white/70"
            >
              <Share2 size={15} /> Ulashish (demo)
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
