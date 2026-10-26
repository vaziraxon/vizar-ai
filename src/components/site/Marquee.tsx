import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Endless horizontal row. The content is rendered twice and the track slides
 * by exactly half its width, so the loop is seamless. Each half carries its
 * own trailing gap (pr-3) instead of a container gap — that keeps -50% exact.
 * Decorative: callers provide an accessible copy of the content elsewhere.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 50,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] motion-reduce:overflow-x-auto",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex shrink-0 gap-3 pr-3">{children}</div>
        <div className="flex shrink-0 gap-3 pr-3">{children}</div>
      </div>
    </div>
  );
}
