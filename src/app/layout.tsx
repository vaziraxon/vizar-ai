import type { Metadata, Viewport } from "next";
// Self-hosted Inter, Manrope and Playfair Display italic (editorial accent):
// builds no longer fetch Google Fonts, which intermittently failed on Vercel
import "./fonts.css";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";

/** Latin files for body and display text, fetched before the CSS asks for them. */
const PRELOAD_FONTS = ["/fonts/inter-normal-100-900-latin.1dc044f4.woff2", "/fonts/manrope-normal-200-800-latin.22630002.woff2"];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vizarai.com";
const TITLE = "VIZAR AI — Viza olishga aqlliroq tayyorlaning";
const DESCRIPTION =
  "VIZAR AI — vizaga tayyorlanish platformasi: tayyorgarlik bali, hujjatlar ombori, shaxsiy checklist, suhbat mashqi, viza fotosurati va xatlari, ariza muddati.";

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
    "viza hujjatlari ro'yxati",
    "viza suhbati savollari",
    "viza fotosurati",
    "Shengen 90/180",
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
    <html lang="uz" suppressHydrationWarning>
      <head>
        {PRELOAD_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        {/* Apply a saved dark theme before first paint (no light flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('vizar-ai-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
        {/* Set <html lang> to the page's language before first paint. Reading the
            cookie here on the server would make every static page dynamic, so the
            HTML stays "uz" and this corrects it in the browser: the /ru or /en
            address first, then the same choice as LanguageProvider (localStorage,
            then the cookie). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var m=location.pathname.match(/^\\/(ru|en)(\\/|$)/),l=m?m[1]:localStorage.getItem('vizar-ai-language')||(document.cookie.match(/(?:^|; )vizar-ai-language=([^;]*)/)||[])[1];if(l==='ru'||l==='en')document.documentElement.lang=l}catch(e){}",
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
