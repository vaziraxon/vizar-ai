import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/site/pages/HomePage";
import {
  DestinationPage,
  DestinationsIndexPage,
  FaqPage,
  FeaturesPage,
  HowItWorksPage,
  PricingPage,
} from "@/components/site/pages/InnerPages";
import { ToolPage } from "@/components/site/ToolPage";
import { ToolPromo } from "@/components/site/ToolPromo";
import { TOOL_PROMOS } from "@/lib/dashboard/tool-promos";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import { URL_LANGS, isUrlLang, type UrlLang } from "@/lib/i18n/url-lang";
import { LOCALIZED_PATHS, faqJsonLd, homeJsonLd, isLocalizedPath, localizedMetadata } from "@/lib/site/page-meta";
import { DESTINATIONS, TOOLS } from "@/lib/site/registry";

type Props = { params: { lang: string; path?: string[] } };

// Only the translated pages exist under /ru and /en; anything else is a 404
export const dynamicParams = false;

// Same refresh as the Uzbek home page, for new reviews
export const revalidate = 300;

export function generateStaticParams() {
  return URL_LANGS.flatMap((lang) =>
    LOCALIZED_PATHS.map((path) => ({ lang, path: path === "/" ? [] : path.slice(1).split("/") }))
  );
}

function resolve(params: Props["params"]): { lang: UrlLang; path: string } | null {
  const path = `/${(params.path ?? []).join("/")}`;
  return isUrlLang(params.lang) && isLocalizedPath(path) ? { lang: params.lang, path } : null;
}

export function generateMetadata({ params }: Props): Metadata {
  const page = resolve(params);
  return page ? localizedMetadata(page.path, page.lang) : {};
}

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Static, build-time content only — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** The same page components as the Uzbek addresses; the layout sets the language. */
export default async function Page({ params }: Props) {
  const page = resolve(params);
  if (!page) notFound();
  const { lang, path } = page;

  switch (path) {
    case "/":
      return (
        <>
          <HomePage testimonials={await getPublishedTestimonials()} />
          <JsonLd data={homeJsonLd(lang)} />
        </>
      );
    case "/features":
      return <FeaturesPage />;
    case "/how-it-works":
      return <HowItWorksPage />;
    case "/pricing":
      return <PricingPage />;
    case "/faq":
      return (
        <>
          <FaqPage />
          <JsonLd data={faqJsonLd(lang)} />
        </>
      );
    case "/destinations":
      return <DestinationsIndexPage />;
  }
  const tool = TOOLS.find((t) => t.href === path);
  if (tool) return <ToolPage id={tool.id} />;
  const promo = TOOL_PROMOS.find((p) => p.publicHref === path);
  if (promo) return <ToolPromo tool={promo.key} />;
  const destination = DESTINATIONS.find((d) => `/destinations/${d.slug}` === path);
  if (destination) return <DestinationPage slug={destination.slug} />;
  notFound();
}
