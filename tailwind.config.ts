import type { Config } from "tailwindcss";

// ---------------------------------------------------------------------------
// VIZAR AI — Global Design System
// Derived from the VIZAR AI grant presentation (indigo/blue gradient identity,
// deep navy UI surfaces, light lavender-white canvas).
// ---------------------------------------------------------------------------

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — indigo/blue gradient family sampled from the deck's CTAs
        brand: {
          50: "#EEF0FE",
          100: "#DCE0FD",
          200: "#B8C0FC",
          300: "#8F97F5",
          400: "#5E5EEE",
          500: "#3D2AE8",
          600: "#2E1FD0", // primary — sampled directly from deck button
          700: "#2419A8",
          800: "#1B1380",
          900: "#140D5C",
          950: "#0B0838",
        },
        // Accent — cyan used in gradient endpoints & data highlights
        accent: {
          300: "#8FF0F0",
          400: "#5CE1E6",
          500: "#22D3EE",
          600: "#0EA5C4",
        },
        // Navy — deep surface color sampled from the phone-mockup UI
        navy: {
          500: "#132352",
          700: "#0E1A44",
          800: "#0B1740",
          900: "#071A44",
          950: "#050F2C",
        },
        // Ink — text colors
        ink: {
          900: "#0F172A",
          700: "#334155",
          600: "#475569",
          400: "#94A3B8",
        },
        // Surfaces
        surface: {
          DEFAULT: "#FFFFFF",
          tint: "#F6F7FD",     // sampled background lavender-white
          muted: "#EEF1FA",
          border: "#E4E8F5",
        },
        success: "#16C79A",
        warning: "#FAA93A",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Type scale — display face used with restraint, body face for reading
        "display-xl": ["clamp(2.75rem, 5vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["clamp(2.25rem, 3.6vw, 3.25rem)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["clamp(1.75rem, 2.4vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      spacing: {
        // 4px base scale plus section rhythm tokens
        18: "4.5rem",
        22: "5.5rem",
        "section-y-sm": "3rem",
        "section-y-md": "4.5rem",
        "section-y-lg": "6.5rem",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "28px",
        "3xl": "36px",
        pill: "999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(11, 8, 56, 0.04)",
        sm: "0 2px 8px -2px rgba(11, 8, 56, 0.08)",
        card: "0 4px 20px -4px rgba(20, 13, 92, 0.10)",
        "card-hover": "0 12px 32px -8px rgba(20, 13, 92, 0.18)",
        float: "0 20px 48px -12px rgba(11, 8, 56, 0.22)",
        glow: "0 8px 30px -6px rgba(46, 31, 208, 0.45)",
        "glow-cyan": "0 8px 30px -6px rgba(34, 211, 238, 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #2E1FD0 0%, #4F6BFB 55%, #22D3EE 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(46,31,208,0.10) 0%, rgba(34,211,238,0.10) 100%)",
        "navy-gradient": "linear-gradient(180deg, #0E1A44 0%, #050F2C 100%)",
        "hero-glow": "radial-gradient(60% 50% at 80% 20%, rgba(34,211,238,0.18) 0%, rgba(255,255,255,0) 70%), radial-gradient(50% 40% at 10% 80%, rgba(46,31,208,0.12) 0%, rgba(255,255,255,0) 70%)",
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "spin-slow": "spin 20s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
