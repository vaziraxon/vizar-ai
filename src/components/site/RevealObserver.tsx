"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades `[data-reveal]` elements in as they enter the viewport.
 *
 * Content is fully visible without JS: the hidden state only applies once
 * this component adds `js-reveal` to <html>. Visibility is tracked with a
 * `data-shown` attribute (never `className`) so React re-renders — e.g. a
 * language switch — can't reset it. Re-scans on every route change because
 * the site layout (and this observer) persists across navigations.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    root.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  // Remove the opt-in class when leaving the public site entirely.
  useEffect(() => () => document.documentElement.classList.remove("js-reveal"), []);

  return null;
}
