import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { L } from "@/components/i18n/L";
import { SearchForm } from "@/components/knowledge/library/SearchForm";
import { CountryFlag } from "@/components/knowledge/library/visuals";
import { AccessCard, LibraryHero, LibraryTabs, LockIcon, Paywall } from "@/components/knowledge/library/ui";
import { getLibraryViewer } from "@/lib/knowledge/access";
import { excerpt, libraryHref } from "@/lib/knowledge/offline";
import { chapterSlugEmoji, sectionEmoji, topicEmoji } from "@/lib/knowledge/visuals";
import { searchKnowledge } from "@/lib/knowledge/search";
import type { KbSearchResult } from "@/lib/knowledge/types";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Qidiruv — Viza ma’lumotlar bazasi",
  robots: { index: false },
};

type Props = { searchParams: { q?: string | string[] } };

export default async function LibrarySearchPage({ searchParams }: Props) {
  const raw = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const q = (raw ?? "").trim().slice(0, 200);
  const viewer = await getLibraryViewer();
  const here = q ? `/knowledge-base/search?q=${encodeURIComponent(q)}` : "/knowledge-base/search";

  let result: KbSearchResult | null = null;
  let failure: "limit" | "error" | null = null;
  if (q.length >= 2) {
    const who = viewer.user ? `u:${viewer.user.id}` : `ip:${getClientIp(headers())}`;
    const limit = await rateLimit(`kb-library-search:${who}`, viewer.user ? 60 : 20, 10 * 60 * 1000);
    if (!limit.allowed) failure = "limit";
    else {
      try {
        result = await searchKnowledge(q, 12, viewer.accessToken);
      } catch (error) {
        console.error("[knowledge-base/search]", error);
        failure = "error";
      }
    }
  }
  const full = result?.access === "full";

  return (
    <>
      <LibraryHero
        breadcrumb={[{ href: "/knowledge-base", label: <L>Kutubxona</L> }]}
        eyebrow={
          <>
            <span aria-hidden="true">🔎</span> <L>Qidiruv</L>
          </>
        }
        title={q ? <>«{q}»</> : <L>Kutubxonadan qidirish</L>}
        aside={<AccessCard viewer={viewer} next={here} />}
      >
        <SearchForm defaultValue={q} className="mt-7 max-w-xl" />
      </LibraryHero>
      <LibraryTabs active="search" />

      <div className="container-page py-12 sm:py-16">
        {failure === "limit" ? (
          <p className="text-body text-ink-700">
            <L>Juda ko‘p so‘rov. Birozdan keyin qayta urinib ko‘ring.</L>
          </p>
        ) : failure === "error" ? (
          <p className="text-body text-ink-700">
            <L>Qidiruvda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.</L>
          </p>
        ) : !result ? (
          <p className="text-body text-ink-600">
            <L>Davlat, viza turi yoki hujjat nomini yozing — kitobdan mos bo‘limlar va davlat qoidalari topiladi.</L>
          </p>
        ) : !result.chunks.length && !result.rules.length ? (
          <p className="text-body text-ink-700">
            <L>Kitobda bu so‘rovga mos bo‘lim topilmadi. Boshqacha ifodalab ko‘ring.</L>
          </p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <section aria-labelledby="hits-book" className="min-w-0 lg:col-span-8">
              <h2 id="hits-book" className="flex items-center gap-2 font-display text-display-sm font-bold text-ink-950">
                <span aria-hidden="true" className="emoji-tile">
                  📚
                </span>
                <L>Kitobdan</L>
                <span className="text-body font-medium text-ink-500">· {result.chunks.length}</span>
              </h2>
              <ol className="mt-5 space-y-3">
                {result.chunks.map((hit) => (
                  <li key={hit.chunk_id}>
                    <Link
                      href={libraryHref.section(hit.chapter_slug, hit.section_slug)}
                      className="group flex gap-4 rounded-[24px] border border-surface-border bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-violet-200 hover:shadow-card-hover sm:p-5"
                    >
                      <span aria-hidden="true" className="emoji-tile h-12 w-12 rounded-2xl text-[22px] transition-transform duration-200 group-hover:-rotate-6">
                        {sectionEmoji(hit.section_title)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.06em] text-ink-500">
                          {chapterSlugEmoji(hit.chapter_slug)} {hit.chapter_label}
                          {hit.section_number ? ` · ${hit.section_number}` : ""}
                          {!full ? <LockIcon /> : null}
                        </span>
                        <span className="mt-1 block font-display text-body-lg font-bold text-ink-950 group-hover:text-brand-700">{hit.section_title}</span>
                        {hit.content ? (
                          <span className="mt-1.5 block text-body-sm text-ink-600 [overflow-wrap:anywhere]">{excerpt(hit.content, full ? 320 : 180)}</span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            {result.rules.length ? (
              <section aria-labelledby="hits-rules" className="lg:col-span-4">
                <h2 id="hits-rules" className="flex items-center gap-2 font-display text-display-sm font-bold text-ink-950">
                  <span aria-hidden="true" className="emoji-tile">
                    🌍
                  </span>
                  <L>Davlat qoidalari</L>
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {result.rules.map((rule) => (
                    <li key={rule.rule_id}>
                      <Link
                        href={libraryHref.country(rule.country_code)}
                        className="group flex items-start gap-3 rounded-2xl border border-surface-border bg-surface p-3.5 transition-[border-color,box-shadow] duration-200 hover:border-violet-200 hover:shadow-card-hover"
                      >
                        <CountryFlag code={rule.country_code} size="md" className="mt-0.5" />
                        <span className="min-w-0">
                          <span className="block text-body-sm font-semibold text-ink-900 group-hover:text-brand-700">{rule.country_name}</span>
                          <span className="block text-caption text-ink-500">
                            {topicEmoji(rule.topic)} {rule.topic}
                          </span>
                          {full && rule.rule_text ? <span className="mt-1 block text-caption text-ink-600 [overflow-wrap:anywhere]">{excerpt(rule.rule_text, 140)}</span> : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {!full ? (
              <div className="lg:col-span-12">
                <Paywall viewer={viewer} next={here} title={<L>Topilgan bo‘limlarni to‘liq o‘qing</L>} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
