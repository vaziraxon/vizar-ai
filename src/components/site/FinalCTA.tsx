"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmojiSticker } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";

/** Closing call-to-action shared by every public page — blue sky panel with emoji stickers. */
export function FinalCTA({
  title,
  subtitle,
  secondaryHref = "/pricing",
  secondaryLabel,
}: {
  title?: string;
  subtitle?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const site = useSite();
  const cta = site.home.cta;

  return (
    <section aria-labelledby="cta-title" className="pb-16 sm:pb-24">
      <div className="container-page">
        <div
          data-reveal
          className="grain relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 px-6 py-14 text-center shadow-float sm:px-12 sm:py-20"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(45% 60% at 15% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%), radial-gradient(40% 60% at 90% 100%, rgba(196,181,253,0.45) 0%, rgba(196,181,253,0) 70%)",
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
            <h2 id="cta-title" className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
              {title ?? cta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-body-lg text-white/80">{subtitle ?? cta.subtitle}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="btn group h-14 justify-between gap-4 bg-white pl-7 pr-2 text-body text-brand-deep shadow-float hover:bg-[#eff5ff] sm:justify-center"
              >
                {cta.primary}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-200 group-hover:rotate-45">
                  <ArrowUpRight size={18} strokeWidth={2.4} />
                </span>
              </Link>
              <Link href={secondaryHref} className="btn h-14 border border-white/35 px-7 text-body text-white hover:bg-white/10">
                {secondaryLabel ?? cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
