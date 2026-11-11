"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MAX_STAGGER = 8;

/**
 * Motion for the public site, driven by data attributes so pages stay plain markup:
 *
 * - `data-reveal-stagger` — children fade up one after another when the
 *   container scrolls into view (CSS in globals.css, `--i` set here).
 * - `data-parallax="0.1"` — drifts at that fraction of the scroll while on
 *   screen (CSS `translate`, so it composes with any transform or animation).
 * - `data-magnetic` — leans a few pixels toward a fine pointer.
 *
 * Nothing moves for reduced motion; magnetic needs a mouse or trackpad.
 * Re-scans on every route change, like RevealObserver.
 */
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];

    // Staggered reveals
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.setAttribute("data-shown", "");
            io.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      document.querySelectorAll<HTMLElement>("[data-reveal-stagger]:not([data-shown])").forEach((el) => {
        Array.from(el.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(Math.min(i, MAX_STAGGER))));
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    }

    // Scroll parallax, one rAF per scroll burst
    const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (layers.length) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const mid = window.innerHeight / 2;
        for (const el of layers) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
          const speed = Number(el.dataset.parallax) || 0;
          const offset = (rect.top + rect.height / 2 - mid) * -speed;
          el.style.translate = `0 ${offset.toFixed(1)}px`;
        }
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        layers.forEach((el) => (el.style.translate = ""));
      });
    }

    // Magnetic buttons
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const strength = 0.22;
        const max = 8;
        const onMove = (e: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = Math.max(-max, Math.min(max, (e.clientX - (rect.left + rect.width / 2)) * strength));
          const dy = Math.max(-max, Math.min(max, (e.clientY - (rect.top + rect.height / 2)) * strength));
          el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        };
        const onLeave = () => (el.style.translate = "");
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.translate = "";
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
