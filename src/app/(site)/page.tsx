import type { Metadata } from "next";
import { HomePage } from "@/components/site/pages/HomePage";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import { SITE_CONTENT } from "@/lib/i18n/site";
// Landing-only display serif (self-hosted): Bodoni Moda, with upright
// Playfair Display for Cyrillic headings, which Bodoni lacks
import "./landing-fonts.css";

/** Latin headline faces (Bodoni upright + italic, Playfair italic for the VIZAR wordmark). */
const PRELOAD_FONTS = [
  "/fonts/bodoni-moda-normal-400-900-latin.fe6c560d.woff2",
  "/fonts/bodoni-moda-italic-400-900-latin.9d952bcb.woff2",
  "/fonts/playfair-display-italic-500-latin.2ca66e76.woff2",
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Static page, refreshed every 5 minutes for new reviews (the admin's
// save/publish also revalidates it at once).
export const revalidate = 300;

// Structured data is rendered from the Uzbek copy (the default locale).
function jsonLd() {
  const uz = SITE_CONTENT.uz;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "VIZAR AI", url: "https://vizarai.com" },
      {
        "@type": "WebApplication",
        name: "VIZAR AI",
        url: "https://vizarai.com",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: ["uz", "ru", "en"],
        description: uz.home.hero.subtitle,
        offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
      },
    ],
  };
}

export default async function Home() {
  const testimonials = await getPublishedTestimonials();
  return (
    <>
      {PRELOAD_FONTS.map((href) => (
        <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
      ))}
      <HomePage testimonials={testimonials} />
      <script
        type="application/ld+json"
        // Static, build-time content only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
    </>
  );
}
