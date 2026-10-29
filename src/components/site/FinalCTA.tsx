"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmojiSticker } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

/**
 * Closing call-to-action shared by every public page — blue sky panel with
 * emoji stickers. `tone="lime"` (landing page) swaps in the violet→lime wash
 * with dark text and a charcoal button.
 */
export function FinalCTA({
  title,
  subtitle,
  secondaryHref = "/pricing",
  secondaryLabel,
  tone = "blue",
}: {
  title?: string;
  subtitle?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tone?: "blue" | "lime";
}) {
  const site = useSite();
  const cta = site.home.cta;
  const lime = tone === "lime";

  return (
    <section aria-labelledby="cta-title" className="pb-16 sm:pb-24">
      <div className="container-page">
        <div
          data-reveal
          className={cn(
            "grain relative overflow-hidden rounded-[32px] px-6 py-14 text-center shadow-float sm:px-12 sm:py-20",
            lime ? "lime-wash" : "bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600"
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: lime
                ? "radial-gradient(45% 60% at 15% 0%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)"
                : "radial-gradient(45% 60% at 15% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%), radial-gradient(40% 60% at 90% 100%, rgba(196,181,253,0.45) 0%, rgba(196,181,253,0) 70%)",
            }}
          />

          {/* Decorative stickers around the copy */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
            <EmojiSticker emoji="✈️" size="lg" tilt={-10} className="absolute left-[6%] top-10" />
            <EmojiSticker emoji="🛂" tilt={8} delay={800} className="absolute bottom-12 left-[12%]" />
            <EmojiSticker emoji="🌍" size="lg" tilt={10} delay={1600} className="absolute right-[6%] top-12" />
            <EmojiSticker emoji="🎯" size="sm" tilt={-6} delay={2400} className="absolute bottom-14 right-[13%]" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <p aria-hidden="true" className="mb-6 text-[30px] leading-none md:hidden">
              ✈️ 🛂 🌍
            </p>
            <h2
              id="cta-title"
              className={cn(
                "font-display text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.04em]",
                lime ? "text-ink-950" : "text-white"
              )}
            >
              {title ?? cta.title}
            </h2>
            <p className={cn("mx-auto mt-5 max-w-xl text-body-lg", lime ? "text-ink-700" : "text-white/80")}>{subtitle ?? cta.subtitle}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              {lime ? (
                <Link
                  href="/register"
                  className="btn-charcoal btn-sheen group h-14 justify-between gap-4 pl-7 pr-2 text-body hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(113,56,236,0.6)] sm:justify-center"
                >
                  {cta.primary}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-300 text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-night dark:text-gold-300">
                    <ArrowUpRight size={18} strokeWidth={2.4} className="transition-transform duration-200 group-hover:rotate-45" />
                  </span>
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="btn group h-14 justify-between gap-4 bg-white pl-7 pr-2 text-body text-brand-deep shadow-float hover:bg-[#eff5ff] sm:justify-center"
                >
                  {cta.primary}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-200 group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.4} />
                  </span>
                </Link>
              )}
              <Link
                href={secondaryHref}
                className={cn(
                  "btn h-14 border px-7 text-body",
                  lime
                    ? "border-white/80 bg-surface/60 text-ink-900 backdrop-blur hover:bg-surface dark:border-white/10"
                    : "border-white/35 text-white hover:bg-white/10"
                )}
              >
                {secondaryLabel ?? cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
