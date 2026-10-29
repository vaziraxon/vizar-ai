import type { DestinationSlug, ToolId } from "@/lib/site/registry";

/** A customer review published with the customer's consent — name, photo and text exactly as approved. */
export interface Testimonial {
  id: string;
  name: string;
  /** Profile photo, only with consent */
  avatar?: string;
  destination: DestinationSlug;
  tool: ToolId;
  /** Only when the customer actually gave a rating */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** The customer's own words, unedited */
  quote: string;
  /** Language the quote is written in */
  locale?: "uz" | "ru" | "en";
  /** Travel photo the customer chose to share */
  photo?: string;
}

/**
 * Labelled sample cards appear only in test mode — local development and
 * Vercel preview deployments — and only while there are no real reviews.
 * Real ones come from the `testimonials` table (managed in /admin/testimonials).
 */
export const SAMPLE_TESTIMONIALS_ENABLED =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

/** Visuals for the sample cards; their copy lives in site i18n (home.testimonials.samples). */
export const SAMPLE_CARDS = [
  { emoji: "🎓", destination: "canada", tool: "readiness", photo: "/images/destinations/ca.webp" },
  { emoji: "💼", destination: "usa", tool: "tracker", photo: "/images/destinations/us.webp" },
  { emoji: "🧳", destination: "schengen", tool: "experts", photo: "/images/destinations/schengen.webp" },
] as const satisfies readonly { emoji: string; destination: DestinationSlug; tool: ToolId; photo: string }[];
