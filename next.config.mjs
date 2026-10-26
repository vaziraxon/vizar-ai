/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
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
