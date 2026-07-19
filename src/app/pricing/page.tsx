"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PRICING_PLANS } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [modalPlan, setModalPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-surface-tint dark:bg-navy-950">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-ink-700 hover:text-ink-900 dark:text-white/70 dark:hover:text-white"
        >
          <ArrowLeft size={15} /> Bosh sahifaga qaytish
        </Link>
      </div>

      <div className="container-page pb-20 pt-6 text-center">
        <h1 className="font-display text-display-lg text-ink-900 dark:text-white">
          Sizga mos rejani tanlang
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-body-lg text-ink-600 dark:text-white/60">
          Barcha rejalar demo rejimda — haqiqiy to&apos;lov ulanmagan.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "card flex flex-col p-6 text-left dark:bg-navy-800",
                plan.highlighted
                  ? "border-2 border-brand-500"
                  : "dark:border-white/10"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-pill bg-brand-50 px-3 py-1 text-caption font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  Eng mashhur
                </span>
              )}
              <h3 className="font-display text-display-sm text-ink-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="mt-3">
                <span className="font-display text-2xl font-bold text-ink-900 dark:text-white">
                  {plan.price}
                </span>{" "}
                <span className="text-caption text-ink-400 dark:text-white/40">
                  {plan.period}
                </span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-body-sm text-ink-600 dark:text-white/60"
                  >
                    <Check size={15} className="mt-0.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="md"
                variant={plan.highlighted ? "primary" : "secondary"}
                className="mt-6 w-full"
                onClick={() => setModalPlan(plan.name)}
              >
                Rejani tanlash
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={modalPlan !== null}
        onClose={() => setModalPlan(null)}
        title={`${modalPlan} rejasi`}
      >
        <p className="text-body-sm text-ink-600 dark:text-white/60">
          Bu — demo platforma, haqiqiy to&apos;lov tizimi ulanmagan. Ishlab
          chiqish yakunlanganda ushbu oyna orqali haqiqiy to&apos;lov
          jarayoni ishga tushiriladi.
        </p>
        <Button size="md" className="mt-5 w-full" onClick={() => setModalPlan(null)}>
          Tushunarli
        </Button>
      </Modal>
    </div>
  );
}
