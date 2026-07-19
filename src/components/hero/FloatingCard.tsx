"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
  delay?: number;
  iconClassName?: string;
}

export function FloatingCard({
  icon: Icon,
  title,
  subtitle,
  className,
  delay = 0,
  iconClassName,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 + delay, ease: "easeOut" }}
      className={cn(
        "absolute z-20 flex items-center gap-3 rounded-xl border border-white/60 bg-white/90 px-4 py-3 shadow-float backdrop-blur-md",
        "animate-float",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white",
          iconClassName
        )}
      >
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-body-sm font-semibold text-ink-900">
          {title}
        </span>
        <span className="text-caption text-ink-400">{subtitle}</span>
      </span>
    </motion.div>
  );
}
