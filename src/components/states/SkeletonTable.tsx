export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border dark:border-white/10">
      <div className="space-y-0 divide-y divide-surface-border dark:divide-white/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 bg-white p-4 dark:bg-navy-800">
            <div className="h-9 w-9 shrink-0 rounded-full bg-surface-muted dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-surface-muted dark:bg-white/10" />
              <div className="h-2.5 w-1/4 rounded bg-surface-muted dark:bg-white/10" />
            </div>
            <div className="h-5 w-16 shrink-0 rounded-pill bg-surface-muted dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
