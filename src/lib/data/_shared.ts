import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DataResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      reason: "not_configured" | "unauthenticated" | "db_error";
    };

type AuthedContext =
  | {
      ok: false;
      reason: "not_configured" | "unauthenticated";
      error: string;
    }
  | {
      ok: true;
      supabase: SupabaseClient<Database>;
      userId: string;
    };

/**
 * Every function in src/lib/data/*.ts calls this first.
 */
export async function getAuthedContext(): Promise<AuthedContext> {
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

  return {
    ok: true,
    supabase,
    userId: user.id,
  };
}

/**
 * Maps a Supabase error to a safe Uzbek message.
 */
export function genericDbError(): DataResult<never> {
  return {
    ok: false,
    reason: "db_error",
    error:
      "Ma'lumotlarni yuklab yoki saqlab bo'lmadi. Birozdan so'ng qayta urinib ko'ring.",
  };
}
  

