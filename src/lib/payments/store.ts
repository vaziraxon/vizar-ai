import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentOrder, PaymentProvider, PaymentStore, PaymentTxn } from "@/lib/payments/types";

/**
 * PaymentStore on Supabase (supabase/payments.sql), with the service role:
 * the provider callbacks have no signed-in user. Paying and refunding go
 * through the database functions so the subscription and the order change
 * together.
 */

type Db = SupabaseClient<any, any, any>;

const TXN_COLUMNS = "id, provider, provider_txn_id, order_id, amount_tiyin, state, reason, provider_time, create_time, perform_time, cancel_time";

const toTxn = (r: Record<string, unknown>): PaymentTxn => ({
  id: Number(r.id),
  provider: r.provider as PaymentProvider,
  provider_txn_id: String(r.provider_txn_id),
  order_id: String(r.order_id),
  amount_tiyin: Number(r.amount_tiyin),
  state: Number(r.state) as PaymentTxn["state"],
  reason: r.reason === null || r.reason === undefined ? null : Number(r.reason),
  provider_time: Number(r.provider_time),
  create_time: Number(r.create_time),
  perform_time: Number(r.perform_time),
  cancel_time: Number(r.cancel_time),
});

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function supabasePaymentStore(): PaymentStore | null {
  const db = createAdminClient() as Db | null;
  if (!db) return null;
  return {
    async getOrder(id) {
      const data = check(await db.from("payment_orders").select("id, user_id, plan, amount_tiyin, provider, status").eq("id", id).maybeSingle());
      return data ? ({ ...data, amount_tiyin: Number(data.amount_tiyin) } as PaymentOrder) : null;
    },
    async getTxn(provider, providerTxnId) {
      const data = check(await db.from("payment_transactions").select(TXN_COLUMNS).eq("provider", provider).eq("provider_txn_id", providerTxnId).maybeSingle());
      return data ? toTxn(data) : null;
    },
    async getTxnById(id) {
      if (!Number.isSafeInteger(id) || id <= 0) return null;
      const data = check(await db.from("payment_transactions").select(TXN_COLUMNS).eq("id", id).maybeSingle());
      return data ? toTxn(data) : null;
    },
    async getLiveTxn(orderId) {
      const data = check(await db.from("payment_transactions").select(TXN_COLUMNS).eq("order_id", orderId).in("state", [1, 2]).maybeSingle());
      return data ? toTxn(data) : null;
    },
    async createTxn(t) {
      const row = check(await db.from("payment_transactions").insert(t).select(TXN_COLUMNS).single());
      if (!row) throw new Error("insert returned no row");
      return toTxn(row);
    },
    async updateTxn(id, patch) {
      check(await db.from("payment_transactions").update(patch).eq("id", id));
    },
    async markPaid(orderId, paymentRef) {
      check(await db.rpc("grant_paid_subscription", { p_order_id: orderId, p_payment_ref: paymentRef }));
    },
    async markCancelled(orderId) {
      check(await db.rpc("revoke_paid_subscription", { p_order_id: orderId }));
    },
    async listTxns(provider, from, to) {
      const data = check(
        await db
          .from("payment_transactions")
          .select(TXN_COLUMNS)
          .eq("provider", provider)
          .gte("provider_time", from)
          .lte("provider_time", to)
          .order("create_time", { ascending: true })
      );
      return (data ?? []).map(toTxn);
    },
  };
}

/** A new order for the signed-in user (the server sets the price, never the browser) */
export async function createPaymentOrder(input: { userId: string; plan: PaymentOrder["plan"]; amountTiyin: number; provider: PaymentProvider }) {
  const db = createAdminClient() as Db | null;
  if (!db) throw new Error("not configured");
  const data = check(
    await db
      .from("payment_orders")
      .insert({ user_id: input.userId, plan: input.plan, amount_tiyin: input.amountTiyin, provider: input.provider })
      .select("id")
      .single()
  );
  if (!data) throw new Error("insert returned no row");
  return String(data.id);
}
