import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Documents
  Tasdiqlandi: "bg-success/10 text-success",
  "Kamchilik bor": "bg-red-500/10 text-red-600",
  "Yangilash kerak": "bg-warning/10 text-warning",
  Yuklanmagan: "bg-surface-muted text-ink-400 dark:bg-white/10 dark:text-white/50",
  "AI tahlil qilmoqda": "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
  // Applications
  Draft: "bg-surface-muted text-ink-400 dark:bg-white/10 dark:text-white/50",
  Yangi: "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
  "Tahlil qilinmoqda": "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
  Tayyor: "bg-success/10 text-success",
  "Konsultatsiya kerak": "bg-warning/10 text-warning",
  Yakunlangan: "bg-success/10 text-success",
  // Tasks
  Bajarildi: "bg-success/10 text-success",
  Jarayonda: "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
  Boshlanmagan: "bg-surface-muted text-ink-400 dark:bg-white/10 dark:text-white/50",
  Muhim: "bg-red-500/10 text-red-600",
  // Risk levels
  Past: "bg-success/10 text-success",
  "O'rta": "bg-warning/10 text-warning",
  Yuqori: "bg-red-500/10 text-red-600",
  // Admin / support
  Ochiq: "bg-warning/10 text-warning",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-caption font-semibold",
        STATUS_STYLES[status] ??
          "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/70"
      )}
    >
      {status}
    </span>
  );
}
