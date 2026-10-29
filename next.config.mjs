// Customer-review photos live in the public "testimonials" bucket of this
// project's Supabase Storage (see supabase/testimonials.sql).
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/testimonials/**" }]
      : [],
  },
  experimental: {
    // Room for the two review photos (≤ 1.5 MB each) the testimonials admin
    // uploads through a server action; stays under Vercel's 4.5 MB request cap.
    serverActions: { bodySizeLimit: "4mb" },
  },
  // App features moved under /dashboard/*. Keep old links (emails,
  // bookmarks, notifications) working. Temporary (307) on purpose so the
  // structure can still change without browsers caching the redirect.
  async redirects() {
    return [
      { source: "/readiness-score", destination: "/dashboard/readiness", permanent: false },
      { source: "/documents", destination: "/dashboard/documents", permanent: false },
      { source: "/ai-interview", destination: "/dashboard/interview", permanent: false },
      { source: "/applications", destination: "/dashboard/tracker", permanent: false },
      { source: "/refusal-analysis", destination: "/dashboard/rejection-analysis", permanent: false },
      { source: "/consultation", destination: "/dashboard/experts", permanent: false },
    ];
  },
};

export default nextConfig;
