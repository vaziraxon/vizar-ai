"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend yet — this is a front-end-only demo submission.
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section bg-surface">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600">
            <Send size={14} />
            Aloqa
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Biz bilan bog&apos;laning
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Savollaringiz bo&apos;lsa, quyidagi kanallar orqali yoki forma
            yordamida murojaat qiling.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          {/* Contact info */}
          <div className="space-y-4">
            {CONTACT_INFO.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="card flex items-center gap-4 p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <item.icon size={19} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-ink-400">
                    {item.label}
                  </p>
                  <p className="text-body-sm font-medium text-ink-900">
                    {item.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="card p-6 sm:p-8"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 size={24} />
                </span>
                <p className="text-body font-semibold text-ink-900">
                  Xabaringiz qabul qilindi
                </p>
                <p className="max-w-xs text-body-sm text-ink-600">
                  Bu — demo forma, hozircha xabarlar serverga yuborilmaydi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-body-sm font-medium text-ink-700"
                    >
                      Ismingiz
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Ism Familiya"
                      className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-body-sm font-medium text-ink-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="email@misol.uz"
                      className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-body-sm font-medium text-ink-700"
                  >
                    Xabar
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Savolingizni shu yerga yozing..."
                    className="w-full resize-none rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
                  />
                </div>
                <Button type="submit" size="md" className="w-full sm:w-auto">
                  Xabarni yuborish
                  <Send size={16} />
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
