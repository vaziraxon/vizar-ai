"use client";

import { motion } from "framer-motion";
import { Plane, Globe2, Bell, Menu as MenuIcon } from "lucide-react";
import { FLOATING_INSIGHTS } from "@/lib/constants";
import { FloatingCard } from "./FloatingCard";

export function PhoneMockup() {
  return (
    <div className="relative mx-auto flex h-[560px] w-full max-w-[520px] items-center justify-center lg:h-[620px]">
      {/* Ambient gradient glow behind everything */}
      <div className="absolute inset-0 -z-10 rounded-full bg-hero-glow blur-2xl" />

      {/* Digital globe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute right-0 top-2 h-64 w-64 rounded-full border border-brand-200/70 sm:h-80 sm:w-80"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(34,211,238,0.18), rgba(46,31,208,0.08) 60%, transparent 75%)",
        }}
      >
        <div className="absolute inset-4 animate-spin-slow rounded-full border border-dashed border-brand-300/60" />
        <div className="absolute inset-10 rounded-full border border-brand-200/50" />
        <Globe2
          className="absolute inset-0 m-auto text-brand-300/70"
          size={120}
          strokeWidth={0.8}
        />
        {/* orbit dot */}
        <motion.span
          className="absolute h-2.5 w-2.5 rounded-full bg-accent-500 shadow-glow-cyan"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ top: "50%", left: "50%", transformOrigin: "-90px -90px" }}
        />
      </motion.div>

      {/* Airplane, arcing in */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: -20, rotate: -8 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -12 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
        className="absolute left-4 top-6 text-brand-600 sm:left-8"
      >
        <Plane size={44} strokeWidth={1.6} className="drop-shadow-sm" />
      </motion.div>

      {/* Passport card */}
      <motion.div
        initial={{ opacity: 0, x: -40, rotate: -6 }}
        animate={{ opacity: 1, x: 0, rotate: -6 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="absolute left-2 top-1/2 h-64 w-44 -translate-y-1/2 rounded-2xl bg-navy-gradient p-5 shadow-float sm:left-6 sm:h-72 sm:w-48"
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-400">
              Passport
            </p>
            <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent-400/40">
              <Globe2 size={30} className="text-accent-400" strokeWidth={1.4} />
            </div>
          </div>
          <div className="h-2 w-12 rounded-full bg-accent-400/60" />
        </div>
      </motion.div>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
        className="relative z-10 h-[440px] w-[230px] rounded-[2.5rem] border-[6px] border-navy-900 bg-navy-900 shadow-float sm:h-[500px] sm:w-[260px]"
      >
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-20 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-navy-900" />

        <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-surface-tint">
          {/* status bar */}
          <div className="flex items-center justify-between bg-navy-gradient px-4 pb-3 pt-6 text-white">
            <MenuIcon size={16} />
            <span className="font-display text-sm font-bold">VIZAR AI</span>
            <Bell size={16} />
          </div>

          {/* readiness score card */}
          <div className="mx-3 mt-3 rounded-xl bg-white p-3.5 shadow-sm">
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-400">
              Viza tayyorligi
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#EEF1FA"
                    strokeWidth="5"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - 0.87)}
                    transform="rotate(-90 28 28)"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2E1FD0" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-xs font-bold text-ink-900">
                  87%
                </span>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-ink-900">
                  Yaxshi daraja!
                </p>
                <p className="text-caption text-ink-400">
                  Ariza topshirishga tayyor
                </p>
              </div>
            </div>
          </div>

          {/* mini list rows */}
          <div className="mx-3 mt-3 space-y-2">
            {["Hujjatlar tekshiruvi", "Suhbat simulyatori", "Moliyaviy holat"].map(
              (row) => (
                <div
                  key={row}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-xs"
                >
                  <span className="text-caption font-medium text-ink-700">
                    {row}
                  </span>
                  <span className="h-4 w-4 rounded-full bg-success/15 text-center text-[10px] font-bold leading-4 text-success">
                    ✓
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating AI cards */}
      <FloatingCard
        icon={FLOATING_INSIGHTS[0]!.icon}
        title={FLOATING_INSIGHTS[0]!.title}
        subtitle={FLOATING_INSIGHTS[0]!.subtitle}
        className="-right-2 top-16 sm:right-0"
        delay={0}
      />
      <FloatingCard
        icon={FLOATING_INSIGHTS[1]!.icon}
        title={FLOATING_INSIGHTS[1]!.title}
        subtitle={FLOATING_INSIGHTS[1]!.subtitle}
        className="-left-4 bottom-24 sm:-left-8"
        delay={0.8}
      />
      <FloatingCard
        icon={FLOATING_INSIGHTS[2]!.icon}
        title={FLOATING_INSIGHTS[2]!.title}
        subtitle={FLOATING_INSIGHTS[2]!.subtitle}
        className="-right-4 bottom-4 sm:right-0"
        delay={1.4}
      />
    </div>
  );
}
