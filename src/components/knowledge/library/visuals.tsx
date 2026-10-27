import Image from "next/image";
import type { Cover } from "@/lib/knowledge/visuals";
import { cn } from "@/lib/utils";

const FLAG_SIZES = {
  xs: { box: "h-3.5 w-[21px] rounded-[3px]", w: 21, h: 14 },
  sm: { box: "h-5 w-[30px] rounded-[4px]", w: 30, h: 20 },
  md: { box: "h-7 w-[42px] rounded-[6px]", w: 42, h: 28 },
  lg: { box: "h-12 w-[72px] rounded-[10px]", w: 72, h: 48 },
  xl: { box: "h-[72px] w-[108px] rounded-2xl", w: 108, h: 72 },
};

/**
 * A real country flag (3:2 SVG from /flags/xx.svg), crisp on every OS —
 * emoji flags render as letters on Windows. Decorative: the country name is
 * always written next to it.
 */
export function CountryFlag({ code, size = "md", className }: { code: string; size?: keyof typeof FLAG_SIZES; className?: string }) {
  const s = FLAG_SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 overflow-hidden bg-surface-muted shadow-[0_1px_2px_rgba(16,24,40,0.14)] ring-1 ring-black/10 dark:ring-white/15",
        s.box,
        className
      )}
    >
      <Image src={`/flags/${code.toLowerCase()}.svg`} alt="" width={s.w} height={s.h} unoptimized className="h-full w-full object-cover" />
    </span>
  );
}

/**
 * Card / header artwork: a real travel photo, or — for the thematic
 * chapters — a soft gradient with three large emoji.
 */
export function CoverArt({
  cover,
  alt,
  sizes,
  priority,
  className,
  children,
}: {
  cover: Cover;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-surface-muted", className)}>
      {cover.photo ? (
        <>
          <Image
            src={cover.photo}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/55 via-night-950/5 to-transparent" />
        </>
      ) : (
        <span aria-hidden="true" className="absolute inset-0">
          <span className={cn("absolute inset-0 bg-gradient-to-br dark:opacity-30", cover.gradient)} />
          {/* Dotted paper texture + a soft light behind the main emoji */}
          <span className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1.5px)] [background-size:16px_16px] dark:opacity-10" />
          <span className="absolute left-1/2 top-1/2 h-[58%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-xl dark:bg-white/10" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[68px] leading-none drop-shadow-md transition-transform duration-500 ease-premium group-hover:scale-110">
            {cover.emojis[0]}
          </span>
          <span className="absolute left-[11%] top-[16%] -rotate-12 text-[38px] leading-none drop-shadow transition-transform duration-500 ease-premium group-hover:-rotate-3">
            {cover.emojis[1]}
          </span>
          <span className="absolute bottom-[14%] right-[12%] rotate-12 text-[42px] leading-none drop-shadow transition-transform duration-500 ease-premium group-hover:rotate-3">
            {cover.emojis[2]}
          </span>
        </span>
      )}
      {children}
    </span>
  );
}
