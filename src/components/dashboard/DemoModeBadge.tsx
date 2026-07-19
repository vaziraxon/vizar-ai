"use client";

import { useState } from "react";
import { Sparkles, Info } from "lucide-react";
import { Modal } from "@/components/modals/Modal";

export function DemoModeBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-pill border border-brand-200 bg-brand-50 px-3 py-1.5 text-caption font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-400/30 dark:bg-brand-900/30 dark:text-brand-300"
      >
        <Sparkles size={12} />
        Demo rejimi
        <Info size={12} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Demo rejimi haqida">
        <ul className="space-y-3 text-body-sm text-ink-600 dark:text-white/60">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Barcha ma&apos;lumotlar o&apos;ylab topilgan (fiktiv) — haqiqiy
            foydalanuvchi ma&apos;lumotlari emas.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Ushbu platforma haqiqiy viza qarorini qabul qilmaydi.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Demo rejimida haqiqiy hujjatlaringizni yuklamang.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Hech qanday ma&apos;lumot tashqi xizmatlarga yuborilmaydi.
          </li>
        </ul>
      </Modal>
    </>
  );
}
