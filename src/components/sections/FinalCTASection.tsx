"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-navy-gradient py-20 md:py-28">
      <div
        className="absolute inset-0 -z-0 opacity-60"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(46,31,208,0.35) 0%, rgba(5,15,44,0) 70%)",
        }}
      />
      <div className="container-page relative text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-pill border border-accent-400/30 bg-white/5 px-4 py-1.5 text-caption font-semibold text-accent-400"
        >
          <Sparkles size={14} />
          Boshlash uchun hech qanday to&apos;siq yo&apos;q
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl font-display text-display-lg text-white"
        >
          Bugunoq viza tayyorgarligingizni boshlang
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-xl text-body-lg text-white/70"
        >
          Hujjatlaringizni yuklang, sun&apos;iy intellekt tahlilidan
          o&apos;ting va o&apos;z Visa Readiness Score&apos;ingizni bilib
          oling.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/register">
            <Button size="lg">
              Bepul boshlash
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/20 bg-white/5 px-8 py-4 text-body font-semibold text-white transition-colors hover:bg-white/10"
          >
            <PlayCircle size={18} />
            Demo ko&apos;rish
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
