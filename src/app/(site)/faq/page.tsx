import type { Metadata } from "next";
import { FaqPage } from "@/components/site/pages/InnerPages";
import { SITE_CONTENT } from "@/lib/i18n/site";

export const metadata: Metadata = {
  title: SITE_CONTENT.uz.faq.title,
  description: SITE_CONTENT.uz.faq.subtitle,
  alternates: { canonical: "/faq" },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_CONTENT.uz.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function Page() {
  return (
    <>
      <FaqPage />
      <script
        type="application/ld+json"
        // Static, build-time content only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
    </>
  );
}
