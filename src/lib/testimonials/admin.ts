import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/authz";
import type { Database } from "@/types/database";

// Same convention as src/lib/knowledge/admin.ts: the Database generics
// collapse row types to `never` with this supabase-js version, so queries are
// typed explicitly with the row aliases below.
export type SiteClient = SupabaseClient<any, any, any>;

type Tables = Database["public"]["Tables"];
export type TestimonialRow = Tables["testimonials"]["Row"];
export type ConsentRow = Tables["testimonial_consents"]["Row"];

/** Public Storage bucket for review avatars and travel photos (supabase/testimonials.sql). */
export const MEDIA_BUCKET = "testimonials";
/** Two photos must fit in one server-action request (limit set in next.config.mjs). */
export const MEDIA_MAX_BYTES = 1.5 * 1024 * 1024;
export const MEDIA_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * Who is looking at /admin/testimonials. Two independent gates must both pass
 * to edit: ADMIN_EMAILS (also enforced by middleware) and a site_editors row
 * (enforced by RLS in the database).
 */
export async function getTestimonialEditorContext() {
  const supabase = createClient() as SiteClient | null;
  if (!supabase) return { supabase: null, userId: null, email: null, isAdmin: false, isEditor: false } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const { data: isEditor } = user ? await supabase.rpc("is_site_editor") : { data: false };
  return { supabase, userId: user?.id ?? null, email: user?.email ?? null, isAdmin, isEditor: isEditor === true } as const;
}

/** Storage path of a file in the media bucket, or null for other URLs (e.g. stock destination photos). */
export function mediaPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
}
