import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="card-muted flex items-center justify-between gap-4 p-5 dark:border-white/10 dark:bg-navy-800">
      <div className="min-w-0">
        <p className="truncate text-body-sm font-medium text-ink-500 dark:text-white/50">{label}</p>
        <p className="mt-1.5 font-display text-[28px] font-bold leading-none tracking-[-0.03em] text-ink-900 dark:text-white">
          {value}
        </p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-white text-ink-900 dark:border-white/10 dark:bg-white/10 dark:text-white">
        <Icon size={18} strokeWidth={1.8} />
      </span>
    </div>
  );
}
