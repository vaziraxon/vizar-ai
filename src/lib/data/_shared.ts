import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; reason: "not_configured" | "unauthenticated" | "db_error" };

/**
 * Every function in src/lib/data/*.ts calls this first. It:
 *  1. Confirms Supabase is configured (returns a typed "not_configured"
 *     result instead of throwing, so pages can render the fallback
 *     notice — see SupabaseSetupNotice).
 *  2. Reads the authenticated user from the current session (never
 *     from a client-supplied value).
 *
 * This is the ONLY place in the codebase that should call
 * `supabase.auth.getUser()` for the purpose of authorizing a data
 * operation — every other data-layer function should call this
 * helper rather than re-implement the check.
 */
export async function getAuthedContext(): Promise<
  | { ok: true; supabase: SupabaseClient<Database>; userId: string }
  | { ok: false; error: string; reason: "not_configured" | "unauthenticated" }
> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      error: "Supabase sozlanmagan.",
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      ok: false,
      reason: "not_configured",
      error: "Supabase sozlanmagan.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      reason: "unauthenticated",
      error: "Tizimga kirmagansiz.",
    };
  }

  return { ok: true, supabase, userId: user.id };
}

/**
 * Maps a Postgres/Supabase error to a generic, safe-to-display Uzbek
 * message. Never forward `error.message` from Supabase directly to
 * the UI — it can contain internal schema/query details.
 */
export function genericDbError(): DataResult<never> {
  return {
    ok: false,
    reason: "db_error",
    error: "Ma'lumotlarni yuklab yoki saqlab bo'lmadi. Birozdan so'ng qayta urinib ko'ring.",
  };
}
