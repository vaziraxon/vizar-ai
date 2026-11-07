"use client";

import { LocalLink as Link } from "@/components/site/LocalLink";
import { ArrowUpRight, Lock, UserPlus } from "lucide-react";
import { CheckLine, EmojiTile, Eyebrow, GoldUnderline } from "@/components/site/primitives";
import { HeroSky } from "@/components/site/home/HeroSky";
import { FinalCTA } from "@/components/site/FinalCTA";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { EmojiIcon } from "@/components/site/EmojiIcon";

/** The library itself; signed out, the middleware sends the visitor to log in first and back there after */
const LIBRARY_HREF = "/dashboard/library";

const POINTS = [
  "9 bob: viza turlari, hujjatlar, suhbat, rad javobi va boshqalar",
  "Davlatlar bo‘yicha qoidalar va rasmiy manbalarga havolalar",
  "Kitob ichidan qidiruv va «Kitobdan javob» bo‘limi",
];

const INSIDE: [string, string][] = [
  ["📚", "9 bob to‘liq"],
  ["🌍", "Davlat qoidalari"],
  ["🛂", "Viza turlari"],
  ["📑", "Hujjatlar"],
  ["🔎", "Qidiruv"],
  ["🔗", "Rasmiy manbalar"],
];

const STEPS: [string, string][] = [
  ["Ro‘yxatdan o‘ting", "Elektron pochta bilan bir daqiqada — hozircha to‘lov shart emas."],
  ["Kabinetda «Viza bazasi»ni oching", "Boblar, davlatlar va qidiruv — hammasi bir joyda."],
  ["O‘qing va tekshiring", "Har bo‘lim ostida rasmiy manbalar ko‘rsatilgan — talablarni elchixona saytida solishtiring."],
];

/**
 * The public /knowledge-base page: the library is read in the dashboard, so
 * this page only says what is in it and leads there (free for signed-in
 * users for now).
 */
export function LibraryPromo() {
  const l = useL();
  const site = useSite();

  return (
    <>
      <section className="lime-wash grain relative overflow-hidden">
        <HeroSky calm />
        <div className="container-page relative grid items-center gap-14 pb-16 pt-28 sm:pt-36 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-40">
          <div className="animate-fade-up lg:col-span-6">
            <div className="flex items-center gap-3">
              <EmojiTile emoji="📚" size="lg" />
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-surface-border bg-surface px-2 py-[3px] text-[11px] font-medium leading-none text-violet-700">
                <Lock size={11} strokeWidth={2.2} /> {l("Shaxsiy kabinetda")}
              </span>
            </div>

            <h1 className="luxe-firm mt-6 font-luxe text-[clamp(2.7rem,5.2vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink-950">
              {l("Viza ma’lumotlar bazasi")}
            </h1>
            <GoldUnderline className="mt-3" />
            <p className="mt-5 max-w-xl text-body-lg text-ink-600">
              {l("VIZAR AI kitobi va davlatlar bo‘yicha viza qoidalari — rasmiy manbalar bilan. Ro‘yxatdan o‘tgach, shaxsiy kabinetda o‘qiysiz.")}
            </p>

            <ul className="mt-8 space-y-3">
              {POINTS.map((p) => (
                <CheckLine key={p} className="text-body" iconClassName="text-violet-600 dark:text-citron-300">
                  {l(p)}
                </CheckLine>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={LIBRARY_HREF}
                className="btn btn-charcoal btn-sheen group h-14 w-full justify-between pl-7 pr-2 text-body hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(113,56,236,0.6)] sm:w-auto sm:justify-center sm:gap-4"
              >
                {l("Kabinetda o‘qish")}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-300 text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-night dark:text-gold-300">
                  <ArrowUpRight size={18} strokeWidth={2.4} className="transition-transform duration-200 group-hover:rotate-45" />
                </span>
              </Link>
              <Link
                href="/register"
                className="btn btn-sheen h-14 w-full gap-3 border border-white/80 bg-surface/60 pl-2 pr-7 text-body text-ink-900 shadow-xs backdrop-blur hover:-translate-y-0.5 hover:bg-surface hover:shadow-card-hover dark:border-white/10 sm:w-auto"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink-950 shadow-card ring-1 ring-ink-900/5 dark:ring-white/10">
                  <UserPlus size={16} strokeWidth={2.2} />
                </span>
                {l("Ro'yxatdan o'tish")}
              </Link>
            </div>

            <p className="mt-8 max-w-xl border-l-2 border-emerald-500 pl-4 text-body-sm text-ink-700">
              {l("Hozircha bepul — faqat ro‘yxatdan o‘tish kerak.")}
            </p>
          </div>

          <div className="animate-fade-up lg:col-span-5 lg:col-start-8" style={{ animationDelay: "120ms" }}>
            <div className="rounded-[28px] border border-white/80 bg-surface/80 p-6 shadow-float backdrop-blur dark:border-white/10">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l("Ichida nima bor")}</p>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {INSIDE.map(([emoji, label]) => (
                  <li key={label} className="flex items-center gap-2.5 rounded-2xl border border-surface-border bg-surface px-3 py-3 text-body-sm font-semibold text-ink-900">
                    <span aria-hidden="true" className="text-[20px] leading-none">
                      <EmojiIcon emoji={emoji} />
                    </span>
                    {l(label)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="library-how" className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-4">
            <Eyebrow emoji="📚">{l("Viza ma’lumotlar bazasi")}</Eyebrow>
            <h2 id="library-how" className="luxe-firm mt-4 font-display text-display-lg text-ink-900">
              {site.toolPage.howTitle}
            </h2>
          </div>
          <ol data-reveal className="border-t border-surface-border lg:col-span-8">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="grid gap-2 border-b border-surface-border py-7 sm:grid-cols-12 sm:gap-6">
                <span className="font-luxe-italic text-[1.6rem] font-medium italic leading-none text-violet-600 dark:text-citron-300 sm:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="luxe-firm font-luxe text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-950 sm:col-span-4">{l(title)}</h3>
                <p className="text-body text-ink-600 sm:col-span-7">{l(desc)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FinalCTA title={site.toolPage.ctaTitle} subtitle={site.toolPage.ctaText} />
    </>
  );
}
