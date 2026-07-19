"use client";

import { motion } from "framer-motion";
import { TRUST_FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const accentClasses: Record<string, string> = {
  brand: "bg-brand-gradient",
  success: "bg-gradient-to-br from-success to-emerald-400",
  accent: "bg-gradient-to-br from-accent-500 to-brand-400",
  warning: "bg-gradient-to-br from-warning to-orange-400",
};

export function TrustSection() {
  return (
    <section id="why-vizar" className="section bg-surface-tint">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 py-1.5 text-caption font-semibold text-brand-600">
            Nima uchun VIZAR AI?
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Vizaga tayyorgarlikni to&apos;g&apos;ri va oson qiling
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Minglab foydalanuvchilar ishonch bilan tanlagan sun&apos;iy
            intellekt yordamchisi — natijaga tezroq va aniqroq yetib boring.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="card card-hover flex flex-col gap-4 p-6"
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                  accentClasses[feature.accent]
                )}
              >
                <feature.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="font-display text-display-sm text-ink-900">
                {feature.title}
              </h3>
              <p className="text-body-sm text-ink-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
