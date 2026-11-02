import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import {
  consultationRequestSchema,
  consultationCancelSchema,
} from "@/lib/validation/schemas";
import { encodeRequest } from "@/lib/dashboard/consultation-request";
import { rateLimit } from "@/lib/rate-limit";
import type { Database } from "@/types/database";

export type ConsultationRow = Database["public"]["Tables"]["consultations"]["Row"];

export async function listMyConsultations(): Promise<DataResult<ConsultationRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("consultations")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

/** The user's newest request that nobody has answered or cancelled yet. */
export async function getOpenConsultationRequest(): Promise<DataResult<ConsultationRow | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("consultations")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("status", "booked")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

/**
 * Saves a request for a site editor to answer (see /admin/consultations). There
 * is no calendar or payment: the editor contacts the user the way they asked.
 */
export async function requestConsultation(input: unknown): Promise<DataResult<ConsultationRow>> {
  const parsed = consultationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const limit = await rateLimit(`consultation-request:${ctx.userId}`, 5, 24 * 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, reason: "db_error", error: "Bugun juda ko'p so'rov yubordingiz. Ertaga qayta urinib ko'ring." };
  }

  const { data, error } = await ctx.supabase
    .from("consultations")
    .insert({
      user_id: ctx.userId,
      notes: encodeRequest(parsed.data),
    })
    .select("*")
    .single();

  if (error) return genericDbError();

  await ctx.supabase.from("notifications").insert({
    user_id: ctx.userId,
    type: "consultation_reminder",
    title: "Konsultatsiya so'rovi yuborildi",
    message: "Siz yozgan aloqa orqali bog'lanamiz.",
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
