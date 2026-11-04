import type { LangCode } from "@/lib/translations";

/**
 * Languages with their own address prefix on the public site (/ru/…, /en/…),
 * so search engines can index each language. Uzbek is the default and keeps
 * the plain paths.
 */
export const URL_LANGS = ["ru", "en"] as const;
export type UrlLang = (typeof URL_LANGS)[number];

export const isUrlLang = (value: string): value is UrlLang => (URL_LANGS as readonly string[]).includes(value);

/** The home page in every language, for revalidating after a review changes */
export const HOME_PATHS = ["/", ...URL_LANGS.map((lang) => `/${lang}`)];

/** A page's address in a language: /features → /ru/features; Uzbek keeps the plain path. */
export function localizedHref(path: string, lang: LangCode): string {
  if (lang === "uz") return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Splits /ru/features into "ru" and "/features"; a plain path is Uzbek. */
export function splitLangPath(pathname: string): { lang: LangCode; path: string } {
  const match = /^\/(ru|en)(\/.*)?$/.exec(pathname);
  return match ? { lang: match[1] as UrlLang, path: match[2] || "/" } : { lang: "uz", path: pathname };
}
