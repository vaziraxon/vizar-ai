"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Modal } from "@/components/modals/Modal";
import { useL } from "@/components/i18n/L";

export function DemoModeBadge() {
  const [open, setOpen] = useState(false);
  const l = useL();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-surface-border bg-white px-3 text-caption font-semibold text-ink-600 transition-colors hover:border-surface-strong hover:text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        {l("Demo rejimi")}
        <Info size={12} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={l("Demo rejimi haqida")}>
        <ul className="space-y-3 text-body-sm text-ink-600 dark:text-white/60">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
            {l("Barcha ma'lumotlar o'ylab topilgan (fiktiv) — haqiqiy foydalanuvchi ma'lumotlari emas.")}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
            {l("Ushbu platforma haqiqiy viza qarorini qabul qilmaydi.")}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
            {l("Demo rejimida haqiqiy hujjatlaringizni yuklamang.")}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
            {l("Hech qanday ma'lumot tashqi xizmatlarga yuborilmaydi.")}
          </li>
        </ul>
      </Modal>
    </>
  );
}
