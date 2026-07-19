import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border p-10 text-center dark:border-white/10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-400 dark:bg-white/10 dark:text-white/40">
        <Icon size={22} />
      </span>
      <p className="text-body font-semibold text-ink-900 dark:text-white">{title}</p>
      <p className="max-w-sm text-body-sm text-ink-600 dark:text-white/60">
        {description}
      </p>
      {action}
    </div>
  );
}
