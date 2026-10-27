import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { KbClient } from "./admin";

export type SubscriptionPlan = "standard" | "premium" | "pro" | "vip";

export interface ActiveSubscription {
  plan: SubscriptionPlan;
  startsAt: string;
  expiresAt: string;
}

/**
 * Who is looking at the "Viza ma'lumotlar bazasi" library and what they may
 * read. `hasAccess` comes from public.kb_has_access() — the same function
 * the RLS policies on kb_sections / kb_chunks / kb_country_rules and the
 * kb-search Edge Function use — so the UI never grants more than the
 * database does. It turns false the moment the subscription's expires_at
 * passes.
 */
export interface LibraryViewer {
  supabase: KbClient | null;
  user: { id: string; email: string | null } | null;
  hasAccess: boolean;
  subscription: ActiveSubscription | null;
  /** The caller's JWT, forwarded to kb-search so it can check access itself. */
  accessToken: string | null;
}

/** Once per request (shared by generateMetadata and the page). */
export const getLibraryViewer = cache(async (): Promise<LibraryViewer> => {
  const supabase = createClient() as KbClient | null;
  if (!supabase) return { supabase: null, user: null, hasAccess: false, subscription: null, accessToken: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, hasAccess: false, subscription: null, accessToken: null };

  const [access, sub, session] = await Promise.all([
    supabase.rpc("kb_has_access"),
    supabase.rpc("my_active_subscription"),
    supabase.auth.getSession(),
  ]);
  const row = ((sub.data ?? []) as { plan: SubscriptionPlan; starts_at: string; expires_at: string }[])[0];
  return {
    supabase,
    user: { id: user.id, email: user.email ?? null },
    hasAccess: !access.error && access.data === true,
    subscription: row ? { plan: row.plan, startsAt: row.starts_at, expiresAt: row.expires_at } : null,
    accessToken: session.data.session?.access_token ?? null,
  };
});
