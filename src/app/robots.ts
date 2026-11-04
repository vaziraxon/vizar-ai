import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vizarai.com";

/** Public pages are open to crawlers; the signed-in app, admin areas and the API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/agency",
        "/profile",
        "/settings",
        "/reports",
        "/notifications",
        "/recommendations",
        "/assessment",
        "/auth/",
        "/sinov",
        "/investor-analytics",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
