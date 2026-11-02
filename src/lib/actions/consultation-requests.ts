"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

const BASE = "/admin/consultations";

function back(params: Record<string, string>): never {
  redirect(`${BASE}?${new URLSearchParams(params).toString()}`);
}

/** Marks a request answered, or reopens it. Same two gates as testimonials: ADMIN_EMAILS and site_editors (RLS). */
export async function setConsultationRequestStatusAction(form: FormData) {
  // Site editors manage testimonials and consultation requests alike.
  const ctx = await getTestimonialEditorContext();
  if (!ctx.supabase || !ctx.userId || !ctx.isAdmin || !ctx.isEditor) back({ error: "So‘rovlarni boshqarish huquqi yo‘q." });

  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || (status !== "completed" && status !== "booked")) back({ error: "Noto‘g‘ri so‘rov." });

  const { error } = await ctx.supabase.from("consultations").update({ status }).eq("id", id);
  if (error) back({ error: "Saqlab bo‘lmadi." });

  revalidatePath(BASE);
  back({ ok: status === "completed" ? "Bog‘lanildi deb belgilandi." : "Qayta ochildi." });
}
