import type { MetadataRoute } from "next";
import { URL_LANGS, localizedHref } from "@/lib/i18n/url-lang";
import { LOCALIZED_PATHS } from "@/lib/site/page-meta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vizarai.com";

const absolute = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * The public pages for search engines, each in all three languages with links
 * to the other two. The account, admin and API routes — the library included,
 * which lives in the dashboard — are left out (see robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALIZED_PATHS.flatMap((path) => {
    const entry = {
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : 0.7,
    };
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
