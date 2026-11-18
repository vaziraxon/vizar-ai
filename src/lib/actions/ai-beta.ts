"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/ai/beta";
import { isVoiceModel } from "@/lib/ai/pricing";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

const BASE = "/admin/ai";
const UUID = /^[0-9a-f-]{36}$/i;

function back(params: Record<string, string>): never {
  redirect(`${BASE}?${new URLSearchParams(params).toString()}`);
}

/** Admin email (ADMIN_EMAILS) and a site_editors row, then the service-role client */
async function editorDb() {
  const ctx = await getTestimonialEditorContext();
  if (!ctx.userId || !ctx.isAdmin || !ctx.isEditor) back({ error: "AI beta'ni boshqarish huquqi yo‘q." });
  const db = adminDb();
  if (!db) back({ error: "Server kaliti sozlanmagan." });
  return db!;
}

/** Adds a registered user to the beta by email (the database stops at 25) */
export async function addBetaUserAction(form: FormData) {
  const db = await editorDb();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const note = String(form.get("note") ?? "").trim().slice(0, 200) || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back({ error: "Email noto‘g‘ri." });

  let userId: string | null = null;
  for (let page = 1; page <= 10 && !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) back({ error: "Foydalanuvchilarni o‘qib bo‘lmadi." });
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (data.users.length < 200) break;
  }
  if (!userId) back({ error: "Bu email bilan ro‘yxatdan o‘tgan foydalanuvchi topilmadi." });

  const { error } = await db.from("ai_beta_users").insert({ user_id: userId, note });
  if (error) {
    back({ error: error.code === "23505" ? "Bu foydalanuvchi allaqachon beta'da." : /25/.test(error.message) ? "Beta 25 kishi bilan cheklangan." : "Qo‘shib bo‘lmadi." });
  }
  revalidatePath(BASE);
  back({ ok: "Beta'ga qo‘shildi." });
}

export async function removeBetaUserAction(form: FormData) {
  const db = await editorDb();
  const id = String(form.get("user_id") ?? "");
  if (!UUID.test(id)) back({ error: "Noto‘g‘ri so‘rov." });
  const { error } = await db.from("ai_beta_users").delete().eq("user_id", id);
  if (error) back({ error: "O‘chirib bo‘lmadi." });
  revalidatePath(BASE);
  back({ ok: "Beta'dan chiqarildi." });
}

export async function saveAiSettingsAction(form: FormData) {
  const db = await editorDb();
  const budget = Number(String(form.get("monthly_budget_usd") ?? "").replace(",", "."));
  const model = String(form.get("voice_model") ?? "");
  if (!Number.isFinite(budget) || budget < 0 || budget > 1000) back({ error: "Byudjet 0–1000 $ oralig‘ida bo‘lsin." });
  if (!isVoiceModel(model)) back({ error: "Ovoz modeli noto‘g‘ri." });
  const { error } = await db
    .from("ai_settings")
    .update({
      monthly_budget_usd: Math.round(budget * 100) / 100,
      voice_model: model,
      claude_enabled: form.get("claude_enabled") === "on",
      voice_enabled: form.get("voice_enabled") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) back({ error: "Saqlab bo‘lmadi." });
  revalidatePath(BASE);
  back({ ok: "Sozlamalar saqlandi." });
}
