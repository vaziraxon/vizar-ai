"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessible FAQ accordion with a 220ms height transition. `classic`: hairline
 * dividers and a bare chevron. `violet` (landing page): compact cards that tint
 * violet on hover and press, the open one framed in violet with a filled
 * chevron circle.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  tone = "classic",
  className,
}: {
  items: { q: string; a: string }[];
  defaultOpen?: number | null;
  tone?: "classic" | "violet";
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();
  const violet = tone === "violet";

  return (
    <ul className={cn(violet ? "space-y-2.5" : "border-t border-surface-border", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${uid}-q-${i}`;
        const panelId = `${uid}-a-${i}`;
        return (
          <li
            key={item.q}
            className={cn(
              violet
                ? cn(
                    "overflow-hidden rounded-2xl border transition-[background-color,border-color,box-shadow] duration-200 ease-premium",
                    isOpen
                      ? "border-violet-300 bg-violet-50 shadow-[0_16px_32px_-20px_rgba(113,56,236,0.6)] dark:border-violet-700/40"
                      : "border-surface-border bg-surface hover:border-violet-200 hover:bg-violet-50/70 hover:shadow-[0_12px_26px_-20px_rgba(113,56,236,0.5)]"
                  )
                : "border-b border-surface-border"
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={
                  violet
                    ? "group flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors duration-150 active:bg-violet-100"
                    : "group flex w-full items-center justify-between gap-6 rounded-lg py-5 text-left"
                }
              >
                <span
                  className={cn(
                    violet
                      ? cn(
                          "text-[15px] font-semibold transition-colors duration-150",
                          isOpen ? "text-violet-800" : "text-ink-900 group-hover:text-violet-700"
                        )
                      : "text-body font-semibold text-ink-900 sm:text-[17px]"
                  )}
                >
                  {item.q}
                </span>
                {violet ? (
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                      isOpen
                        ? "bg-gradient-to-r from-[#7138EC] to-violet-600 text-white shadow-[0_8px_18px_-8px_rgba(113,56,236,0.8)]"
                        : "bg-violet-50 text-violet-700 group-hover:bg-violet-100 group-active:bg-violet-200"
                    )}
                  >
                    <ChevronDown
                      size={16}
                      strokeWidth={2.2}
                      className={cn("transition-transform duration-200 ease-premium", isOpen && "rotate-180")}
                    />
                  </span>
                ) : (
                  <ChevronDown
                    size={20}
                    strokeWidth={1.9}
                    className={cn(
                      "shrink-0 text-ink-500 transition-transform duration-200 ease-premium group-hover:text-ink-900",
                      isOpen && "rotate-180 text-brand-600"
                    )}
                  />
                )}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-premium",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p
                  className={violet ? "px-5 pb-4 pr-14 text-body-sm leading-relaxed text-ink-600" : "max-w-2xl pb-6 pr-10 text-body text-ink-600"}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
