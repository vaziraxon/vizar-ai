import type { Config } from "tailwindcss";

// ---------------------------------------------------------------------------
// VIZAR AI — Global Design System
// Light-violet interior (#FAF8FF canvas, #F4F1FF tints) with white cards,
// near-black / dark-navy ink, electric blue (#2563EB) for actions and the
// current step, violet (#7C3AED / #A78BFA) for highlights. Real destination
// photography and emoji give warmth; gradients stay limited to the hero wash
// and photo scrims. 8px spacing rhythm. Radii: 10–12px controls,
// 16px cards, 20px product panels. Shadows are nearly flat — 1px borders do
// the separating; the "float" level is reserved for panels and dropdowns.
// ---------------------------------------------------------------------------

// Theme-aware colour from a CSS variable holding "R G B" channels.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blue — primary actions, focus, "current step"
        brand: {
          50: v("brand-50"),
          100: v("brand-100"),
          200: v("brand-200"),
          300: "#93B8FD",
          400: "#6097FA",
          500: "#3B7BF6",
          600: "#2563EB",
          // 700–900 are text shades: deep blue in light, pale blue in dark
          700: v("brand-700"),
          800: v("brand-800"),
          900: v("brand-900"),
          950: "#172554",
          // Fixed deep blue for fills (hover states, done markers)
          deep: "#1D4FD7",
        },
        // Violet — secondary atmosphere, beta states, subtle highlights
        violet: {
          50: v("violet-50"),
          100: v("violet-100"),
          200: v("violet-200"),
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: v("violet-700"),
          800: v("violet-800"),
          900: v("violet-900"),
        },
        // Accent — quiet blue tints kept so legacy usages stay on-palette
        accent: {
          300: "#BFD5FE",
          400: "#93B8FD",
          500: "#6097FA",
          600: "#3B7BF6",
        },
        // Navy — midnight surfaces for the app's dark mode (matches the site)
        navy: {
          500: "#3A4166",
          700: "#1E2447",
          800: "#141938",
          900: "#0F1328",
          950: "#090C18",
        },
        // Night — fills that stay dark in both themes (logo tile, overlays,
        // the midnight bento band, photo scrims)
        night: {
          DEFAULT: "#111318",
          950: "#0B1020",
        },
        // Citron — the landing page's lime accent (headline chip, arrow
        // tiles, highlights). Fills only: always pair with night text, never
        // use it as text on a light surface.
        citron: {
          50: "#F8FCE6",
          100: "#F0F8C8",
          200: "#E5F49C",
          300: "#D9F26B",
          400: "#C6E244",
          500: "#A6C22B",
        },
        // Champagne gold — landing hero underline and CTA arrow tiles (fills
        // and strokes only; pair with night text)
        gold: {
          200: "#FBE5A6",
          300: "#F5CD65",
          400: "#EDB940",
        },
        // Charcoal — the landing page's dark pill buttons (white text)
        charcoal: {
          DEFAULT: "#2B2D33",
          deep: "#1D1F24",
        },
        // Ink — near-black text scale. 600+ for body copy; 500 is the
        // lightest shade allowed for readable text; 400/300 are for icons
        // and decoration only.
        ink: {
          950: v("ink-950"),
          900: v("ink-900"),
          800: v("ink-800"),
          700: v("ink-700"),
          600: v("ink-600"),
          500: v("ink-500"),
          400: v("ink-400"),
          300: v("ink-300"),
        },
        // Surfaces — white cards on a light-violet interior
        surface: {
          DEFAULT: v("surface"),
          canvas: v("surface-canvas"),
          tint: v("surface-tint"),
          muted: v("surface-muted"),
          border: v("surface-border"),
          strong: v("surface-strong"),
        },
        success: "#15803D",
        warning: "#B45309",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
        // Landing-page display serif (Bodoni Moda) — defined inside .landing-lime
        luxe: ["var(--font-luxe)", "Georgia", "serif"],
        "luxe-italic": ["var(--font-luxe-italic)", "Georgia", "serif"],
      },
      fontSize: {
        // Strong but not oversized: hero tops out at 60px, sections at 40px.
        "display-2xl": ["clamp(2.35rem, 4.8vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-xl": ["clamp(2.15rem, 4vw, 3.25rem)", { lineHeight: "1.07", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-lg": ["clamp(1.8rem, 3vw, 2.5rem)", { lineHeight: "1.12", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-md": ["clamp(1.45rem, 2.2vw, 1.875rem)", { lineHeight: "1.2", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "650" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        body: ["1rem", { lineHeight: "1.65" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.45", letterSpacing: "0.01em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        "section-y-sm": "5rem",
        "section-y-md": "7rem",
        "section-y-lg": "8.5rem",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "14px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
        pill: "999px",
      },
      // Three levels — 1: hairline lift (cards, controls), 2: hover,
      // 3: floating panels / dropdowns / modals. xs, sm and button alias
      // level 1 so legacy classes stay inside the system.
      boxShadow: {
        xs: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        sm: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        button: "0 1px 2px 0 rgba(16, 24, 40, 0.10)",
        "card-hover": "0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 8px 24px -12px rgba(16, 24, 40, 0.14)",
        float: "0 1px 2px 0 rgba(16, 24, 40, 0.05), 0 24px 48px -24px rgba(16, 24, 40, 0.20)",
        focus: "0 0 0 4px rgba(37, 99, 235, 0.16)",
      },
      backgroundImage: {
        // The single gradient on the site: a barely-there wash behind heroes
        "hero-wash": "linear-gradient(180deg, #F1ECFF 0%, #F7F4FF 50%, #FAF8FF 100%)",
      },
      maxWidth: {
        container: "1200px",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.2s ease-out both",
        "fill-x": "fill-x 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both",
        "menu-in": "menu-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both",
        // Decorative emoji stickers drift a few pixels; marquee rows scroll forever
        float: "float 6s ease-in-out infinite",
        // Ground shadow under a floating element: same 6s rhythm, tighter at the top
        "float-shadow": "float-shadow 6s ease-in-out infinite",
        marquee: "marquee 50s linear infinite",
        // Flight path: dashes march along the route
        dash: "dash 1.6s linear infinite",
        // Aurora blobs wander slowly behind hero content
        drift: "drift 18s ease-in-out infinite",
        // Landing hero entrance: words rise out of a mask, blocks fade up,
        // the gold underline draws left → right (pathLength = 1)
        "reveal-up": "reveal-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        rise: "rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        draw: "draw 1s cubic-bezier(0.65, 0, 0.35, 1) both",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Progress bars grow from zero to their own width (use origin-left)
        "fill-x": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "menu-in": {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tilt, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--tilt, 0deg))" },
        },
        "float-shadow": {
          "0%, 100%": { transform: "scaleX(1)", opacity: "1" },
          "50%": { transform: "scaleX(0.84)", opacity: "0.65" },
        },
        dash: {
          to: { strokeDashoffset: "-28" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(48px, -32px) scale(1.06)" },
          "66%": { transform: "translate(-28px, 24px) scale(0.96)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "reveal-up": {
          "0%": { transform: "translateY(110%)" },
          "100%": { transform: "translateY(0)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        draw: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
