"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface SuccessToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SuccessToast({
  open,
  message,
  onClose,
  duration = 3000,
}: SuccessToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-[70] flex items-center gap-3 rounded-pill border border-surface-border bg-white px-5 py-3 shadow-float dark:border-white/10 dark:bg-navy-800"
        >
          <CheckCircle2 size={18} className="text-success" />
          <span className="text-body-sm font-medium text-ink-900 dark:text-white">
            {message}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="text-ink-400 hover:text-ink-700 dark:text-white/40 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
