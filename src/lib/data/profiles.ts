import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { getSupabaseEnv } from "@/lib/supabase/config";
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

/**
 * Points the profile at a photo the user uploaded to their own folder of the
 * "avatars" bucket (src/lib/profile/avatar.ts), or clears it with null. Any
 * other URL is refused, so a profile can't point at someone else's file.
 */
export async function updateMyAvatar(url: string | null): Promise<DataResult<Profile>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  if (url !== null) {
    const base = `${getSupabaseEnv()?.url}/storage/v1/object/public/avatars/${ctx.userId}/`;
    if (!url.startsWith(base) || !/^avatar-\d{10,16}\.jpg$/.test(url.slice(base.length))) {
      return { ok: false, reason: "db_error", error: "Rasm manzili noto'g'ri." };
    }
  }

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update({ avatar_url: url })
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
