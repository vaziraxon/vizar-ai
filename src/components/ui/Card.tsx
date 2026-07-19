import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-border bg-white shadow-card transition-all duration-300",
        hover && "hover:shadow-card-hover hover:-translate-y-1",
        className
      )}
      {...props}
    />
  );
}
