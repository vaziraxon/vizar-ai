"use client";
import { useL } from "@/components/i18n/L";

import { Modal } from "@/components/modals/Modal";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const l = useL();
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-body-sm text-ink-600 dark:text-white/60">
        {l(description)}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 dark:border-white/10 dark:text-white/70"
        >
          {l(cancelLabel)}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={
            danger
              ? "rounded-pill bg-red-600 px-4 py-2 text-body-sm font-semibold text-white hover:bg-red-700"
              : "rounded-pill bg-brand-600 transition-colors hover:bg-brand-deep px-4 py-2 text-body-sm font-semibold text-white"
          }
        >
          {l(confirmLabel)}
        </button>
      </div>
    </Modal>
  );
}
