import type { Metadata } from "next";
import { LandingFonts } from "@/components/site/LandingFonts";
import { HomePage } from "@/components/site/pages/HomePage";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import { SITE_CONTENT } from "@/lib/i18n/site";

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
      <LandingFonts />
      <HomePage testimonials={testimonials} />
      <script
        type="application/ld+json"
        // Static, build-time content only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
    </>
  );
}
