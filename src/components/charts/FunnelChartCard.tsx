"use client";

import { motion } from "framer-motion";
import type { FunnelStep } from "@/types";

export function FunnelChartCard({
  title,
  steps,
}: {
  title: string;
  steps: FunnelStep[];
}) {
  const max = steps[0]?.value ?? 1;

  return (
    <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
      <p className="mb-5 text-body-sm font-semibold text-ink-900 dark:text-white">
        {title}
      </p>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const widthPct = Math.max((step.value / max) * 100, 8);
          const prevPct = i > 0 ? (steps[i - 1]!.value / max) * 100 : 100;
          const dropOff = i > 0 ? Math.round(100 - (step.value / steps[i - 1]!.value) * 100) : 0;
          return (
            <div key={step.label}>
              <div className="mb-1 flex items-center justify-between text-caption">
                <span className="font-medium text-ink-700 dark:text-white/70">
                  {step.label}
                </span>
                <span className="text-ink-400 dark:text-white/40">
                  {step.value.toLocaleString()}
                  {i > 0 && (
                    <span className="ml-1.5 text-red-500">-{dropOff}%</span>
                  )}
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-md bg-surface-muted dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${widthPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                  className="h-full rounded-md bg-brand-gradient"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
