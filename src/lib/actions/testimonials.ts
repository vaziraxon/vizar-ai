"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DESTINATION_BY_SLUG, TOOL_BY_ID, type DestinationSlug } from "@/lib/site/registry";
import {
  getTestimonialEditorContext,
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_TYPES,
  mediaPath,
  type SiteClient,
  type TestimonialRow,
} from "@/lib/testimonials/admin";

const BASE = "/admin/testimonials";
const LOCALES = ["uz", "ru", "en"] as const;

function back(params: Record<string, string>): never {
  redirect(`${BASE}?${new URLSearchParams(params).toString()}`);
}

async function requireEditor(): Promise<SiteClient> {
  const ctx = await getTestimonialEditorContext();
  if (!ctx.supabase || !ctx.userId || !ctx.isAdmin || !ctx.isEditor) back({ error: "Sharhlarni boshqarish huquqi yo‘q." });
  return ctx.supabase;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const checked = (form: FormData, key: string) => form.get(key) === "on";

/** Fields shared by create and update. Anything invalid — above all missing consent — sends the editor back. */
function readFields(form: FormData) {
  const name = text(form, "name");
  const quote = text(form, "quote").replace(/\r\n/g, "\n");
  const destination = text(form, "destination");
  const tool = text(form, "tool");
  const ratingRaw = text(form, "rating");
  const locale = text(form, "locale");
  const sortOrder = Number.parseInt(text(form, "sort_order") || "0", 10);
  const consentNote = text(form, "consent_note");

  if (!checked(form, "consent_given") || consentNote.length < 3) {
    back({ error: "Mijoz roziligi belgilanmagan yoki qanday olingani yozilmagan — saqlanmadi." });
  }
  if (consentNote.length > 300) back({ error: "Rozilik izohi 300 belgidan oshmasin." });
  if (name.length < 1 || name.length > 80) back({ error: "Ism 1–80 belgi bo‘lsin." });
  if (quote.length < 10 || quote.length > 600) back({ error: "Sharh matni 10–600 belgi bo‘lsin." });
  if (!(destination in DESTINATION_BY_SLUG)) back({ error: "Yo‘nalishni tanlang." });
  if (!(tool in TOOL_BY_ID)) back({ error: "Vositani tanlang." });
  const rating = ratingRaw ? Number(ratingRaw) : null;
  if (rating !== null && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) back({ error: "Baho 1 dan 5 gacha bo‘lsin." });

  return {
    fields: {
      name,
      quote,
      destination,
      tool,
      rating,
      locale: (LOCALES as readonly string[]).includes(locale) ? (locale as (typeof LOCALES)[number]) : null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      published: checked(form, "published"),
    },
    consentNote,
  };
}

/** Checks an uploaded image before anything is written (Blob: File isn't global on every Node version). */
function pickImage(form: FormData, key: string): Blob | null {
  const file = form.get(key);
  if (!(file instanceof Blob) || file.size === 0) return null;
  if (!MEDIA_TYPES[file.type] || file.size > MEDIA_MAX_BYTES) {
    back({ error: "Rasm JPG, PNG yoki WebP bo‘lsin va 1,5 MB dan oshmasin." });
  }
  return file;
}

async function upload(supabase: SiteClient, file: Blob, id: string, kind: "avatar" | "photo"): Promise<string> {
  const path = `${id}/${kind}-${randomUUID()}.${MEDIA_TYPES[file.type]}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) back({ error: `Rasm yuklanmadi: ${error.message}` });
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeMedia(supabase: SiteClient, urls: (string | null | undefined)[]) {
  const paths = urls.map(mediaPath).filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(MEDIA_BUCKET).remove(paths);
}

const destinationPhoto = (slug: string) => DESTINATION_BY_SLUG[slug as DestinationSlug].photo;

function refresh() {
  revalidatePath("/");
  revalidatePath(BASE);
}

export async function createTestimonialAction(form: FormData) {
  const supabase = await requireEditor();
  const { fields, consentNote } = readFields(form);
  const avatarFile = pickImage(form, "avatar");
  const photoFile = checked(form, "photo_destination") ? null : pickImage(form, "photo");

  const id = randomUUID();
  const avatar_url = avatarFile ? await upload(supabase, avatarFile, id, "avatar") : null;
  const photo_url = checked(form, "photo_destination")
    ? destinationPhoto(fields.destination)
    : photoFile
      ? await upload(supabase, photoFile, id, "photo")
      : null;

  const { error } = await supabase
    .from("testimonials")
    .insert({ id, ...fields, avatar_url, photo_url, consent_given: true, consent_at: new Date().toISOString() });
  if (error) {
    await removeMedia(supabase, [avatar_url, photo_url]);
    back({ error: error.message });
  }
  const { error: consentError } = await supabase.from("testimonial_consents").insert({ testimonial_id: id, note: consentNote });
  refresh();
  if (consentError) back({ error: `Sharh saqlandi, lekin rozilik izohi saqlanmadi: ${consentError.message}` });
  back({ ok: fields.published ? "Sharh qo‘shildi va saytda ko‘rinadi." : "Sharh qoralama sifatida saqlandi." });
}

export async function updateTestimonialAction(form: FormData) {
  const supabase = await requireEditor();
  const id = text(form, "id");
  const { fields, consentNote } = readFields(form);
  const { data: current } = await supabase
    .from("testimonials")
    .select("avatar_url, photo_url, consent_at")
    .eq("id", id)
    .maybeSingle<Pick<TestimonialRow, "avatar_url" | "photo_url" | "consent_at">>();
  if (!current) back({ error: "Sharh topilmadi." });

  const avatarFile = pickImage(form, "avatar");
  const useDestinationPhoto = checked(form, "photo_destination");
  const photoFile = useDestinationPhoto ? null : pickImage(form, "photo");

  let avatar_url = current.avatar_url;
  if (avatarFile) avatar_url = await upload(supabase, avatarFile, id, "avatar");
  else if (checked(form, "remove_avatar")) avatar_url = null;

  let photo_url = current.photo_url;
  if (useDestinationPhoto) photo_url = destinationPhoto(fields.destination);
  else if (photoFile) photo_url = await upload(supabase, photoFile, id, "photo");
  else if (checked(form, "remove_photo")) photo_url = null;

  const { error } = await supabase
    .from("testimonials")
    .update({ ...fields, avatar_url, photo_url, consent_given: true, consent_at: current.consent_at ?? new Date().toISOString() })
    .eq("id", id);
  if (error) {
    await removeMedia(supabase, [avatar_url !== current.avatar_url ? avatar_url : null, photo_url !== current.photo_url ? photo_url : null]);
    back({ error: error.message });
  }
  // Replaced or removed files are no longer referenced anywhere
  await removeMedia(supabase, [avatar_url !== current.avatar_url ? current.avatar_url : null, photo_url !== current.photo_url ? current.photo_url : null]);
  const { error: consentError } = await supabase
    .from("testimonial_consents")
    .upsert({ testimonial_id: id, note: consentNote }, { onConflict: "testimonial_id" });
  refresh();
  if (consentError) back({ error: `Sharh saqlandi, lekin rozilik izohi saqlanmadi: ${consentError.message}` });
  back({ ok: "Sharh yangilandi." });
}

export async function setTestimonialPublishedAction(form: FormData) {
  const supabase = await requireEditor();
  const id = text(form, "id");
  const publish = text(form, "publish") === "1";
  // The database refuses to publish a row without recorded consent
  const { error } = await supabase.from("testimonials").update({ published: publish }).eq("id", id);
  if (error) back({ error: error.message });
  refresh();
  back({ ok: publish ? "Sharh saytda ko‘rinadi." : "Sharh saytdan olindi (qoralama)." });
}

export async function deleteTestimonialAction(form: FormData) {
  const supabase = await requireEditor();
  const id = text(form, "id");
  if (!checked(form, "confirm")) back({ error: "O‘chirishni tasdiqlang." });
  const { data: current } = await supabase
    .from("testimonials")
    .select("avatar_url, photo_url")
    .eq("id", id)
    .maybeSingle<Pick<TestimonialRow, "avatar_url" | "photo_url">>();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) back({ error: error.message });
  await removeMedia(supabase, [current?.avatar_url, current?.photo_url]);
  refresh();
  back({ ok: "Sharh o‘chirildi." });
}
