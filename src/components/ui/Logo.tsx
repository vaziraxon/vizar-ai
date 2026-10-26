import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-night text-white dark:bg-white dark:text-night",
        className
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5.5 7L12 17.5L16.2 10.4"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18.6" cy="6.6" r="2.1" fill="#6097FA" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-ink-900 dark:text-white">
        VIZAR <span className="text-brand-600 dark:text-brand-400">AI</span>
      </span>
    </span>
  );
}
