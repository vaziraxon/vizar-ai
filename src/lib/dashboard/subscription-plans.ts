/**
 * Plans a user can ask for on /dashboard/subscription. Until online payment
 * is connected, a request is approved by a site editor in
 * /admin/subscriptions (supabase/subscription_requests.sql).
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
export const SUBSCRIPTION_PLANS = ["standard", "premium", "pro", "vip"] as const;
export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLANS)[number];

export const isSubscriptionPlan = (value: unknown): value is SubscriptionPlanId =>
  typeof value === "string" && (SUBSCRIPTION_PLANS as readonly string[]).includes(value);

/** Days of library access per plan, as in subscription_plan_days(); VIP is agreed one by one. */
export const PLAN_DAYS: Record<SubscriptionPlanId, number | null> = { standard: 7, premium: 30, pro: 45, vip: null };

/** Where a plan's "Tanlash" button leads: the request form with that plan picked. */
export const subscriptionHref = (plan?: SubscriptionPlanId) => (plan ? `/dashboard/subscription/${plan}` : "/dashboard/subscription");

/** subscription_requests.status as the user sees it; Uzbek source strings for StatusBadge */
export const SUBSCRIPTION_REQUEST_STATUS: Record<string, string> = {
  pending: "Kutilmoqda",
  approved: "Faollashtirildi",
  declined: "Rad etildi",
  cancelled: "Bekor qilindi",
};
