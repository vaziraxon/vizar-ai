"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { PROBLEM_CARDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProblemCard } from "@/types";

const accentStyles: Record<
  ProblemCard["accent"],
  { icon: string; ring: string; tint: string }
> = {
  red: {
    icon: "bg-gradient-to-br from-red-500 to-rose-400",
    ring: "group-hover:border-red-200",
    tint: "bg-red-50 text-red-600",
  },
  orange: {
    icon: "bg-gradient-to-br from-orange-500 to-amber-400",
    ring: "group-hover:border-orange-200",
    tint: "bg-orange-50 text-orange-600",
  },
  violet: {
    icon: "bg-gradient-to-br from-violet-600 to-purple-400",
    ring: "group-hover:border-violet-200",
    tint: "bg-violet-50 text-violet-600",
  },
};

export function ProblemSection() {
  return (
    <section id="problem" className="section bg-surface">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-red-200 bg-red-50 px-4 py-1.5 text-caption font-semibold text-red-600">
            <AlertTriangle size={14} />
            Real muammolar
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Viza olish jarayonidagi asosiy muammolar
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Har yili minglab nomzodlar viza olish yo&apos;lida bir xil
            to&apos;siqlarga duch keladi — VIZAR AI aynan shu muammolarni
            hal qilish uchun yaratilgan.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEM_CARDS.map((card, i) => {
            const accent = accentStyles[card.accent];
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className={cn(
                  "group card card-hover relative flex flex-col gap-4 overflow-hidden p-6",
                  accent.ring
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm",
                    accent.icon
                  )}
                >
                  <card.icon size={22} strokeWidth={2} />
                </span>
                <h3 className="font-display text-display-sm text-ink-900">
                  {card.title}
                </h3>
                <p className="text-body-sm text-ink-600">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
