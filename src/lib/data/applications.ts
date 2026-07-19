import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import {
  applicationCreateSchema,
  applicationUpdateSchema,
} from "@/lib/validation/schemas";
import type { Database } from "@/types/database";

export type VisaApplication = Database["public"]["Tables"]["visa_applications"]["Row"];

export async function listMyApplications(): Promise<DataResult<VisaApplication[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("visa_applications")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

export async function getLatestApplication(): Promise<DataResult<VisaApplication | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("visa_applications")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function getApplicationById(
  applicationId: string
): Promise<DataResult<VisaApplication | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("visa_applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", ctx.userId) // never trust the id alone — RLS also enforces this
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function getLatestDraftApplication(): Promise<DataResult<VisaApplication | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("visa_applications")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function createApplication(
  input: unknown
): Promise<DataResult<VisaApplication>> {
  const parsed = applicationCreateSchema.safeParse(input);
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
    .from("visa_applications")
    .insert({
      user_id: ctx.userId,
      destination_country: parsed.data.destinationCountry,
      visa_type: parsed.data.visaType,
      travel_purpose: parsed.data.travelPurpose ?? null,
      travel_date: parsed.data.travelDate ?? null,
    })
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function updateApplication(
  input: unknown
): Promise<DataResult<VisaApplication>> {
  const parsed = applicationUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const update: Database["public"]["Tables"]["visa_applications"]["Update"] = {};
  if (parsed.data.destinationCountry !== undefined)
    update.destination_country = parsed.data.destinationCountry;
  if (parsed.data.visaType !== undefined) update.visa_type = parsed.data.visaType;
  if (parsed.data.travelPurpose !== undefined) update.travel_purpose = parsed.data.travelPurpose;
  if (parsed.data.travelDate !== undefined) update.travel_date = parsed.data.travelDate;
  if (parsed.data.status !== undefined) update.status = parsed.data.status;

  const { data, error } = await ctx.supabase
    .from("visa_applications")
    .update(update)
    .eq("id", parsed.data.applicationId)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}

/** Only draft applications may be deleted — enforced here AND by the caller's confirmation UI. */
export async function deleteDraftApplication(
  applicationId: string
): Promise<DataResult<null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("visa_applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", ctx.userId)
    .eq("status", "draft");

  if (error) return genericDbError();
  return { ok: true, data: null };
}

export async function updateReadinessScore(
  applicationId: string,
  score: number
): Promise<DataResult<VisaApplication>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  const { data, error } = await ctx.supabase
    .from("visa_applications")
    .update({ readiness_score: clamped })
    .eq("id", applicationId)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
