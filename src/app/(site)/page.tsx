import type { Metadata } from "next";
import { HomePage } from "@/components/site/pages/HomePage";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import { homeJsonLd, localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/", "uz");

// Static page, refreshed every 5 minutes for new reviews (the admin's
// save/publish also revalidates it at once).
export const revalidate = 300;

export default async function Home() {
  const testimonials = await getPublishedTestimonials();
  return (
    <>
      <HomePage testimonials={testimonials} />
      <script
        type="application/ld+json"
        // Static, build-time content only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd("uz")) }}
      />
    </>
  );
}
