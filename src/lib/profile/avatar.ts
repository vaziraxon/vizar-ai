"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { setMyAvatarAction } from "@/lib/actions/profiles";
import { createClient } from "@/lib/supabase/client";

/**
 * Profile photos in the public "avatars" bucket (supabase/avatars.sql), one
 * folder per user. Photos are cropped to a centred square and scaled to 512 px
 * JPEG in the browser, so any phone photo fits the bucket's 1 MB limit.
 * Error strings are Uzbek source text (translated in the UI).
 */
export const AVATAR_BUCKET = "avatars";
/** Fired on window with the new URL (or null) so the top bar updates at once. */
export const AVATAR_EVENT = "vizar-avatar-changed";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const SIZE = 512;

export type AvatarResult = { ok: true; url: string | null } | { ok: false; error: string };

async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(SIZE, side);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/jpeg", 0.85)
  );
}

async function signedInStorage() {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase sozlanmagan." } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Avval tizimga kiring." } as const;
  return { bucket: supabase.storage.from(AVATAR_BUCKET), userId: user.id } as const;
}

type Bucket = ReturnType<SupabaseClient["storage"]["from"]>;

/** Deletes the user's older photos, keeping `keep` if given. */
async function removeOthers(bucket: Bucket, userId: string, keep?: string) {
  const { data } = await bucket.list(userId);
  const old = (data ?? []).map((f) => `${userId}/${f.name}`).filter((path) => path !== keep);
  if (old.length) await bucket.remove(old);
}

export async function uploadAvatar(file: File): Promise<AvatarResult> {
  if (!TYPES.includes(file.type)) return { ok: false, error: "Faqat JPG, PNG yoki WEBP rasm yuklang." };
  if (file.size > MAX_INPUT_BYTES) return { ok: false, error: "Rasm 8 MB dan oshmasin." };

  const ctx = await signedInStorage();
  if ("error" in ctx) return { ok: false, error: ctx.error ?? "" };

  let photo: Blob;
  try {
    photo = await toSquareJpeg(file);
  } catch {
    return { ok: false, error: "Rasmni o'qib bo'lmadi. Boshqa rasm tanlang." };
  }

  const path = `${ctx.userId}/avatar-${Date.now()}.jpg`;
  const { error } = await ctx.bucket.upload(path, photo, { contentType: "image/jpeg", upsert: false });
  if (error) return { ok: false, error: "Rasmni yuklab bo'lmadi. Qayta urinib ko'ring." };

  const url = ctx.bucket.getPublicUrl(path).data.publicUrl;
  const saved = await setMyAvatarAction(url);
  if (!saved.ok) {
    await ctx.bucket.remove([path]);
    return { ok: false, error: saved.error };
  }
  await removeOthers(ctx.bucket, ctx.userId, path);
  window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: url }));
  return { ok: true, url };
}

export async function removeAvatar(): Promise<AvatarResult> {
  const ctx = await signedInStorage();
  if ("error" in ctx) return { ok: false, error: ctx.error ?? "" };
  const saved = await setMyAvatarAction(null);
  if (!saved.ok) return { ok: false, error: saved.error };
  await removeOthers(ctx.bucket, ctx.userId);
  window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: null }));
  return { ok: true, url: null };
}
