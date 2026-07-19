export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={`card animate-pulse space-y-3 p-6 dark:border-white/10 dark:bg-navy-800 ${className ?? ""}`}
    >
      <div className="h-4 w-1/3 rounded bg-surface-muted dark:bg-white/10" />
      <div className="h-8 w-1/2 rounded bg-surface-muted dark:bg-white/10" />
      <div className="h-3 w-full rounded bg-surface-muted dark:bg-white/10" />
      <div className="h-3 w-2/3 rounded bg-surface-muted dark:bg-white/10" />
    </div>
  );
}
