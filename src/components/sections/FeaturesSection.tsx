"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { AI_FEATURES } from "@/lib/constants";

export function FeaturesSection() {
  return (
    <section id="features" className="section bg-surface">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600">
            <BrainCircuit size={14} />
            AI imkoniyatlari
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Sun&apos;iy intellekt imkoniyatlari
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Har bir bosqichda VIZAR AI sizga aniq, ma&apos;lumotga asoslangan
            yordam beradi.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AI_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="card card-hover relative flex flex-col gap-4 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <feature.icon size={22} strokeWidth={2} />
                </span>
                <span className="font-display text-2xl font-bold text-surface-border">
                  {feature.number}
                </span>
              </div>
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
