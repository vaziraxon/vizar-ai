/**
 * Shared shapes for online payments (supabase/payments.sql). The provider
 * handlers work against PaymentStore, so they run the same way on the real
 * database and on the in-memory store the tests use.
 */

export type PaymentProvider = "payme" | "click";
export type PayablePlan = "standard" | "premium" | "pro";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface PaymentOrder {
  id: string;
  user_id: string;
  plan: PayablePlan;
  amount_tiyin: number;
  provider: PaymentProvider;
  status: OrderStatus;
}

/** Payme states: 1 created, 2 performed, -1 cancelled, -2 cancelled after perform */
export type TxnState = 1 | 2 | -1 | -2;

export interface PaymentTxn {
  id: number;
  provider: PaymentProvider;
  provider_txn_id: string;
  order_id: string;
  amount_tiyin: number;
  state: TxnState;
  reason: number | null;
  /** Payme's own `time` of the transaction (ms) */
  provider_time: number;
  create_time: number;
  perform_time: number;
  cancel_time: number;
}

export interface PaymentStore {
  getOrder(id: string): Promise<PaymentOrder | null>;
  getTxn(provider: PaymentProvider, providerTxnId: string): Promise<PaymentTxn | null>;
  getTxnById(id: number): Promise<PaymentTxn | null>;
  /** The order's created or performed transaction, if any */
  getLiveTxn(orderId: string): Promise<PaymentTxn | null>;
  createTxn(txn: Omit<PaymentTxn, "id">): Promise<PaymentTxn>;
  updateTxn(id: number, patch: Partial<Omit<PaymentTxn, "id">>): Promise<void>;
  /** Paid: opens the library (grant_paid_subscription). Idempotent. */
  markPaid(orderId: string, paymentRef: string): Promise<void>;
  /** Cancelled before payment, or refunded after (revoke_paid_subscription) */
  markCancelled(orderId: string): Promise<void>;
  listTxns(provider: PaymentProvider, from: number, to: number): Promise<PaymentTxn[]>;
}
