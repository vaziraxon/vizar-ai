import type { Metadata } from "next";
import { TOOL_PROMOS } from "@/lib/dashboard/tool-promos";
import { SITE_CONTENT } from "@/lib/i18n/site";
import { localizedHref } from "@/lib/i18n/url-lang";
import { DESTINATIONS, TOOLS } from "@/lib/site/registry";
import type { LangCode } from "@/lib/translations";

/**
 * Public pages that have Russian and English copy, so they also live at
 * /ru… and /en…. The knowledge base picks its language from a cookie and
 * stays out.
 */
export const LOCALIZED_PATHS: string[] = [
  "/",
  "/features",
  "/how-it-works",
  "/pricing",
  "/faq",
  "/roadmap",
  "/trust-center",
  "/destinations",
  ...TOOLS.map((t) => t.href),
  ...TOOL_PROMOS.map((t) => t.publicHref),
  ...DESTINATIONS.map((d) => `/destinations/${d.slug}`),
];

const LOCALIZED = new Set(LOCALIZED_PATHS);
export const isLocalizedPath = (path: string) => LOCALIZED.has(path);

/** The knowledge base: its pages come from the database, so they are matched by prefix. */
const isLibraryPath = (path: string) => path === "/knowledge-base" || path.startsWith("/knowledge-base/");

/** Whether a path also has /ru and /en addresses: the pages above and the knowledge base */
export const hasLocalizedAddress = (path: string) => isLocalizedPath(path) || isLibraryPath(path);

/** Canonical address of a page in one language, with hreflang links to all three */
export function languageAlternates(path: string, lang: LangCode): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localizedHref(path, lang),
    languages: {
      uz: localizedHref(path, "uz"),
      ru: localizedHref(path, "ru"),
      en: localizedHref(path, "en"),
      "x-default": path,
    },
  };
}

const HOME: Record<LangCode, { title: string; description: string }> = {
  uz: {
    title: "VIZAR AI — Viza olishga aqlliroq tayyorlaning",
    description:
      "VIZAR AI — vizaga tayyorlanish platformasi: tayyorgarlik bali, hujjatlar ombori, shaxsiy checklist, suhbat mashqi, viza fotosurati va xatlari, ariza muddati.",
  },
  ru: {
    title: "VIZAR AI — Готовьтесь к визе с умом",
    description:
      "VIZAR AI — платформа подготовки к визе: балл готовности, хранилище документов, личный чек-лист, тренировка интервью, фото и письма для визы, сроки подачи.",
  },
  en: {
    title: "VIZAR AI — Prepare for your visa the smart way",
    description:
      "VIZAR AI — a visa preparation platform: readiness score, document hub, personal checklist, interview practice, visa photo and letters, application timing.",
  },
};

const DESTINATION_SUFFIX: Record<LangCode, string> = { uz: "viza tayyorgarligi", ru: "подготовка к визе", en: "visa preparation" };
const OG_LOCALE: Record<LangCode, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" };

/** Title and description of a localized page in one language */
function pageCopy(path: string, lang: LangCode): { title: string; description: string } {
  const site = SITE_CONTENT[lang];
  switch (path) {
    case "/":
      return HOME[lang];
    case "/features":
      return { title: site.toolsPage.title, description: site.toolsPage.subtitle };
    case "/how-it-works":
      return { title: site.howPage.eyebrow, description: site.howPage.subtitle };
    case "/pricing":
      return { title: site.pricing.eyebrow, description: site.pricing.subtitle };
    case "/faq":
      return { title: site.faq.title, description: site.faq.subtitle };
    case "/roadmap":
      // The page heading already says "VIZAR AI"; the title template adds it too
      return { title: site.footer.roadmap, description: site.roadmapPage.subtitle };
    case "/trust-center":
      return { title: site.trustPage.title, description: site.trustPage.subtitle };
    case "/destinations":
      return { title: site.destinationsPage.title, description: site.destinationsPage.subtitle };
  }
  const tool = TOOLS.find((t) => t.href === path);
  if (tool) {
    const copy = site.tools[tool.id];
    return { title: `${copy.name} — ${copy.tagline}`, description: copy.desc };
  }
  const promo = TOOL_PROMOS.find((p) => p.publicHref === path);
  if (promo) return { title: site[promo.key].title, description: site[promo.key].subtitle };
  const destination = DESTINATIONS.find((d) => `/destinations/${d.slug}` === path);
  if (destination) {
    const copy = site.destinations[destination.slug];
    return { title: `${copy.name} — ${DESTINATION_SUFFIX[lang]}`, description: copy.intro };
  }
  throw new Error(`No localized copy for ${path}`);
}

/**
 * Metadata for a localized page: its own title and description in that
 * language, a canonical address, and hreflang links to the other two.
 */
export function localizedMetadata(path: string, lang: LangCode): Metadata {
  const { title, description } = pageCopy(path, lang);
  const url = localizedHref(path, lang);
  return {
    // The home title already names the brand, so the "· VIZAR AI" template is skipped
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: languageAlternates(path, lang),
    openGraph: {
      type: "website",
      url,
      siteName: "VIZAR AI",
      title,
      description,
      locale: OG_LOCALE[lang],
      // Same picture for every page (app/opengraph-image.tsx)
      images: ["/opengraph-image"],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}

/** Structured data for the home page, in the page's language */
export function homeJsonLd(lang: LangCode) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "VIZAR AI", url: "https://vizarai.com" },
      {
        "@type": "WebApplication",
        name: "VIZAR AI",
        url: lang === "uz" ? "https://vizarai.com" : `https://vizarai.com/${lang}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: lang,
        description: SITE_CONTENT[lang].home.hero.subtitle,
        offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
      },
    ],
  };
}

/** FAQPage structured data, in the page's language */
export function faqJsonLd(lang: LangCode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_CONTENT[lang].faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
