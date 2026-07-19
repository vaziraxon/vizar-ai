"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  className?: string;
}

function barColor(value: number) {
  if (value >= 80) return "bg-success";
  if (value >= 60) return "bg-warning";
  return "bg-red-500";
}

export function ProgressBar({ label, value, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between text-body-sm">
        <span className="font-medium text-ink-700 dark:text-white/80">
          {label}
        </span>
        <span className="font-semibold text-ink-900 dark:text-white">
          {value}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-muted dark:bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-pill", barColor(value))}
        />
      </div>
    </div>
  );
}
