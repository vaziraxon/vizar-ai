import { cn } from "@/lib/utils";

/**
 * VIZAR mark — a deep-navy tile with a V whose right stroke takes off as a
 * two-tone violet paper plane.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#101122] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] dark:bg-white dark:text-[#101122]",
        className
      )}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* The V — its right arm climbs toward the plane */}
        <path d="M4.6 6.2L10.9 18.2L14.7 10.9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Paper plane at the tip of the stroke: light upper wing, deep lower wing */}
        <path d="M20.6 3.4L12.9 7.9L15.9 9.2Z" fill="#C4B5FD" />
        <path d="M20.6 3.4L15.9 9.2L17.2 12.4Z" fill="#7138EC" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-ink-900 dark:text-white">
        VIZAR{" "}
        <span className="bg-gradient-to-r from-[#7138EC] to-violet-500 bg-clip-text text-transparent dark:from-violet-300 dark:to-[#E9DFFF]">
          AI
        </span>
      </span>
    </span>
  );
}
