import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

// Editorial accent — italic serif for a few signature words and numerals
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  style: ["italic"],
  weight: ["500", "600"],
  variable: "--font-accent",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vizarai.com";
const TITLE = "VIZAR AI — Viza olishga aqlliroq tayyorlaning";
const DESCRIPTION =
  "VIZAR AI — hujjatlaringizni tekshirish, shaxsiy viza rejasini tuzish va suhbatga tayyorlanishga yordam beradigan AI platforma.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · VIZAR AI",
  },
  description: DESCRIPTION,
  applicationName: "VIZAR AI",
  keywords: [
    "viza",
    "viza tayyorgarligi",
    "AI viza yordamchisi",
    "hujjatlar tekshiruvi",
    "viza suhbati",
    "VIZAR AI",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "VIZAR AI",
    title: TITLE,
    description: DESCRIPTION,
    locale: "uz_UZ",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} ${playfair.variable}`}
    >
      <head>
        {/* Apply a saved dark theme before first paint (no light flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('vizar-ai-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
        {/* Set <html lang> to the saved language before first paint. Reading the
            cookie here on the server would make every static page dynamic, so the
            HTML stays "uz" and this corrects it in the browser. Same choice as
            LanguageProvider: localStorage first, then the cookie. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var l=localStorage.getItem('vizar-ai-language')||(document.cookie.match(/(?:^|; )vizar-ai-language=([^;]*)/)||[])[1];if(l==='ru'||l==='en')document.documentElement.lang=l}catch(e){}",
          }}
        />
      </head>
      <body className="bg-surface-canvas font-sans text-ink-900 dark:bg-navy-950 dark:text-white">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
