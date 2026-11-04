import type { MetadataRoute } from "next";
import { TOOL_PROMOS } from "@/lib/dashboard/tool-promos";
import { DESTINATIONS, TOOLS } from "@/lib/site/registry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vizarai.com";

/** Chapters of the VIZAR AI book whose pages are public (the full text needs a plan) */
const BOOK_CHAPTERS = ["kirish", "bob-1", "bob-2", "bob-3", "bob-4", "bob-5", "bob-6", "bob-7", "bob-8", "bob-9", "xulosa"];

/** The public pages for search engines; the account, admin and API routes are left out (see robots.ts). */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/features",
    "/how-it-works",
    "/pricing",
    "/faq",
    "/roadmap",
    "/trust-center",
    "/destinations",
    "/knowledge-base",
    ...TOOLS.map((t) => t.href),
    ...TOOL_PROMOS.map((t) => t.publicHref),
    ...DESTINATIONS.map((d) => `/destinations/${d.slug}`),
    ...BOOK_CHAPTERS.map((slug) => `/knowledge-base/book/${slug}`),
  ];
  return [...new Set(paths)].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/knowledge-base/book/") ? 0.5 : 0.7,
  }));
}
