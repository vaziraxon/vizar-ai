import type { MetadataRoute } from "next";
import { URL_LANGS, localizedHref } from "@/lib/i18n/url-lang";
import { LOCALIZED_PATHS, isLocalizedPath } from "@/lib/site/page-meta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vizarai.com";

/** Chapters of the VIZAR AI book whose pages are public (the full text needs a plan) */
const BOOK_CHAPTERS = ["kirish", "bob-1", "bob-2", "bob-3", "bob-4", "bob-5", "bob-6", "bob-7", "bob-8", "bob-9", "xulosa"];

const absolute = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * The public pages for search engines; the account, admin and API routes are
 * left out (see robots.ts). Translated pages are listed in all three languages,
 * each with links to the other two.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...LOCALIZED_PATHS,
    "/knowledge-base",
    ...BOOK_CHAPTERS.map((slug) => `/knowledge-base/book/${slug}`),
  ];
  return paths.flatMap((path) => {
    const entry = {
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.startsWith("/knowledge-base/book/") ? 0.5 : 0.7,
    };
    if (!isLocalizedPath(path)) return [{ url: absolute(path), ...entry }];
    const languages = {
      uz: absolute(path),
      ...Object.fromEntries(URL_LANGS.map((lang) => [lang, absolute(localizedHref(path, lang))])),
    };
    return (["uz", ...URL_LANGS] as const).map((lang) => ({
      url: absolute(localizedHref(path, lang)),
      ...entry,
      alternates: { languages },
    }));
  });
}
