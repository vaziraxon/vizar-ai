import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SubscriptionPageClient } from "@/components/dashboard/SubscriptionPageClient";
import { ErrorState } from "@/components/states/ErrorState";
import { isSubscriptionPlan } from "@/lib/dashboard/subscription-plans";
import { getMyActiveSubscription, listMySubscriptionRequests } from "@/lib/data/subscriptions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { MySubscription, SubscriptionRequestRow } from "@/lib/data/subscriptions";

const TITLE = "Obuna";
const SUBTITLE = "Kitobning to'liq matniga obuna: tarifni tanlang — jamoamiz siz bilan bog'lanadi.";

// /dashboard/subscription, or /dashboard/subscription/premium with that plan picked
// (a path, not ?plan=, so it survives the sign-in redirect)
export default async function SubscriptionPage({ params }: { params: { plan?: string[] } }) {
  const picked = params.plan?.[0];
  if (params.plan && (params.plan.length > 1 || !isSubscriptionPlan(picked))) notFound();

  let active: MySubscription | null = null;
  let requests: SubscriptionRequestRow[] = [];

  if (isSupabaseConfigured()) {
    const [activeResult, requestsResult] = await Promise.all([getMyActiveSubscription(), listMySubscriptionRequests()]);
    if (!activeResult.ok || !requestsResult.ok) {
      const error = !activeResult.ok ? activeResult.error : !requestsResult.ok ? requestsResult.error : "";
      return (
        <DashboardShell title={TITLE} subtitle={SUBTITLE}>
          <ErrorState description={error} />
        </DashboardShell>
      );
    }
    active = activeResult.data;
    requests = requestsResult.data;
  }

  return (
    <DashboardShell title={TITLE} subtitle={SUBTITLE}>
      <SubscriptionPageClient initialPlan={isSubscriptionPlan(picked) ? picked : undefined} active={active} requests={requests} />
    </DashboardShell>
  );
}
