import { cn } from "@/lib/utils";

/** Success / error banner driven by ?ok= / ?error= after a server action redirect. */
export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p
      role="status"
      className={cn(
        "mb-6 rounded-2xl border px-4 py-3 text-body-sm",
        error
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
      )}
    >
      {error ?? ok}
    </p>
  );
}

const TONE: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  gray: "bg-surface-muted text-ink-600",
  blue: "bg-brand-50 text-brand-700",
};

export function Pill({ tone = "gray", children }: { tone?: keyof typeof TONE; children: React.ReactNode }) {
  return <span className={cn("inline-flex shrink-0 items-center rounded-pill px-2 py-0.5 text-[11px] font-semibold", TONE[tone])}>{children}</span>;
}

export const ruleTone = (status: string) =>
  (({ verified: "green", needs_review: "red", outdated: "gray", unverified: "amber" }) as Record<string, keyof typeof TONE>)[status] ?? "gray";

export const sourceTone = (status: string) =>
  (({ ok: "green", changed: "red", unreachable: "amber", error: "amber", pending: "gray" }) as Record<string, keyof typeof TONE>)[status] ?? "gray";

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-caption font-medium text-ink-500">{label}</p>
      <p className="mt-1 font-display text-[26px] font-bold tabular-nums text-ink-950">{value}</p>
      {hint ? <p className="mt-0.5 text-caption text-ink-500">{hint}</p> : null}
    </div>
  );
}

export const formatDate = (iso: string | null | undefined) => (iso ? new Date(iso).toISOString().slice(0, 10) : "—");
