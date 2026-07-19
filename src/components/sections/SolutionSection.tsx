"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SOLUTION_MODULES, SOLUTION_SUPPORTING_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SolutionModule } from "@/types";

function ModuleRow({
  module,
  index,
  side,
}: {
  module: SolutionModule;
  index: number;
  side: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-3",
        side === "right" && "lg:flex-row-reverse lg:text-right"
      )}
    >
      <div className="card flex flex-1 items-center gap-3 px-4 py-3.5 lg:flex-none lg:w-64">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white">
          <module.icon size={18} strokeWidth={2} />
        </span>
        <span className="text-body-sm font-semibold text-ink-900">
          {module.title}
        </span>
      </div>
      {/* connector line toward the hub, desktop only */}
      <span
        className={cn(
          "hidden h-px flex-1 bg-gradient-to-r from-brand-200 to-transparent lg:block",
          side === "right" && "bg-gradient-to-l"
        )}
      />
    </motion.div>
  );
}

export function SolutionSection() {
  const leftModules = SOLUTION_MODULES.filter((m) => m.side === "left");
  const rightModules = SOLUTION_MODULES.filter((m) => m.side === "right");

  return (
    <section id="solution" className="section bg-navy-gradient">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-accent-400/30 bg-white/5 px-4 py-1.5 text-caption font-semibold text-accent-400">
            <Sparkles size={14} />
            Yagona platforma
          </span>
          <h2 className="mt-5 font-display text-display-lg text-white">
            VIZAR AI — barcha jarayonlar uchun yagona yechim
          </h2>
          <p className="mt-4 text-body-lg text-white/70">
            {SOLUTION_SUPPORTING_TEXT}
          </p>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          {/* Left modules */}
          <div className="space-y-4">
            {leftModules.map((module, i) => (
              <ModuleRow
                key={module.title}
                module={module}
                index={i}
                side="left"
              />
            ))}
          </div>

          {/* AI core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center lg:h-52 lg:w-52"
          >
            <span className="absolute inset-0 animate-pulse-soft rounded-full bg-brand-gradient opacity-30 blur-2xl" />
            <span className="absolute inset-3 rounded-full border border-dashed border-accent-400/40 animate-spin-slow" />
            <span className="relative flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-full bg-brand-gradient shadow-glow lg:h-36 lg:w-36">
              <Sparkles size={28} className="text-white" strokeWidth={1.8} />
              <span className="font-display text-sm font-bold text-white">
                VIZAR AI
              </span>
            </span>
          </motion.div>

          {/* Right modules */}
          <div className="space-y-4">
            {rightModules.map((module, i) => (
              <ModuleRow
                key={module.title}
                module={module}
                index={i}
                side="right"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
