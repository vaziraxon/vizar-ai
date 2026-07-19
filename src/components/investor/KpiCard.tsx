import { TrendingUp } from "lucide-react";
import type { KpiCardData } from "@/types";

export function KpiCard({ icon: Icon, label, value, change }: KpiCardData) {
  return (
    <div className="card p-5 dark:border-white/10 dark:bg-navy-800">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-white">
          <Icon size={17} />
        </span>
        {change && (
          <span className="flex items-center gap-1 text-caption font-semibold text-success">
            <TrendingUp size={12} /> {change}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-xl font-bold text-ink-900 dark:text-white">
        {value}
      </p>
      <p className="text-caption text-ink-400 dark:text-white/50">{label}</p>
    </div>
  );
}
