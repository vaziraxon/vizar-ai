import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import {
  consultationBookingSchema,
  consultationCancelSchema,
} from "@/lib/validation/schemas";
import type { Database } from "@/types/database";

export type ConsultationRow = Database["public"]["Tables"]["consultations"]["Row"];

export async function listMyConsultations(): Promise<DataResult<ConsultationRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("consultations")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("scheduled_at", { ascending: true });

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

export async function getUpcomingConsultation(): Promise<DataResult<ConsultationRow | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("consultations")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("status", "booked")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

/** Demo booking only — no real specialist availability or payment behind this. */
export async function bookConsultation(input: unknown): Promise<DataResult<ConsultationRow>> {
  const parsed = consultationBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("consultations")
    .insert({
      user_id: ctx.userId,
      application_id: parsed.data.applicationId ?? null,
      specialist_name: parsed.data.specialistName,
      scheduled_at: parsed.data.scheduledAt,
      notes: parsed.data.notes ?? null,
    })
    .select("*")
    .single();

  if (error) return genericDbError();

  await ctx.supabase.from("notifications").insert({
    user_id: ctx.userId,
    type: "consultation_reminder",
    title: "Konsultatsiya band qilindi",
    message: `${parsed.data.specialistName} bilan konsultatsiyangiz tasdiqlandi.`,
  });

  return { ok: true, data };
}

export async function cancelConsultation(input: unknown): Promise<DataResult<ConsultationRow>> {
  const parsed = consultationCancelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "db_error", error: "Noto'g'ri so'rov." };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("consultations")
    .update({ status: "cancelled" })
    .eq("id", parsed.data.consultationId)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
