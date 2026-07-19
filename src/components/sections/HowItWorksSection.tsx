"use client";

import { motion } from "framer-motion";
import { Route } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section bg-surface-tint">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 py-1.5 text-caption font-semibold text-brand-600">
            <Route size={14} />
            Jarayon
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            VIZAR AI qanday ishlaydi?
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Beshta oddiy bosqichda hujjatlaringizni tahlil qildirib,
            arizangizni ishonch bilan tayyorlang.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connector — vertical on mobile, horizontal on desktop */}
          <span className="absolute left-6 top-2 bottom-2 w-px bg-surface-border lg:left-0 lg:right-0 lg:top-6 lg:h-px lg:w-auto lg:bottom-auto" />

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            {HOW_IT_WORKS_STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="relative flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center"
              >
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
                  <item.icon size={20} strokeWidth={2} />
                </span>
                <div className="pt-1 lg:pt-0">
                  <span className="text-caption font-bold uppercase tracking-wide text-brand-500">
                    Qadam {item.step}
                  </span>
                  <p className="mt-1 max-w-[180px] text-body-sm font-semibold text-ink-900 lg:mx-auto">
                    {item.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
