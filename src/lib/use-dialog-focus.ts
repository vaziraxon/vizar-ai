"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard focus for an open dialog: moves focus inside when it opens (unless
 * the dialog focuses its own field), keeps Tab and Shift+Tab inside, and hands
 * focus back to whatever opened it once it closes. Escape stays with each dialog.
 */
export function useDialogFocus(open: boolean, ref: RefObject<HTMLElement>, { autoFocus = true } = {}) {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.getClientRects().length > 0);

    // The dialog animates in, so wait a frame for its content to mount
    const frame = autoFocus
      ? requestAnimationFrame(() => {
          if (!ref.current?.contains(document.activeElement)) items()[0]?.focus();
        })
      : 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      const inside = ref.current.contains(document.activeElement);
      if (e.shiftKey && (!inside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      if (opener?.isConnected) opener.focus();
    };
  }, [open, ref, autoFocus]);
}
