"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { DESTINATION_BY_SLUG } from "@/lib/site/registry";
import { REVIEW_SPAM, REVIEWABLE_TOOLS } from "@/lib/site/testimonials";

// Untyped client: same reason as src/lib/testimonials/admin.ts
type Client = SupabaseClient<any, any, any>;

export type MyReview = { name: string; destination: string; tool: string; rating: number; quote: string; published: boolean };
export type MyReviewState = { signedIn: false } | { signedIn: true; review: MyReview | null; suggestedName: string };
export type MyReviewInput = { name: string; destination: string; tool: string; rating: number; quote: string; locale: string; consent: boolean };
export type MyReviewResult = { ok: true; published: boolean } | { ok: false; error: "signin" | "confirm" | "links" | "invalid" | "failed" };

async function session() {
  const supabase = createClient() as Client | null;
  if (!supabase) return { supabase: null, user: null } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user } as const;
}

/** What the review dialog needs: is someone signed in, and their review if they already wrote one. */
export async function getMyReviewAction(): Promise<MyReviewState> {
  const { supabase, user } = await session();
  if (!supabase || !user) return { signedIn: false };
  const [{ data: review }, { data: profile }] = await Promise.all([
    supabase
      .from("testimonials")
      .select("name, destination, tool, rating, quote, published")
      .eq("user_id", user.id)
      .maybeSingle<MyReview>(),
    supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle<{ first_name: string | null; last_name: string | null }>(),
  ]);
  // "Dilnoza R." — first name plus the initial of the last name
  const first = profile?.first_name?.trim() ?? "";
  const last = profile?.last_name?.trim() ?? "";
  const suggestedName = [first, last ? `${last[0]!.toUpperCase()}.` : ""].filter(Boolean).join(" ");
  return { signedIn: true, review: review ?? null, suggestedName };
}

/** Publish or update the signed-in customer's own review (free, one per account). */
export async function submitMyReviewAction(input: MyReviewInput): Promise<MyReviewResult> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const quote = input.quote.trim().replace(/\s+/g, " ");
  const valid =
    input.consent === true &&
    name.length >= 2 &&
    name.length <= 40 &&
    quote.length >= 10 &&
    quote.length <= 600 &&
    input.destination in DESTINATION_BY_SLUG &&
    (REVIEWABLE_TOOLS as readonly string[]).includes(input.tool) &&
    Number.isInteger(input.rating) &&
    input.rating >= 1 &&
    input.rating <= 5;
  if (!valid) return { ok: false, error: "invalid" };
  if (REVIEW_SPAM.test(quote) || REVIEW_SPAM.test(name)) return { ok: false, error: "links" };

  const { supabase, user } = await session();
  if (!supabase || !user) return { ok: false, error: "signin" };

  const { data: id, error } = await supabase.rpc("submit_my_testimonial", {
    p_name: name,
    p_destination: input.destination,
    p_tool: input.tool,
    p_rating: input.rating,
    p_quote: quote,
    p_locale: ["uz", "ru", "en"].includes(input.locale) ? input.locale : null,
  });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("links_not_allowed")) return { ok: false, error: "links" };
    if (message.includes("email_not_confirmed")) return { ok: false, error: "confirm" };
    if (message.includes("not_signed_in")) return { ok: false, error: "signin" };
    if (message.includes("invalid_review") || error.code === "23514") return { ok: false, error: "invalid" };
    console.error("[my-review] submit failed:", message);
    return { ok: false, error: "failed" };
  }
  // An editor may have hidden this review earlier — editing keeps it hidden
  const { data: row } = await supabase.from("testimonials").select("published").eq("id", id as string).maybeSingle<{ published: boolean }>();
  revalidatePath("/");
  return { ok: true, published: row?.published ?? true };
}

export async function deleteMyReviewAction(): Promise<{ ok: boolean }> {
  const { supabase, user } = await session();
  if (!supabase || !user) return { ok: false };
  const { error } = await supabase.from("testimonials").delete().eq("user_id", user.id);
  if (error) return { ok: false };
  revalidatePath("/");
  return { ok: true };
}
