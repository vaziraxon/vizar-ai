"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { ONBOARDING_STEPS, ONBOARDING_GOALS, COUNTRY_OPTIONS, VISA_TYPE_OPTIONS } from "@/data/mockData";

const STORAGE_KEY = "vizar-ai-onboarding-done";
const PROGRESS_KEY = "vizar-ai-onboarding-progress";

export function OnboardingWizard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [visaType, setVisaType] = useState("");
  const [goal, setGoal] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (!done) setOpen(true);
  }, []);

  function persistProgress() {
    window.localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ country, visaType, goal, name })
    );
  }

  function finish() {
    persistProgress();
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    router.push("/assessment");
  }

  function skip() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  const total = ONBOARDING_STEPS.length;
  const current = ONBOARDING_STEPS[step]!;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50"
          />
          <div className="fixed inset-0 z-[91] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-surface-border bg-white p-6 shadow-float dark:border-white/10 dark:bg-navy-900 sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {ONBOARDING_STEPS.map((s, i) => (
                    <span
                      key={s.id}
                      className={`h-1.5 w-8 rounded-pill ${
                        i <= step ? "bg-brand-gradient" : "bg-surface-muted dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={skip}
                  aria-label="O'tkazib yuborish"
                  className="text-ink-400 hover:text-ink-700 dark:text-white/40 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-white">
                    <Sparkles size={19} />
                  </span>
                  <h2 className="mt-4 font-display text-display-sm text-ink-900 dark:text-white">
                    {current.title}
                  </h2>
                  <p className="mt-1 text-body-sm text-ink-600 dark:text-white/60">
                    {current.description}
                  </p>

                  <div className="mt-5">
                    {current.id === "country" && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {COUNTRY_OPTIONS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCountry(c)}
                            className={`rounded-lg border px-3 py-2 text-caption font-medium transition-colors ${
                              country === c
                                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                                : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}

                    {current.id === "visa-type" && (
                      <div className="grid grid-cols-2 gap-2">
                        {VISA_TYPE_OPTIONS.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setVisaType(v)}
                            className={`rounded-lg border px-3 py-2 text-caption font-medium transition-colors ${
                              visaType === v
                                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                                : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}

                    {current.id === "goal" && (
                      <div className="space-y-2">
                        {ONBOARDING_GOALS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGoal(g)}
                            className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-body-sm font-medium transition-colors ${
                              goal === g
                                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                                : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                            }`}
                          >
                            {g}
                            {goal === g && <Check size={15} />}
                          </button>
                        ))}
                      </div>
                    )}

                    {current.id === "profile" && (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ismingiz"
                        className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-800 dark:text-white"
                      />
                    )}

                    {(current.id === "welcome" || current.id === "start") && (
                      <div className="rounded-xl bg-surface-tint p-4 text-body-sm text-ink-600 dark:bg-white/5 dark:text-white/60">
                        {current.id === "welcome"
                          ? "Bir necha bosqichda profilingizni sozlaymiz — bu atigi 1 daqiqa vaqt oladi."
                          : "Barchasi tayyor! Endi birinchi viza tahlilingizni boshlashingiz mumkin."}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 flex items-center justify-between border-t border-surface-border pt-5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(s - 1, 0))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-body-sm font-semibold text-ink-700 disabled:opacity-30 dark:text-white/70"
                >
                  <ArrowLeft size={15} /> Orqaga
                </button>
                {step < total - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      persistProgress();
                      setStep((s) => Math.min(s + 1, total - 1));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gradient px-5 py-2 text-body-sm font-semibold text-white shadow-glow"
                  >
                    Keyingi <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finish}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gradient px-5 py-2 text-body-sm font-semibold text-white shadow-glow"
                  >
                    Tahlilni boshlash <Sparkles size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
