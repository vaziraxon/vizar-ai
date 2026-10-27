import * as Flags from "country-flag-icons/string/3x2";

/**
 * GET /flags/de.svg — country flags (3:2 SVG, MIT, country-flag-icons) as
 * static files, so pages reference them with <img> instead of inlining the
 * SVG markup (the library home shows 60+ flags). Prerendered at build time
 * and cached for a year; the ".svg" suffix also keeps middleware off them.
 */
const FLAGS = Flags as unknown as Record<string, string>;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(FLAGS)
    .filter((code) => /^[A-Z]{2}$/.test(code))
    .map((code) => ({ file: `${code.toLowerCase()}.svg` }));
}

export function GET(_request: Request, { params }: { params: { file: string } }) {
  const svg = FLAGS[params.file.replace(/\.svg$/, "").toUpperCase()];
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
