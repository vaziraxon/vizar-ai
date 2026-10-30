// Display serif for the landing look (self-hosted): Bodoni Moda, with upright
// Playfair Display for Cyrillic headings, which Bodoni lacks
import "@/app/(site)/landing-fonts.css";

/** Latin headline faces (Bodoni upright + italic, Playfair italic for the VIZAR wordmark). */
const PRELOAD_FONTS = [
  "/fonts/bodoni-moda-normal-400-900-latin.fe6c560d.woff2",
  "/fonts/bodoni-moda-italic-400-900-latin.9d952bcb.woff2",
  "/fonts/playfair-display-italic-500-latin.2ca66e76.woff2",
];

/** Render on pages that use the landing look (inside or next to `.landing-lime`). */
export function LandingFonts() {
  return (
    <>
      {PRELOAD_FONTS.map((href) => (
        <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
      ))}
    </>
  );
}
