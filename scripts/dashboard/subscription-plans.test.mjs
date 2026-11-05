// Unit tests for the plans a user can request on /dashboard/subscription.
//
//   node --experimental-strip-types --test scripts/dashboard/subscription-plans.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PLAN_DAYS, SUBSCRIPTION_PLANS, isSubscriptionPlan, subscriptionHref } from "../../src/lib/dashboard/subscription-plans.ts";

test("only the four plans are accepted", () => {
  for (const plan of SUBSCRIPTION_PLANS) assert.equal(isSubscriptionPlan(plan), true);
  for (const value of ["free", "Premium", "", null, undefined, 7]) assert.equal(isSubscriptionPlan(value), false);
});

test("a plan's button opens the request form with that plan picked, as a path", () => {
  assert.equal(subscriptionHref("premium"), "/dashboard/subscription/premium");
  assert.equal(subscriptionHref(), "/dashboard/subscription");
});

test("plan days match subscription_plan_days() in the database", () => {
  const sql = readFileSync(new URL("../../supabase/kb_library_access.sql", import.meta.url), "utf8");
  const days = sql.match(/when 'standard' then (\d+) when 'premium' then (\d+) when 'pro' then (\d+)/);
  assert.ok(days, "subscription_plan_days() not found");
  assert.deepEqual([PLAN_DAYS.standard, PLAN_DAYS.premium, PLAN_DAYS.pro], days.slice(1).map(Number));
  assert.equal(PLAN_DAYS.vip, null);
});

test("the request table accepts exactly these plans", () => {
  const sql = readFileSync(new URL("../../supabase/subscription_requests.sql", import.meta.url), "utf8");
  assert.match(sql, /plan text not null check \(plan in \('standard','premium','pro','vip'\)\)/);
});
