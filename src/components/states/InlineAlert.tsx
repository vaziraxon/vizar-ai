import { Info, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "warning" | "success" | "danger";

const VARIANT_STYLES: Record<
  AlertVariant,
  { wrap: string; icon: string; Icon: typeof Info }
> = {
  info: {
    wrap: "border-brand-200 bg-brand-50 dark:border-brand-400/20 dark:bg-brand-900/20",
    icon: "text-brand-600 dark:text-brand-300",
    Icon: Info,
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/10",
    icon: "text-amber-600",
    Icon: ShieldAlert,
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  danger: {
    wrap: "border-red-200 bg-red-50 dark:border-red-400/20 dark:bg-red-400/10",
    icon: "text-red-600",
    Icon: AlertTriangle,
  },
};

export function InlineAlert({
  variant = "info",
  children,
}: {
  variant?: AlertVariant;
  children: React.ReactNode;
}) {
  const { wrap, icon, Icon } = VARIANT_STYLES[variant];
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-2xl border p-4", wrap)}>
      <Icon size={18} className={cn("mt-0.5 shrink-0", icon)} />
      <div className="text-body-sm text-ink-800 dark:text-white/80">{children}</div>
    </div>
  );
}
