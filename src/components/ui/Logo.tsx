import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 2L20 5.5V11C20 16 16.5 19.5 12 21C7.5 19.5 4 16 4 11V5.5L12 2Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 12L11 14.5L16 9"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-ink-900">
          VIZAR <span className="text-brand-600">AI</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">
          AI Visa Assistant
        </span>
      </span>
    </div>
  );
}
