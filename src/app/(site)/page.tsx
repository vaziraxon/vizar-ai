import type { Metadata } from "next";
import { HomePage } from "@/components/site/pages/HomePage";
import { SITE_CONTENT } from "@/lib/i18n/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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

export default function Home() {
  return (
    <>
      <HomePage />
      <script
        type="application/ld+json"
        // Static, build-time content only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
    </>
  );
}
