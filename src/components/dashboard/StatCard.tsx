import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5 dark:border-white/10 dark:bg-navy-800">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
        <Icon size={19} strokeWidth={2} />
      </span>
      <div>
        <p className="text-caption font-medium text-ink-400 dark:text-white/50">
          {label}
        </p>
        <p className="font-display text-xl font-bold text-ink-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
