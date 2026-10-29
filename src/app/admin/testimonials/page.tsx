import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Notice, Pill, Stat, formatDate } from "@/components/knowledge/admin-ui";
import { Flag } from "@/components/site/Flag";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  setTestimonialPublishedAction,
  updateTestimonialAction,
} from "@/lib/actions/testimonials";
import { SITE_CONTENT } from "@/lib/i18n/site";
import { DESTINATIONS, DESTINATION_BY_SLUG, TOOLS, type DestinationSlug, type ToolId } from "@/lib/site/registry";
import { getTestimonialEditorContext, type ConsentRow, type TestimonialRow } from "@/lib/testimonials/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mijozlar sharhlari", robots: { index: false } };

const uz = SITE_CONTENT.uz;
const LOCALE_LABEL: Record<string, string> = { uz: "O‘zbekcha", ru: "Русский", en: "English" };

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <span className="mb-1.5 block text-body-sm font-semibold text-ink-900">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-caption text-ink-500">{hint}</span> : null}
    </div>
  );
}

/** Create / edit form. Consent is required both here and in the server action. */
function ReviewForm({
  action,
  row,
  consentNote,
  submitLabel,
}: {
  action: (form: FormData) => Promise<void>;
  row?: TestimonialRow;
  consentNote?: string;
  submitLabel: string;
}) {
  const stockPhoto = Boolean(row?.photo_url?.startsWith("/images/destinations/"));
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {row ? <input type="hidden" name="id" value={row.id} /> : null}
      <Field label="Ism" hint="Mijozning ismi yoki u tanlagan taxallus">
        <input name="name" required maxLength={80} defaultValue={row?.name} className="input" />
      </Field>
      <Field label="Yo‘nalish">
        <select name="destination" required defaultValue={row?.destination ?? ""} className="input">
          <option value="" disabled>
            Tanlang
          </option>
          {DESTINATIONS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {uz.destinations[d.slug].name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Foydalangan vositasi">
        <select name="tool" required defaultValue={row?.tool ?? ""} className="input">
          <option value="" disabled>
            Tanlang
          </option>
          {TOOLS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {uz.tools[t.id].name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Baho" hint="Faqat mijozning o‘zi baho bergan bo‘lsa">
        <select name="rating" defaultValue={row?.rating ?? ""} className="input">
          <option value="">Baho yo‘q</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sharh tili">
        <select name="locale" defaultValue={row?.locale ?? ""} className="input">
          <option value="">—</option>
          {Object.entries(LOCALE_LABEL).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tartib" hint="Kichik raqam karuselda oldinroq chiqadi">
        <input type="number" name="sort_order" defaultValue={row?.sort_order ?? 0} className="input" />
      </Field>
      <Field label="Sharh matni" hint="Mijozning o‘z so‘zlari — tahrir qilmang (10–600 belgi)" wide>
        <textarea name="quote" required minLength={10} maxLength={600} rows={4} defaultValue={row?.quote} className="input min-h-[112px] py-2.5" />
      </Field>
      <Field label="Profil surati (ixtiyoriy)" hint="JPG, PNG yoki WebP, 1,5 MB gacha — faqat mijoz roziligi bilan">
        <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="block w-full text-body-sm" />
        {row?.avatar_url ? (
          <label className="mt-2 flex items-center gap-2 text-body-sm text-ink-700">
            <input type="checkbox" name="remove_avatar" /> Joriy suratni olib tashlash
          </label>
        ) : null}
      </Field>
      <Field label="Sayohat surati (ixtiyoriy)" hint="Mijoz yuborgan surat yoki yo‘nalishning standart surati">
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="block w-full text-body-sm" />
        <label className="mt-2 flex items-center gap-2 text-body-sm text-ink-700">
          <input type="checkbox" name="photo_destination" defaultChecked={stockPhoto} /> Yo‘nalishning standart suratini ishlatish
        </label>
        {row?.photo_url && !stockPhoto ? (
          <label className="mt-1 flex items-center gap-2 text-body-sm text-ink-700">
            <input type="checkbox" name="remove_photo" /> Joriy suratni olib tashlash
          </label>
        ) : null}
      </Field>
      <fieldset className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-400/20 dark:bg-amber-400/10 sm:col-span-2">
        <legend className="px-1 text-body-sm font-semibold text-ink-900">Mijoz roziligi (majburiy)</legend>
        <label className="flex items-start gap-3 text-body-sm text-ink-800">
          <input type="checkbox" name="consent_given" required defaultChecked={row?.consent_given} className="mt-1 h-4 w-4 shrink-0" />
          Mijoz shu ism, matn va (bo‘lsa) suratlarni VIZAR AI saytida e’lon qilishga rozilik berdi.
        </label>
        <input
          name="consent_note"
          required
          minLength={3}
          maxLength={300}
          defaultValue={consentNote}
          placeholder="Rozilik qanday olindi — masalan: Telegram, 2-noyabr, ism va suratga rozi"
          className="input mt-3"
        />
        <span className="mt-1 block text-caption text-ink-500">Bu izoh faqat adminlarga ko‘rinadi.</span>
      </fieldset>
      <label className="flex items-center gap-2 text-body-sm font-medium text-ink-900">
        <input type="checkbox" name="published" defaultChecked={row?.published} className="h-4 w-4" /> Saytda ko‘rsatish
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default async function TestimonialsAdminPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const ctx = await getTestimonialEditorContext();

  let body: ReactNode;
  if (!ctx.supabase) {
    body = <p className="card p-5 text-body text-ink-700">Supabase sozlanmagan.</p>;
  } else {
    const [{ data: rows, error }, { data: consents }] = await Promise.all([
      ctx.supabase
        .from("testimonials")
        .select("*")
        .order("published", { ascending: false })
        .order("sort_order")
        .order("created_at", { ascending: false })
        .returns<TestimonialRow[]>(),
      ctx.isEditor
        ? ctx.supabase.from("testimonial_consents").select("testimonial_id, note").returns<Pick<ConsentRow, "testimonial_id" | "note">[]>()
        : Promise.resolve({ data: [] as Pick<ConsentRow, "testimonial_id" | "note">[] }),
    ]);
    const noteById = new Map((consents ?? []).map((c) => [c.testimonial_id, c.note]));
    const list = rows ?? [];
    const published = list.filter((r) => r.published).length;

    body = error ? (
      <div className="card space-y-3 p-5 text-body-sm text-ink-800">
        <p className="font-semibold text-ink-950">Sharhlar jadvali hali yaratilmagan.</p>
        <p>
          Supabase → SQL Editor’da <code>supabase/testimonials.sql</code> faylini ishga tushiring. U jadvallar, RLS qoidalari va surat uchun
          “testimonials” bucket’ini yaratadi.
        </p>
        <p className="text-caption text-ink-500">Xato: {error.message}</p>
      </div>
    ) : (
      <>
        {!ctx.isEditor ? (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-800 dark:border-amber-400/20 dark:bg-amber-400/10">
            Siz faqat ko‘rish rejimidasiz. Tahrirlash uchun Supabase SQL Editor’da:{" "}
            <code className="break-all">
              insert into public.site_editors (email) values (&apos;{ctx.email ?? "email@example.com"}&apos;);
            </code>
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Saytda" value={published} hint="Rozilik bilan e’lon qilingan" />
          <Stat label="Qoralama" value={list.length - published} />
          <Stat label="Jami" value={list.length} />
        </div>

        {ctx.isEditor ? (
          <details open={list.length === 0} className="card mt-6 p-5">
            <summary className="cursor-pointer font-display text-body-lg font-bold text-ink-950">+ Yangi sharh qo‘shish</summary>
            <div className="mt-5">
              <ReviewForm action={createTestimonialAction} submitLabel="Sharhni saqlash" />
            </div>
          </details>
        ) : null}

        <ul className="mt-6 space-y-4">
          {list.length === 0 ? <li className="card p-5 text-body-sm text-ink-600">Hali sharh yo‘q.</li> : null}
          {list.map((r) => {
            const dest = DESTINATION_BY_SLUG[r.destination as DestinationSlug];
            const note = noteById.get(r.id);
            return (
              <li key={r.id} className="card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  {r.avatar_url ? (
                    <Image src={r.avatar_url} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted font-bold text-ink-700">
                      {r.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-950">{r.name}</p>
                      <Pill tone={r.published ? "green" : "gray"}>{r.published ? "Saytda" : "Qoralama"}</Pill>
                      <Pill tone={r.consent_given ? "green" : "red"}>
                        {r.consent_given ? `Rozilik: ${formatDate(r.consent_at)}` : "Rozilik yo‘q"}
                      </Pill>
                      {r.locale ? <Pill>{r.locale.toUpperCase()}</Pill> : null}
                      {r.user_id ? <Pill tone="blue">Mijoz o‘zi yozgan</Pill> : null}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-ink-600">
                      {dest ? <Flag code={dest.flag} size={16} /> : null}
                      {dest ? uz.destinations[dest.slug].name : r.destination} · {uz.tools[r.tool as ToolId]?.name ?? r.tool}
                      {r.rating ? (
                        <span className="inline-flex gap-0.5" aria-label={`${r.rating}/5`}>
                          {Array.from({ length: r.rating }, (_, i) => (
                            <Star key={i} size={13} className="fill-gold-300 text-gold-400" />
                          ))}
                        </span>
                      ) : null}
                    </p>
                    <p lang={r.locale ?? undefined} className="mt-2 whitespace-pre-line text-body-sm text-ink-800">
                      “{r.quote}”
                    </p>
                    {note ? <p className="mt-2 text-caption text-ink-500">Rozilik izohi: {note}</p> : null}
                  </div>
                  {r.photo_url ? (
                    <Image src={r.photo_url} alt="" width={96} height={72} className="h-[72px] w-24 rounded-xl object-cover" />
                  ) : null}
                </div>

                {ctx.isEditor ? (
                  <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-surface-border pt-4">
                    <form action={setTestimonialPublishedAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="publish" value={r.published ? "0" : "1"} />
                      <button type="submit" className="btn btn-secondary btn-sm">
                        {r.published ? "Saytdan olish" : "Saytda chiqarish"}
                      </button>
                    </form>
                    <details className="ml-auto">
                      <summary className="cursor-pointer text-body-sm font-medium text-red-700 dark:text-red-300">O‘chirish</summary>
                      <form action={deleteTestimonialAction} className="mt-2 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <label className="flex items-center gap-2 text-body-sm text-ink-800">
                          <input type="checkbox" name="confirm" required /> Ha, suratlari bilan butunlay o‘chirilsin
                        </label>
                        <button type="submit" className="btn btn-sm bg-red-600 text-white hover:bg-red-700">
                          O‘chirish
                        </button>
                      </form>
                    </details>
                    <details className="w-full">
                      <summary className="cursor-pointer text-body-sm font-medium text-ink-700">Tahrirlash</summary>
                      <div className="mt-4">
                        <ReviewForm action={updateTestimonialAction} row={r} consentNote={note} submitLabel="O‘zgarishlarni saqlash" />
                      </div>
                    </details>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-tint dark:bg-navy-950">
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-body-sm font-medium text-ink-600 hover:text-ink-900">
            <ArrowLeft size={16} /> Admin
          </Link>
          <span className="text-ink-300">/</span>
          <h1 className="font-display text-[20px] font-bold text-ink-950">Mijozlar sharhlari</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Notice ok={searchParams.ok} error={searchParams.error} />
        <p className="mb-6 max-w-3xl text-body-sm text-ink-600">
          Bosh sahifadagi “Mijozlarimizning real hikoyalari” karuseli shu yerdan boshqariladi. Saytda faqat <b>haqiqiy</b> va mijoz
          <b> roziligi</b> olingan sharhlar chiqadi — matnni mijoz yozganidek kiriting. Ro‘yxatdan o‘tgan mijozlar sharhni saytda o‘zi
          ham yozadi (bepul, bitta hisobdan bitta) — u darhol chiqadi; nomaqbulini “Saytdan olish” bilan yashiring. O‘zgarishlar saytda
          darhol yangilanadi.
        </p>
        {body}
      </main>
    </div>
  );
}
