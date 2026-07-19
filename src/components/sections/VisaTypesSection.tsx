"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileStack } from "lucide-react";
import { VISA_TYPES } from "@/lib/constants";

export function VisaTypesSection() {
  return (
    <section id="visa-types" className="section bg-surface">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600">
            <FileStack size={14} />
            Viza turlari
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Qo&apos;llab-quvvatlanadigan viza turlari
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Maqsadingizga mos viza turini tanlang — VIZAR AI har biri uchun
            alohida tayyorgarlik yo&apos;l-yo&apos;riqni taklif qiladi.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VISA_TYPES.map((visa, i) => (
            <motion.div
              key={visa.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="card card-hover flex flex-col gap-4 p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <visa.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="font-display text-display-sm text-ink-900">
                {visa.title}
              </h3>
              <p className="flex-1 text-body-sm text-ink-600">
                {visa.description}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 self-start text-body-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Batafsil
                <ArrowRight size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
