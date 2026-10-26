import { SkeletonCard } from "@/components/states/SkeletonCard";
import { SkeletonTable } from "@/components/states/SkeletonTable";

// Shown while dashboard pages load their server data. Mirrors the
// DashboardShell geometry (264px sidebar, 64px top bar) so nothing jumps.
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-surface-tint dark:bg-navy-950" aria-busy="true" aria-live="polite">
      <span className="sr-only">Yuklanmoqda…</span>
      <aside className="hidden w-[264px] shrink-0 border-r border-surface-border bg-white px-6 py-5 lg:block dark:border-white/10 dark:bg-navy-900">
        <div className="skeleton h-8 w-32" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="skeleton h-5" style={{ width: `${60 + ((i * 17) % 35)}%` }} />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 border-b border-surface-border bg-white dark:border-white/10 dark:bg-navy-900" />
        <main className="flex-1 px-4 pb-28 pt-7 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <div className="mx-auto max-w-6xl">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton mt-4 h-9 w-72 max-w-full" />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <SkeletonCard className="lg:col-span-2" />
              <SkeletonCard />
            </div>
            <div className="mt-5">
              <SkeletonTable rows={4} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
