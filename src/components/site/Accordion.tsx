"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible FAQ accordion: hairline dividers, chevron, 220ms height transition. */
export function Accordion({
  items,
  defaultOpen = 0,
  className,
}: {
  items: { q: string; a: string }[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();

  return (
    <ul className={cn("border-t border-surface-border", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${uid}-q-${i}`;
        const panelId = `${uid}-a-${i}`;
        return (
          <li key={item.q} className="border-b border-surface-border">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 rounded-lg py-5 text-left"
              >
                <span className="text-body font-semibold text-ink-900 sm:text-[17px]">{item.q}</span>
                <ChevronDown
                  size={20}
                  strokeWidth={1.9}
                  className={cn(
                    "shrink-0 text-ink-500 transition-transform duration-200 ease-premium group-hover:text-ink-900",
                    isOpen && "rotate-180 text-brand-600"
                  )}
                />
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
                <p className="max-w-2xl pb-6 pr-10 text-body text-ink-600">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
