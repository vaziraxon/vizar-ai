"use client";

import { motion } from "framer-motion";
import { Globe, Clock } from "lucide-react";
import { COUNTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VisaDifficulty } from "@/types";

const difficultyStyles: Record<VisaDifficulty, string> = {
  Oson: "bg-success/10 text-success",
  "O'rtacha": "bg-warning/10 text-warning",
  Murakkab: "bg-red-500/10 text-red-600",
};

export function CountriesSection() {
  return (
    <section id="countries" className="section bg-surface-tint">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-white px-4 py-1.5 text-caption font-semibold text-brand-600">
            <Globe size={14} />
            Yo&apos;nalishlar
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Mashhur davlatlar bo&apos;yicha ma&apos;lumot
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Har bir davlat uchun taxminiy ko&apos;rsatkichlar — aniq shartlar
            konsullikning rasmiy talablariga qarab farq qilishi mumkin.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COUNTRIES.map((country, i) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="card card-hover flex flex-col gap-3 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">
                  {country.flag}
                </span>
                <span
                  className={cn(
                    "rounded-pill px-2.5 py-1 text-caption font-semibold",
                    difficultyStyles[country.difficulty]
                  )}
                >
                  {country.difficulty}
                </span>
              </div>
              <h3 className="font-display text-display-sm text-ink-900">
                {country.name}
              </h3>
              <p className="flex-1 text-body-sm text-ink-600">
                {country.description}
              </p>
              <div className="flex items-center gap-1.5 border-t border-surface-border pt-3 text-caption font-medium text-ink-400">
                <Clock size={13} />
                O&apos;rtacha: {country.processingTime}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
