import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { DESTINATION_BY_SLUG, TOOL_BY_ID, type DestinationSlug, type ToolId } from "@/lib/site/registry";
import type { Testimonial } from "@/lib/site/testimonials";
import type { Database } from "@/types/database";

type PublicRow = Pick<
  Database["public"]["Tables"]["testimonials"]["Row"],
  "id" | "name" | "avatar_url" | "destination" | "tool" | "rating" | "quote" | "locale" | "photo_url" | "created_at"
>;

/**
 * Published, consented reviews for the landing page. A cookie-less anon
 * client keeps the page static (ISR); RLS and column grants return only
 * published, consented rows and their public columns. Any failure — table
 * not created yet, network — means "no reviews", never a broken page.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const env = getSupabaseEnv();
  if (!env) return [];
  const supabase = createClient(env.url, env.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, avatar_url, destination, tool, rating, quote, locale, photo_url, created_at")
    .eq("published", true)
    .eq("consent_given", true)
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(24)
    .returns<PublicRow[]>();
  if (error) {
    console.warn("[testimonials] not loaded:", error.message);
    return [];
  }
  return (data ?? [])
    .filter((r) => r.destination in DESTINATION_BY_SLUG && r.tool in TOOL_BY_ID)
    .map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar_url ?? undefined,
      destination: r.destination as DestinationSlug,
      tool: r.tool as ToolId,
      rating: r.rating && r.rating >= 1 && r.rating <= 5 ? (r.rating as Testimonial["rating"]) : undefined,
      quote: r.quote,
      locale: r.locale ?? undefined,
      photo: r.photo_url ?? undefined,
      date: r.created_at,
    }));
}
