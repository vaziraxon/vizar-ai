"use client";

import { cn } from "@/lib/utils";
import { useL } from "@/components/i18n/L";

const STATUS_STYLES: Record<string, string> = {
  // Documents
  Tasdiqlandi: "bg-success/10 text-green-800 dark:text-green-300",
  "Kamchilik bor": "bg-red-500/10 text-red-700 dark:text-red-300",
  "Yangilash kerak": "bg-warning/10 text-warning",
  Yuklanmagan: "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/50",
  Yuklandi: "bg-brand-50 text-brand-600 dark:bg-brand-600/40 dark:text-brand-300",
  "AI tahlil qilmoqda": "bg-brand-50 text-brand-600 dark:bg-brand-600/40 dark:text-brand-300",
  // Applications
  Qoralama: "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/50",
  Yangi: "bg-brand-50 text-brand-600 dark:bg-brand-600/40 dark:text-brand-300",
  "Tahlil qilinmoqda": "bg-brand-50 text-brand-600 dark:bg-brand-600/40 dark:text-brand-300",
  Tayyor: "bg-success/10 text-green-800 dark:text-green-300",
  "Konsultatsiya kerak": "bg-warning/10 text-warning",
  Yakunlangan: "bg-success/10 text-green-800 dark:text-green-300",
  // Tasks
  Bajarildi: "bg-success/10 text-green-800 dark:text-green-300",
  Jarayonda: "bg-brand-50 text-brand-600 dark:bg-brand-600/40 dark:text-brand-300",
  Boshlanmagan: "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/50",
  Muhim: "bg-red-500/10 text-red-700 dark:text-red-300",
  // Consultation requests
  Kutilmoqda: "bg-brand-50 text-brand-600 dark:bg-brand-600/40 dark:text-brand-300",
  "Bog'lanildi": "bg-success/10 text-green-800 dark:text-green-300",
  "Bekor qilindi": "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/50",
  // Subscription requests
  Faollashtirildi: "bg-success/10 text-green-800 dark:text-green-300",
  "Rad etildi": "bg-red-500/10 text-red-700 dark:text-red-300",
  // Risk levels
  Past: "bg-success/10 text-green-800 dark:text-green-300",
  "O'rta": "bg-warning/10 text-warning",
  Yuqori: "bg-red-500/10 text-red-700 dark:text-red-300",
  // Admin / support
  Ochiq: "bg-warning/10 text-warning",
};

export function StatusBadge({ status }: { status: string }) {
  const l = useL();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-caption font-semibold",
        STATUS_STYLES[status] ??
          "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/70"
      )}
    >
      {l(status)}
    </span>
  );
}
