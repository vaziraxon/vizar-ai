"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { localizedHref, splitLangPath } from "@/lib/i18n/url-lang";
import { isLocalizedPath } from "@/lib/site/page-meta";

/** The language in the address: "ru" on /ru/…, "en" on /en/…, otherwise Uzbek */
export function useUrlLang() {
  return splitLangPath(usePathname() ?? "/").lang;
}

/** The current page's path without its /ru or /en prefix, for matching nav items */
export function useSitePath() {
  return splitLangPath(usePathname() ?? "/").path;
}

/**
 * next/link that keeps a /ru or /en page's links in that language:
 * "/pricing" becomes "/ru/pricing" there. Pages without a translated
 * address (the dashboard, sign-up, the knowledge base) keep their href.
 */
export const LocalLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(function LocalLink({ href, ...rest }, ref) {
  const lang = useUrlLang();
  let target = href;
  if (lang !== "uz" && typeof href === "string") {
    const [, path = "", suffix = ""] = /^([^?#]*)(.*)$/.exec(href) ?? [];
    if (isLocalizedPath(path)) target = localizedHref(path, lang) + suffix;
  }
  return <Link ref={ref} href={target} {...rest} />;
});
