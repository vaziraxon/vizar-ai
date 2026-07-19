import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getMyProfile(): Promise<DataResult<Profile | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("*")
    .eq("id", ctx.userId)
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function updateMyProfile(
  input: unknown
): Promise<DataResult<Profile>> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const update: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (parsed.data.firstName !== undefined) update.first_name = parsed.data.firstName;
  if (parsed.data.lastName !== undefined) update.last_name = parsed.data.lastName;
  if (parsed.data.phone !== undefined) update.phone = parsed.data.phone || null;
  if (parsed.data.preferredLanguage !== undefined)
    update.preferred_language = parsed.data.preferredLanguage;
  if (parsed.data.accountType !== undefined) update.account_type = parsed.data.accountType;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update(update)
    .eq("id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function markOnboardingComplete(): Promise<DataResult<Profile>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
