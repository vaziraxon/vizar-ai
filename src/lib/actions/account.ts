"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { STORAGE_BUCKET } from "@/lib/document-constraints";
import { createClient } from "@/lib/supabase/server";

// Same loose typing as src/lib/data/*: the Database type has no Functions entry for rpc().
type AnyClient = SupabaseClient<any, any, any>;

/** Buckets that keep files under "{user id}/…"; avatars are added with supabase/avatars.sql. */
const USER_BUCKETS = [STORAGE_BUCKET, "avatars"];

/** Deletes everything under the user's folder. A missing bucket just lists nothing. */
async function removeUserFiles(supabase: AnyClient, bucket: string, userId: string) {
  const paths: string[] = [];
  async function walk(dir: string, depth: number) {
    const { data } = await supabase.storage.from(bucket).list(dir, { limit: 1000 });
    for (const item of data ?? []) {
      const path = `${dir}/${item.name}`;
      // Files have an id; folders (e.g. one per application) don't.
      if (item.id) paths.push(path);
      else if (depth < 3) await walk(path, depth + 1);
    }
  }
  await walk(userId, 0);
  if (paths.length) await supabase.storage.from(bucket).remove(paths);
}

/**
 * Deletes the signed-in user's account for good: their files first (SQL can't
 * delete Storage objects), then the account through public.delete_my_account
 * (supabase/account_deletion.sql), which cascades to all their rows.
 * The user confirms by typing their own email.
 */
export async function deleteMyAccountAction(confirmEmail: string): Promise<{ ok: false; error: string }> {
  const supabase = createClient() as AnyClient | null;
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Avval tizimga kiring." };
  if (!user.email || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false, error: "Email mos kelmadi." };
  }

  for (const bucket of USER_BUCKETS) await removeUserFiles(supabase, bucket, user.id);

  const { error } = await supabase.rpc("delete_my_account", { p_confirm: "DELETE" });
  if (error) return { ok: false, error: "Hisobni o'chirib bo'lmadi. Keyinroq qayta urinib ko'ring." };

  // The session belongs to a user that no longer exists; clear its cookies.
  await supabase.auth.signOut().catch(() => undefined);
  redirect("/");
}
