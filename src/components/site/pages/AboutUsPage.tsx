"use client";

import Image from "next/image";
import { BadgeCheck, Building2, GraduationCap, HeartHandshake, MapPin, Phone, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { FinalCTA } from "@/components/site/FinalCTA";
import { PageHero } from "@/components/site/PageHero";
import { useSite } from "@/lib/i18n/site";
import { COMPANY } from "@/lib/site/about";

const VALUE_ICONS = [ShieldCheck, BadgeCheck, HeartHandshake];
const DIPLOMAS = ["/about/diploma-bachelor.png", "/about/diploma-guide.png"];

/** A document scan as a clickable thumbnail that opens the full image */
function DocThumb({ src, alt, label, className }: { src: string; alt: string; label: string; className?: string }) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden rounded-2xl border border-surface-border bg-white ${className ?? ""}`}
    >
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 280px, 90vw" className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]" />
      <span className="absolute inset-x-2 bottom-2 rounded-pill bg-ink-950/75 px-3 py-1.5 text-center text-caption font-semibold text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </a>
  );
}

function Facts({ facts }: { facts: [string, string][] }) {
  return (
    <dl className="divide-y divide-surface-border">
      {facts.map(([k, v]) => (
        <div key={k} className="grid gap-0.5 py-2.5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4">
          <dt className="text-caption font-semibold uppercase tracking-[0.06em] text-ink-500">{k}</dt>
          <dd className="text-body-sm font-medium text-ink-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** /about — the founder, the company behind VIZAR AI and its official documents */
export function AboutUsPage() {
  const copy = useSite().aboutPage;
  const { license } = copy.company;

  return (
    <>
      <PageHero emoji="🏢" decor={["🎓", "📜", "🤝"]} eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

      <div className="container-page space-y-14 pb-12 pt-8 md:space-y-16 md:pb-14 md:pt-10 lg:pb-16">
        {/* Founder — photo, video, bio and numbers */}
        <section aria-labelledby="about-founder" data-reveal className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-[32px] shadow-float ring-1 ring-surface-border lg:max-w-none">
              <Image
                src="/about/founder.webp"
                alt={copy.founder.name}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-[50%_30%]"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-[22px] bg-white/85 px-4 py-3 backdrop-blur-md dark:bg-navy-950/80">
                <p className="font-display text-body-lg font-bold text-ink-950">{copy.founder.name}</p>
                <p className="text-caption font-medium text-ink-600">{copy.founder.role}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-3 py-1 text-caption font-semibold uppercase tracking-[0.1em] text-brand-700 dark:bg-brand-500/15 dark:text-white">
              <Sparkles size={13} aria-hidden="true" /> {copy.founder.label}
            </p>
            <h2 id="about-founder" className="luxe-firm mt-4 font-luxe text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink-950">
              {copy.founder.name}
            </h2>
            <div className="mt-5 space-y-4 text-body text-ink-700 sm:text-body-lg">
              {copy.founder.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <dl data-reveal-stagger className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {copy.founder.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end rounded-[22px] border border-surface-border bg-surface p-4 shadow-card">
                  <dt className="mt-2 text-caption font-medium text-ink-600">{s.label}</dt>
                  <dd className="font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] text-brand-700 dark:text-white">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 grid items-start gap-5 sm:grid-cols-[1fr_220px]">
              <ul data-reveal-stagger className="grid content-start gap-3">
                {copy.values.map((v, i) => {
                  const Icon = VALUE_ICONS[i] ?? ShieldCheck;
                  return (
                    <li key={v.title} className="flex gap-3.5 rounded-[22px] border border-surface-border bg-surface p-4 shadow-card">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:text-violet-400">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-body-sm font-bold text-ink-950">{v.title}</p>
                        <p className="mt-1 text-caption text-ink-600">{v.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <figure className="mx-auto w-full max-w-[260px] sm:mx-0">
                <video
                  src="/about/founder-video.mp4#t=0.5"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={copy.founder.video}
                  className="aspect-[9/16] w-full rounded-[28px] bg-ink-950 object-cover shadow-float ring-1 ring-surface-border"
                />
                <figcaption className="mt-2 text-center text-caption font-medium text-ink-500">{copy.founder.video}</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Company documents */}
        <section aria-labelledby="about-company" data-reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="about-company" className="luxe-firm font-luxe text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-tight tracking-[-0.02em] text-ink-950">
              {copy.company.title}
            </h2>
            <p className="mt-3 text-body text-ink-600">{copy.company.subtitle}</p>
          </div>

          <article className="mx-auto mt-8 flex max-w-4xl flex-col gap-6 rounded-[28px] border border-surface-border bg-surface p-5 shadow-card sm:flex-row sm:p-7">
            <DocThumb src="/about/license.png" alt={license.title} label={copy.view} className="aspect-[3/4] w-full shrink-0 sm:w-56" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ScrollText size={18} aria-hidden="true" className="text-violet-600 dark:text-violet-400" />
                <h3 className="text-body font-bold text-ink-950">{license.title}</h3>
                <span className="rounded-pill bg-emerald-500/10 px-2.5 py-0.5 text-caption font-semibold text-emerald-700 dark:text-emerald-300">
                  {license.status}
                </span>
              </div>
              <div className="mt-2">
                <Facts facts={license.facts as [string, string][]} />
              </div>
            </div>
          </article>
        </section>

        {/* Education */}
        <section aria-labelledby="about-education" data-reveal>
          <h2 id="about-education" className="luxe-firm text-center font-luxe text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-tight tracking-[-0.02em] text-ink-950">
            {copy.education.title}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {copy.education.items.map((item, i) => (
              <article key={item.title} className="overflow-hidden rounded-[28px] border border-surface-border bg-surface shadow-card">
                <DocThumb src={DIPLOMAS[i] ?? ""} alt={item.title} label={copy.view} className="aspect-[3/2] rounded-none border-0 border-b" />
                <div className="p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-body font-bold text-ink-950">
                    <GraduationCap size={18} aria-hidden="true" className="shrink-0 text-violet-600 dark:text-violet-400" />
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-body-sm font-medium text-ink-800">{item.place}</p>
                  <p className="mt-0.5 text-caption text-ink-500">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section aria-labelledby="about-contact" data-reveal className="lime-wash grain relative overflow-hidden rounded-[32px] p-6 shadow-float sm:p-10">
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 id="about-contact" className="luxe-firm font-luxe text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-tight tracking-[-0.02em] text-ink-950">
                {copy.contact.title}
              </h2>
              <p className="mt-3 max-w-md text-body text-ink-700">{copy.contact.subtitle}</p>
              <a
                href={`tel:${COMPANY.phone}`}
                className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-pill bg-charcoal px-6 text-body-sm font-semibold text-white shadow-button transition-transform duration-200 hover:-translate-y-px"
              >
                <Phone size={16} aria-hidden="true" /> {copy.contact.call}
              </a>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[22px] bg-white/80 p-4 backdrop-blur dark:bg-navy-950/60">
                <dt className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">
                  <Phone size={13} aria-hidden="true" /> {copy.contact.phone}
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${COMPANY.phone}`} className="font-display text-display-sm font-bold text-ink-950 underline-offset-4 hover:underline">
                    {COMPANY.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="rounded-[22px] bg-white/80 p-4 backdrop-blur dark:bg-navy-950/60">
                <dt className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">
                  <MapPin size={13} aria-hidden="true" /> {copy.contact.city}
                </dt>
                <dd className="mt-1 text-body font-semibold text-ink-950">{copy.contact.cityValue}</dd>
              </div>
              <div className="rounded-[22px] bg-white/80 p-4 backdrop-blur sm:col-span-2 lg:col-span-1 dark:bg-navy-950/60">
                <dt className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">
                  <Building2 size={13} aria-hidden="true" /> {copy.contact.company}
                </dt>
                <dd className="mt-1 text-body font-semibold text-ink-950">
                  {COMPANY.name} · STIR {COMPANY.stir}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <p className="mx-auto max-w-2xl text-center text-caption text-ink-500">{copy.note}</p>
      </div>

      <FinalCTA />
    </>
  );
}
