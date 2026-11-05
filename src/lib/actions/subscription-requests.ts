"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

const BASE = "/admin/subscriptions";
const UUID = /^[0-9a-f-]{36}$/i;

function back(params: Record<string, string>): never {
  redirect(`${BASE}?${new URLSearchParams(params).toString()}`);
}

async function editor() {
  // Site editors manage testimonials, consultation and subscription requests alike.
  const ctx = await getTestimonialEditorContext();
  if (!ctx.supabase || !ctx.userId || !ctx.isAdmin || !ctx.isEditor) back({ error: "So‘rovlarni boshqarish huquqi yo‘q." });
  return ctx.supabase!;
}

/**
 * Opens the library for the request's plan: approve_subscription_request()
 * checks the editor again, adds the subscriptions row and notifies the user.
 * Use it only after the payment has been received.
 */
export async function approveSubscriptionRequestAction(form: FormData) {
  const supabase = await editor();
  const id = String(form.get("id") ?? "");
  const until = String(form.get("expires_at") ?? "").trim();
  if (!UUID.test(id)) back({ error: "Noto‘g‘ri so‘rov." });
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) back({ error: "Sana noto‘g‘ri." });

  const { error } = await supabase.rpc("approve_subscription_request", {
    p_request_id: id,
    // End of the chosen day in Tashkent (UTC+5)
    p_expires_at: until ? `${until}T23:59:59+05:00` : null,
  });
  if (error) {
    back({ error: /explicit end date/.test(error.message) ? "VIP uchun tugash sanasini kiriting." : "Faollashtirib bo‘lmadi." });
  }

  revalidatePath(BASE);
  back({ ok: "Obuna faollashtirildi." });
}

export async function declineSubscriptionRequestAction(form: FormData) {
  const supabase = await editor();
  const id = String(form.get("id") ?? "");
  if (!UUID.test(id)) back({ error: "Noto‘g‘ri so‘rov." });

  const { error } = await supabase.from("subscription_requests").update({ status: "declined" }).eq("id", id).eq("status", "pending");
  if (error) back({ error: "Saqlab bo‘lmadi." });

  revalidatePath(BASE);
  back({ ok: "So‘rov rad etildi." });
}
