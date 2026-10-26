import type { ReactNode } from "react";
import { EmojiSticker } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

/**
 * Header band for inner public pages: a soft sky wash, a large emoji tile as
 * the page's mascot, a small label, the title and supporting copy.
 */
export function PageHero({
  eyebrow,
  emoji,
  title,
  subtitle,
  children,
  align = "center",
  decor = ["✈️", "🌍", "✨"],
  className,
}: {
  eyebrow?: ReactNode;
  emoji?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  /** Three decorative floating emoji around a centred header (desktop only) */
  decor?: [string, string, string];
  className?: string;
}) {
  const centered = align === "center";
  return (
    <section className={cn("hero-sky-soft grain relative overflow-hidden", className)}>
      <div className={cn("container-page relative pb-14 pt-28 sm:pb-16 sm:pt-36 lg:pt-40", centered && "text-center")}>
        {centered && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
            <EmojiSticker emoji={decor[0]} tilt={-12} className="absolute left-[8%] top-[150px]" />
            <EmojiSticker emoji={decor[1]} size="lg" tilt={9} delay={1100} className="absolute right-[7%] top-[130px]" />
            <EmojiSticker emoji={decor[2]} size="sm" tilt={-6} delay={2200} className="absolute bottom-10 right-[11%]" />
          </div>
        )}
        <div className={cn("animate-fade-up", centered ? "mx-auto max-w-2xl" : "max-w-3xl")}>
          {emoji && (
            <span
              aria-hidden="true"
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-[26px] bg-surface text-[40px] leading-none shadow-float ring-1 ring-surface",
                centered && "mx-auto"
              )}
            >
              {emoji}
            </span>
          )}
          {eyebrow && (
            <p className={cn("text-body-sm font-semibold text-brand-700", emoji ? "mt-6" : "")}>{eyebrow}</p>
          )}
          <h1 className="mt-3 font-display text-display-xl font-extrabold tracking-[-0.04em] text-ink-950">{title}</h1>
          {subtitle && <p className={cn("mt-4 max-w-2xl text-body-lg text-ink-600", centered && "mx-auto")}>{subtitle}</p>}
        </div>
        {children && (
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
