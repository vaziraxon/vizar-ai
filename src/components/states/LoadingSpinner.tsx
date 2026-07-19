import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  size = 20,
  label,
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("flex items-center gap-2 text-ink-500 dark:text-white/50", className)}
    >
      <Loader2 size={size} className="animate-spin" />
      <span className="text-body-sm">{label ?? "Yuklanmoqda..."}</span>
    </div>
  );
}
