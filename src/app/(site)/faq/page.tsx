import type { Metadata } from "next";
import { FaqPage } from "@/components/site/pages/InnerPages";
import { faqJsonLd, localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/faq", "uz");

export default function Page() {
  return (
    <>
      <FaqPage />
      <script
        type="application/ld+json"
        // Static, build-time content only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd("uz")) }}
      />
    </>
  );
}
