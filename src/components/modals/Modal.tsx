"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-surface-border bg-white p-6 shadow-float dark:border-white/10 dark:bg-navy-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3
                  id="modal-title"
                  className="font-display text-display-sm text-ink-900 dark:text-white"
                >
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Yopish"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-muted dark:text-white/50 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
