"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useL } from "@/components/i18n/L";
import { cn } from "@/lib/utils";

const SEEN_KEY = "vizar:welcomed";
const VISIBLE_MS = 6000;

/**
 * "Xush kelibsiz, {name}!" when the user arrives in the dashboard — once per
 * browser tab session, so moving between pages doesn't repeat it.
 */
export function WelcomeToast({ name }: { name: string }) {
  const l = useL();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Storage blocked: greet anyway, once per page load
    }
    // Marked as seen only once it really shows (a cancelled run leaves no trace)
    const show = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setShown(true);
      requestAnimationFrame(() => setOpen(true));
    }, 300);
    const hide = setTimeout(() => setOpen(false), 300 + VISIBLE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (!shown) return null;
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-4 top-4 z-50 mx-auto max-w-sm transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:top-6",
        open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      )}
    >
      <div className="flex items-center gap-3.5 rounded-[22px] border border-surface-border bg-surface p-3.5 pr-2 shadow-float dark:border-white/10">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 font-display text-body-lg font-bold text-white"
        >
          {initial || "V"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-body font-bold text-ink-950">
            {name ? l("Xush kelibsiz, {name}!", { name }) : l("Xush kelibsiz!")}
          </p>
          <p className="text-caption text-ink-500">{l("Tayyorgarlikni shu yerdan davom ettiring.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={l("Yopish")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface-tint hover:text-ink-700"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
