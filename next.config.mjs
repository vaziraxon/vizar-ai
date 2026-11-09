// Customer-review photos live in the public "testimonials" bucket of this
// project's Supabase Storage (see supabase/testimonials.sql).
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

// Content Security Policy, in report-only mode for now: browsers report what it
// would block (to /api/csp-report, which logs "[csp] …" in the Vercel runtime
// logs) but block nothing, so we can confirm it fits every page before
// enforcing it. Inline scripts stay allowed — the theme and
// <html lang> snippets in app/layout.tsx and Next's own bootstrap need them.
// vercel.live is the Vercel toolbar on preview deployments.
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "https://*.supabase.co";
const supabaseSocket = supabaseHost ? `wss://${supabaseHost}` : "wss://*.supabase.co";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin} https://vercel.live https://vercel.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseSocket} https://vercel.live`,
  "worker-src 'self' blob:",
  "frame-src 'self' https://vercel.live",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // report-uri for Firefox and Safari; report-to for Chrome (Reporting-Endpoints below)
  "report-uri /api/csp-report",
  "report-to csp",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHost
      ? [
          { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/testimonials/**" },
          // Profile photos (supabase/avatars.sql)
          { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/avatars/**" },
        ]
      : [],
  },
  experimental: {
    // Room for the two review photos (≤ 1.5 MB each) the testimonials admin
    // uploads through a server action; stays under Vercel's 4.5 MB request cap.
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Self-hosted fonts carry a content hash in their names (see app/fonts.css)
  async headers() {
    return [
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Basic hardening for every page: no MIME sniffing, no framing by other
      // sites (clickjacking), no full URLs leaked to other sites, and no
      // camera/microphone/location access (no feature uses them).
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
          { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
        ],
      },
    ];
  },
  // App features moved under /dashboard/*. Keep old links (emails,
  // bookmarks, notifications) working. Temporary (307) on purpose so the
  // structure can still change without browsers caching the redirect.
  async redirects() {
    return [
      // No overview page: sign-in, the logo and old links open the visa assessment
      { source: "/dashboard", destination: "/assessment", permanent: false },
      { source: "/readiness-score", destination: "/dashboard/readiness", permanent: false },
      { source: "/documents", destination: "/dashboard/documents", permanent: false },
      { source: "/ai-interview", destination: "/dashboard/interview", permanent: false },
      { source: "/applications", destination: "/dashboard/tracker", permanent: false },
      { source: "/refusal-analysis", destination: "/dashboard/rejection-analysis", permanent: false },
      { source: "/consultation", destination: "/dashboard/experts", permanent: false },
      // The library is read in the dashboard now; /knowledge-base itself is its promo page
      { source: "/knowledge-base/:path+", destination: "/dashboard/library/:path+", permanent: false },
      { source: "/:lang(ru|en)/knowledge-base/:path+", destination: "/dashboard/library/:path+", permanent: false },
    ];
  },
};

export default nextConfig;
