import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { L } from "@/components/i18n/L";
import { Markdown } from "@/components/knowledge/Markdown";
import { LibraryDate } from "@/components/knowledge/library/LibraryDate";
import { AccessCard, CountryMark, LibraryError, LibraryHero, LibraryTabs, LockIcon, Paywall, SectionRow } from "@/components/knowledge/library/ui";
import { getLibraryViewer } from "@/lib/knowledge/access";
import { REGIONS, getCountries, getCountryRules, getCountrySections, type CountryRule } from "@/lib/knowledge/library";
import { libraryHref } from "@/lib/knowledge/offline";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

const isCode = (code: string) => /^[a-z]{2}$/i.test(code);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!isCode(params.code)) return {};
  const viewer = await getLibraryViewer();
  const country = viewer.supabase
    ? (await getCountries(viewer.supabase).catch(() => [])).find((c) => c.code === params.code.toUpperCase())
    : undefined;
  if (!country) return {};
  return {
    title: `${country.name} vizasi — qoidalar va rasmiy manbalar`,
    description: `${country.name}: ${country.topics.join(", ")}.`,
    alternates: { canonical: libraryHref.country(country.code) },
  };
}

function RuleStatus({ rule }: { rule: CountryRule }) {
  const verified = rule.status === "verified";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold",
        verified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
      )}
    >
      {verified ? <ShieldCheck size={12} aria-hidden="true" /> : <ShieldAlert size={12} aria-hidden="true" />}
      <L>{verified ? "Tasdiqlangan" : rule.status === "needs_review" ? "Qayta tekshirish kerak" : "Rasmiy manbada tekshiring"}</L>
    </span>
  );
}

export default async function CountryPage({ params }: Params) {
  if (!isCode(params.code)) notFound();
  const code = params.code.toUpperCase();
  const viewer = await getLibraryViewer();
  if (!viewer.supabase) return <LibraryError />;

  let countries: Awaited<ReturnType<typeof getCountries>>;
  let sections: Awaited<ReturnType<typeof getCountrySections>>;
  try {
    [countries, sections] = await Promise.all([getCountries(viewer.supabase), getCountrySections(viewer.supabase, code)]);
  } catch (error) {
    console.error("[knowledge-base/country]", error);
    return <LibraryError />;
  }
  const country = countries.find((c) => c.code === code);
  if (!country) notFound();

  // Rule texts only through RLS: empty unless kb_has_access() is true right now.
  const rules = viewer.hasAccess ? await getCountryRules(viewer.supabase, code) : [];
  const region = REGIONS.find((r) => r.id === country.region);
  const here = libraryHref.country(code);

  return (
    <>
      <LibraryHero
        breadcrumb={[
          { href: "/knowledge-base", label: <L>Kutubxona</L> },
          { href: "/knowledge-base#davlatlar", label: <L>Davlatlar</L> },
        ]}
        eyebrow={
          region ? (
            <>
              <span aria-hidden="true">{region.emoji}</span> <L>{region.title}</L>
            </>
          ) : undefined
        }
        title={
          <span className="flex items-center gap-4">
            <CountryMark code={code} size="lg" />
            {country.name}
          </span>
        }
        subtitle={
          <>
            {country.ruleCount} <L>qoida</L> · {sections.length} <L>bo‘lim kitobda</L>
          </>
        }
        aside={<AccessCard viewer={viewer} next={here} />}
      />
      <LibraryTabs />

      <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <h2 className="font-display text-display-sm font-bold text-ink-950">
            <L>Viza qoidalari</L>
          </h2>
          {rules.length ? (
            <>
              <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10">
                ⚠️ <L>Yig‘imlar, topshirish joyi va kirish tartibi o‘zgarib turadi. Ariza berishdan oldin rasmiy manbada tekshiring.</L>
              </p>
              <ol className="space-y-4">
                {rules.map((rule) => (
                  <li key={rule.id} className="rounded-[24px] border border-surface-border bg-surface p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-body-lg font-bold text-ink-950">{rule.topic}</h3>
                      <RuleStatus rule={rule} />
                    </div>
                    <div className="mt-3 text-body text-ink-800">
                      <Markdown source={rule.ruleText} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-caption text-ink-500">
                      {rule.asOf ? (
                        <span>
                          <L>Kitobdagi ma’lumot sanasi</L>: <LibraryDate iso={rule.asOf} />
                        </span>
                      ) : null}
                      {rule.lastVerifiedAt ? (
                        <span>
                          <L>Oxirgi tekshiruv</L>: <LibraryDate iso={rule.lastVerifiedAt} />
                        </span>
                      ) : null}
                    </div>
                    {rule.sources.length ? (
                      <ul className="mt-3 space-y-1 border-t border-surface-border pt-3">
                        {rule.sources.map((s) => (
                          <li key={s.url}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 break-all text-body-sm text-brand-700 underline underline-offset-2"
                            >
                              {s.title}
                              <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <ul className="rounded-[24px] border border-surface-border bg-surface p-2 sm:p-3">
                {country.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-3 rounded-2xl px-4 py-3.5">
                    <span className="min-w-0 flex-1 text-body font-medium text-ink-900">{topic}</span>
                    <LockIcon />
                  </li>
                ))}
              </ul>
              <Paywall viewer={viewer} next={here} title={<L vars={{ country: country.name }}>{"{country} bo‘yicha qoidalar obunachilar uchun"}</L>} />
            </>
          )}
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <h2 className="font-display text-display-sm font-bold text-ink-950">
            <L>Kitobda</L>
          </h2>
          {sections.length ? (
            <ul className="rounded-[24px] border border-surface-border bg-surface p-2">
              {sections.map((s) => (
                <SectionRow
                  key={`${s.chapterSlug}/${s.sectionSlug}/${s.anchor ?? ""}`}
                  href={libraryHref.section(s.chapterSlug, s.sectionSlug)}
                  number={s.sectionNumber}
                  title={s.anchor ? s.anchor.replace(/^[\d.]+\s*/, "") : s.sectionTitle}
                  locked={!viewer.hasAccess}
                />
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-ink-600">
              <L>Bu davlat kitobning umumiy boblarida yoritilgan.</L>
            </p>
          )}
          <Link href="/knowledge-base#davlatlar" className="inline-flex text-body-sm font-semibold text-brand-700 hover:underline">
            ← <L>Barcha davlatlar</L>
          </Link>
        </aside>
      </div>
    </>
  );
}
