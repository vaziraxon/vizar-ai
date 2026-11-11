"use client";

import { PageHero } from "@/components/site/PageHero";
import { useLanguage } from "@/lib/language-context";
import { PRIVACY, TERMS, type LegalDoc } from "@/lib/site/legal";

const DOCS = { privacy: PRIVACY, terms: TERMS } as const;
const CONTENTS = { uz: "Mundarija", ru: "Содержание", en: "Contents" } as const;

/** /privacy-policy and /terms-of-service — public, in the page's language */
export function LegalPage({ kind }: { kind: keyof typeof DOCS }) {
  const { language } = useLanguage();
  const doc: LegalDoc = DOCS[kind][language] ?? DOCS[kind].uz;

  return (
    <>
      <PageHero emoji={kind === "privacy" ? "🔒" : "📜"} decor={["🛡", "📄", "✅"]} eyebrow={doc.updatedLabel} title={doc.title} subtitle={doc.intro} />

      <div className="container-page grid gap-8 pb-12 pt-8 md:pb-14 md:pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-16">
        <nav aria-label={CONTENTS[language]} className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28 rounded-[24px] border border-surface-border bg-surface p-5 shadow-card">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{CONTENTS[language]}</p>
            <ol className="mt-3 space-y-1">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="link-draw block rounded py-1 text-body-sm text-ink-700 hover:text-ink-950">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="space-y-5 lg:col-span-8">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28 rounded-[24px] border border-surface-border bg-surface p-6 shadow-card sm:p-7">
              <h2 id={`${s.id}-title`} className="luxe-firm font-luxe text-[1.4rem] font-semibold leading-tight tracking-[-0.01em] text-ink-950 sm:text-[1.55rem]">
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-body-sm leading-relaxed text-ink-700 sm:text-body">
                {s.body.map((block, i) =>
                  Array.isArray(block) ? (
                    <ul key={i} className="space-y-2">
                      {block.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{block}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
