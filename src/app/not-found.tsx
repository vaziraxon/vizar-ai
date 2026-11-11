"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { UrlLanguageScope, useLanguage } from "@/lib/language-context";
import { localizedHref, splitLangPath } from "@/lib/i18n/url-lang";
import type { LangCode } from "@/lib/translations";

const COPY: Record<LangCode, { title: string; text: string; home: string }> = {
  uz: {
    title: "Sahifa topilmadi",
    text: "Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.",
    home: "Bosh sahifaga qaytish",
  },
  ru: {
    title: "Страница не найдена",
    text: "Страницы, которую вы ищете, нет или она была перемещена.",
    home: "Вернуться на главную",
  },
  en: {
    title: "Page not found",
    text: "The page you're looking for doesn't exist or may have moved.",
    home: "Back to the home page",
  },
};

/**
 * Under /ru/… and /en/… the address decides the language, as on those public
 * pages; elsewhere the visitor's chosen language. The home link stays in it.
 * Production serves one prebuilt (Uzbek) 404 for every address, so the
 * address's language is applied after hydration, not during it.
 */
export default function NotFound() {
  const { lang } = splitLangPath(usePathname() ?? "/");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return !mounted || lang === "uz" ? (
    <NotFoundPage />
  ) : (
    <UrlLanguageScope lang={lang}>
      <NotFoundPage />
    </UrlLanguageScope>
  );
}

function NotFoundPage() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const home = localizedHref("/", language);

  useEffect(() => {
    document.title = `${copy.title} · VIZAR AI`;
  }, [copy.title]);

  return (
    <div className="flex min-h-screen flex-col bg-white px-4 dark:bg-navy-950">
      <div className="container-page flex h-16 items-center px-0 sm:px-0 lg:px-0">
        <Link href={home} className="rounded-lg">
          <Logo />
        </Link>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
        <p className="font-display text-[120px] font-bold leading-none tracking-[-0.06em] text-surface-muted sm:text-[160px] dark:text-white/10">
          404
        </p>
        <h1 className="mt-2 font-display text-display-md text-ink-900 dark:text-white">{copy.title}</h1>
        <p className="mt-3 max-w-md text-body-lg text-ink-600 dark:text-white/70">{copy.text}</p>
        <ButtonLink href={home} size="lg" variant="dark" className="mt-8">
          <ArrowLeft size={17} />
          {copy.home}
        </ButtonLink>
      </main>
    </div>
  );
}
