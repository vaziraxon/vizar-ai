import type { Metadata } from "next";
import { AdminHome, type AdminStats, type AdminStatsState } from "@/components/admin/AdminHome";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin panel", robots: { index: false } };

export default async function AdminPage() {
  // Site editors manage testimonials, requests and see these numbers alike.
  const ctx = await getTestimonialEditorContext();

  let state: AdminStatsState;
  if (!ctx.supabase) state = { ok: false, reason: "not_configured" };
  else if (!ctx.isEditor) state = { ok: false, reason: "not_editor" };
  else {
    const { data, error } = await ctx.supabase.rpc("admin_site_stats");
    state = error || !data ? { ok: false, reason: "unavailable" } : { ok: true, stats: data as AdminStats };
  }

  return <AdminHome state={state} />;
}
