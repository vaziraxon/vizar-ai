import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * VIZAR AI brand artwork (the user's logo, transparent WebP): the full
 * wordmark, a dark-mode variant whose navy "VIZAR" letters are lightened, and
 * the V emblem on its own for tight spots.
 */
const LOGO = { light: "/images/brand/vizar-logo.webp", dark: "/images/brand/vizar-logo-dark.webp", width: 760, height: 248 };
const MARK = "/images/brand/vizar-mark.webp";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative block h-8 w-8 shrink-0", className)}>
      <Image src={MARK} alt="" fill sizes="48px" className="object-contain" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center", className)}>
      {/* lg–xl: the desktop navbar has no spare width there, so the logo steps down */}
      <Image
        src={LOGO.light}
        alt="VIZAR AI"
        width={LOGO.width}
        height={LOGO.height}
        sizes="140px"
        loading="eager"
        className="h-11 w-auto lg:h-9 xl:h-11 dark:hidden"
      />
      <Image
        src={LOGO.dark}
        alt="VIZAR AI"
        width={LOGO.width}
        height={LOGO.height}
        sizes="140px"
        className="hidden h-11 w-auto lg:h-9 xl:h-11 dark:block"
      />
    </span>
  );
}
