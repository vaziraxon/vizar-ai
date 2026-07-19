"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/hero/PhoneMockup";
import { HERO_STATS } from "@/lib/constants";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-hero-glow"
    >
      <div className="container-page grid items-center gap-14 py-14 lg:grid-cols-2 lg:gap-10 lg:py-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600"
          >
            Sun&apos;iy intellekt asosidagi platforma
          </motion.span>

          <motion.h1
            variants={item}
            className="font-display text-display-xl text-ink-900"
          >
            Sun&apos;iy intellekt yordamida{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              viza olish
            </span>{" "}
            jarayonini raqamlashtiruvchi{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              innovatsion
            </span>{" "}
            platforma
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-body-lg text-ink-600"
          >
            Hujjatlaringizni yuklang, sun&apos;iy intellekt bir necha daqiqada
            tahlil qilib, viza olish ehtimolingizni baholaydi va har bir
            bosqichda aniq yo&apos;l-yo&apos;riq beradi.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href="/register">
              <Button size="lg">
                Bepul tahlilni boshlash
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg">
                <PlayCircle size={18} />
                Demo ko&apos;rish
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-surface-border pt-8"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-display-sm text-ink-900">
                  {stat.value}
                </p>
                <p className="text-caption text-ink-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <PhoneMockup />
      </div>
    </section>
  );
}
