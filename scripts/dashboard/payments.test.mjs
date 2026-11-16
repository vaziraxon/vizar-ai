// Payme Merchant API and Click Shop API handlers against an in-memory store:
// the Payme sandbox scenarios (bad auth, wrong amount, unknown order, create →
// perform → cancel, repeats answered identically, 12-hour timeout) and the
// Click prepare → complete flow with signatures. No network, no database.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { handlePayme, PAYME_TIMEOUT_MS } from "../../src/lib/payments/payme.ts";
import { clickSign, handleClick } from "../../src/lib/payments/click.ts";
import { PLAN_PRICE_UZS, availableProviders, paymentsConfig, toTiyin } from "../../src/lib/payments/config.ts";
import { clickCheckoutUrl, paymeCheckoutUrl } from "../../src/lib/payments/checkout.ts";

const ORDER = "11111111-2222-4333-8444-555555555555";
const ORDER2 = "11111111-2222-4333-8444-666666666666";

function memoryStore(orders) {
  const txns = [];
  const paid = [];
  const cancelled = [];
  let next = 1;
  return {
    txns,
    paid,
    cancelled,
    orders,
    async getOrder(id) {
      return orders.find((o) => o.id === id) ?? null;
    },
    async getTxn(provider, pid) {
      return txns.find((t) => t.provider === provider && t.provider_txn_id === pid) ?? null;
    },
    async getTxnById(id) {
      return txns.find((t) => t.id === id) ?? null;
    },
    async getLiveTxn(orderId) {
      return txns.find((t) => t.order_id === orderId && (t.state === 1 || t.state === 2)) ?? null;
    },
    async createTxn(t) {
      const row = { ...t, id: next++ };
      txns.push(row);
      return row;
    },
    async updateTxn(id, patch) {
      Object.assign(txns.find((t) => t.id === id), patch);
    },
    async markPaid(orderId, ref) {
      paid.push({ orderId, ref });
      orders.find((o) => o.id === orderId).status = "paid";
    },
    async markCancelled(orderId) {
      cancelled.push(orderId);
      const o = orders.find((x) => x.id === orderId);
      o.status = o.status === "paid" ? "refunded" : "cancelled";
    },
    async listTxns(provider, from, to) {
      return txns.filter((t) => t.provider === provider && t.provider_time >= from && t.provider_time <= to);
    },
  };
}

const order = (id, provider, plan = "premium") => ({ id, user_id: "u1", plan, amount_tiyin: toTiyin(PLAN_PRICE_UZS[plan]), provider, status: "pending" });

// ---------------------------------------------------------------- Payme
const PAYME = { merchantId: "m-test", key: "secret-key", testMode: true };
const AUTH = `Basic ${Buffer.from("Paycom:secret-key").toString("base64")}`;
const rpc = (method, params, id = 1) => ({ jsonrpc: "2.0", id, method, params });
const NOW = Date.parse("2026-11-16T10:00:00Z");
const AMOUNT = 17_900_000; // 179 000 so'm in tiyin

test("prices: 49 000 / 179 000 / 679 000 so'm, in tiyin for the providers", () => {
  assert.deepEqual(PLAN_PRICE_UZS, { standard: 49_000, premium: 179_000, pro: 679_000 });
  assert.equal(toTiyin(179_000), AMOUNT);
});

test("payments are off unless PAYMENTS_ENABLED=true and a provider's keys are all set", () => {
  assert.deepEqual(availableProviders(paymentsConfig({})), []);
  assert.deepEqual(availableProviders(paymentsConfig({ PAYME_MERCHANT_ID: "m", PAYME_KEY: "k" })), []);
  const on = paymentsConfig({ PAYMENTS_ENABLED: "true", PAYME_MERCHANT_ID: "m", PAYME_KEY: "k", CLICK_SERVICE_ID: "1", CLICK_MERCHANT_ID: "2" });
  assert.deepEqual(availableProviders(on), ["payme"]);
  // Test mode uses the sandbox key
  const test = paymentsConfig({ PAYMENTS_ENABLED: "true", PAYME_MERCHANT_ID: "m", PAYME_KEY: "live", PAYME_TEST_KEY: "sandbox", PAYME_TEST_MODE: "true" });
  assert.equal(test.payme.key, "sandbox");
});

test("Payme: off or wrong key → -32504", async () => {
  const store = memoryStore([order(ORDER, "payme")]);
  const body = rpc("CheckPerformTransaction", { amount: AMOUNT, account: { order_id: ORDER } });
  assert.equal((await handlePayme(body, AUTH, null, store, NOW)).error.code, -32504);
  const wrong = `Basic ${Buffer.from("Paycom:nope").toString("base64")}`;
  assert.equal((await handlePayme(body, wrong, PAYME, store, NOW)).error.code, -32504);
  assert.equal((await handlePayme(body, null, PAYME, store, NOW)).error.code, -32504);
  const otherLogin = `Basic ${Buffer.from("Other:secret-key").toString("base64")}`;
  assert.equal((await handlePayme(body, otherLogin, PAYME, store, NOW)).error.code, -32504);
});

test("Payme: wrong amount → -31001, unknown order → -31050 with data order_id, errors in ru/uz/en", async () => {
  const store = memoryStore([order(ORDER, "payme")]);
  const wrongAmount = await handlePayme(rpc("CheckPerformTransaction", { amount: 100, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW);
  assert.equal(wrongAmount.error.code, -31001);
  assert.deepEqual(Object.keys(wrongAmount.error.message).sort(), ["en", "ru", "uz"]);
  const missing = await handlePayme(rpc("CreateTransaction", { id: "p1", time: NOW, amount: AMOUNT, account: { order_id: ORDER2 } }), AUTH, PAYME, store, NOW);
  assert.equal(missing.error.code, -31050);
  assert.equal(missing.error.data, "order_id");
  // A Click order can't be paid through Payme
  const clickStore = memoryStore([order(ORDER, "click")]);
  assert.equal((await handlePayme(rpc("CheckPerformTransaction", { amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, clickStore, NOW)).error.code, -31050);
});

test("Payme: check → create → perform opens the library; repeats get the same answers", async () => {
  const store = memoryStore([order(ORDER, "payme")]);
  const check = await handlePayme(rpc("CheckPerformTransaction", { amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW);
  assert.deepEqual(check.result, { allow: true });

  const createParams = { id: "payme-1", time: NOW - 1000, amount: AMOUNT, account: { order_id: ORDER } };
  const created = await handlePayme(rpc("CreateTransaction", createParams), AUTH, PAYME, store, NOW);
  assert.deepEqual(created.result, { create_time: NOW, transaction: "1", state: 1 });
  const createdAgain = await handlePayme(rpc("CreateTransaction", createParams), AUTH, PAYME, store, NOW + 5000);
  assert.deepEqual(createdAgain.result, created.result);

  // A one-time order can't take a second transaction
  const other = await handlePayme(rpc("CreateTransaction", { ...createParams, id: "payme-2" }), AUTH, PAYME, store, NOW);
  assert.equal(other.error.code, -31052);
  assert.equal((await handlePayme(rpc("CheckPerformTransaction", { amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW)).error.code, -31052);

  const performed = await handlePayme(rpc("PerformTransaction", { id: "payme-1" }), AUTH, PAYME, store, NOW + 60_000);
  assert.deepEqual(performed.result, { transaction: "1", perform_time: NOW + 60_000, state: 2 });
  assert.deepEqual(store.paid, [{ orderId: ORDER, ref: "payme:payme-1" }]);
  const performedAgain = await handlePayme(rpc("PerformTransaction", { id: "payme-1" }), AUTH, PAYME, store, NOW + 90_000);
  assert.deepEqual(performedAgain.result, performed.result);
  assert.equal(store.paid.length, 1);

  const checked = await handlePayme(rpc("CheckTransaction", { id: "payme-1" }), AUTH, PAYME, store, NOW);
  assert.deepEqual(checked.result, { create_time: NOW, perform_time: NOW + 60_000, cancel_time: 0, transaction: "1", state: 2, reason: null });

  // Paid order: no new check
  assert.equal((await handlePayme(rpc("CheckPerformTransaction", { amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW)).error.code, -31051);
});

test("Payme: cancel before perform → -1; after perform (refund) → -2 and access withdrawn; repeats unchanged", async () => {
  const store = memoryStore([order(ORDER, "payme"), order(ORDER2, "payme")]);
  await handlePayme(rpc("CreateTransaction", { id: "a", time: NOW, amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW);
  const c1 = await handlePayme(rpc("CancelTransaction", { id: "a", reason: 3 }), AUTH, PAYME, store, NOW + 10);
  assert.deepEqual(c1.result, { transaction: "1", cancel_time: NOW + 10, state: -1 });
  const c1again = await handlePayme(rpc("CancelTransaction", { id: "a", reason: 3 }), AUTH, PAYME, store, NOW + 99);
  assert.deepEqual(c1again.result, c1.result);
  assert.equal((await handlePayme(rpc("PerformTransaction", { id: "a" }), AUTH, PAYME, store, NOW)).error.code, -31008);

  await handlePayme(rpc("CreateTransaction", { id: "b", time: NOW, amount: AMOUNT, account: { order_id: ORDER2 } }), AUTH, PAYME, store, NOW);
  await handlePayme(rpc("PerformTransaction", { id: "b" }), AUTH, PAYME, store, NOW + 20);
  const c2 = await handlePayme(rpc("CancelTransaction", { id: "b", reason: 5 }), AUTH, PAYME, store, NOW + 30);
  assert.deepEqual(c2.result, { transaction: "2", cancel_time: NOW + 30, state: -2 });
  assert.equal(store.orders.find((o) => o.id === ORDER2).status, "refunded");
  assert.equal((await handlePayme(rpc("CheckTransaction", { id: "b" }), AUTH, PAYME, store, NOW)).result.reason, 5);
});

test("Payme: a created transaction older than 12 hours is cancelled with reason 4", async () => {
  const store = memoryStore([order(ORDER, "payme")]);
  await handlePayme(rpc("CreateTransaction", { id: "late", time: NOW, amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW);
  const res = await handlePayme(rpc("PerformTransaction", { id: "late" }), AUTH, PAYME, store, NOW + PAYME_TIMEOUT_MS + 1);
  assert.equal(res.error.code, -31008);
  const t = store.txns[0];
  assert.equal(t.state, -1);
  assert.equal(t.reason, 4);
  assert.equal(store.paid.length, 0);
});

test("Payme: unknown transaction → -31003, unknown method → -32601, statement lists by time", async () => {
  const store = memoryStore([order(ORDER, "payme")]);
  assert.equal((await handlePayme(rpc("CheckTransaction", { id: "x" }), AUTH, PAYME, store, NOW)).error.code, -31003);
  assert.equal((await handlePayme(rpc("Nope", {}), AUTH, PAYME, store, NOW)).error.code, -32601);
  assert.equal((await handlePayme({ id: 5 }, AUTH, PAYME, store, NOW)).error.code, -32600);
  await handlePayme(rpc("CreateTransaction", { id: "s1", time: NOW, amount: AMOUNT, account: { order_id: ORDER } }), AUTH, PAYME, store, NOW);
  const st = await handlePayme(rpc("GetStatement", { from: NOW - 1, to: NOW + 1 }), AUTH, PAYME, store, NOW);
  assert.equal(st.result.transactions.length, 1);
  assert.equal(st.result.transactions[0].id, "s1");
  assert.deepEqual(st.result.transactions[0].account, { order_id: ORDER });
  assert.deepEqual((await handlePayme(rpc("GetStatement", { from: 0, to: 1 }), AUTH, PAYME, store, NOW)).result, { transactions: [] });
});

// ---------------------------------------------------------------- Click
const CLICK = { serviceId: "31", merchantId: "20", secretKey: "click-secret", merchantUserId: null };
const signed = (p) => ({ ...p, sign_string: clickSign(p, CLICK.secretKey) });
const prepare = (extra = {}) =>
  signed({ click_trans_id: "9001", service_id: "31", click_paydoc_id: "77", merchant_trans_id: ORDER, amount: "179000.00", action: "0", error: "0", error_note: "Success", sign_time: "2026-11-16 15:00:00", ...extra });
const complete = (prepareId, extra = {}) =>
  signed({ click_trans_id: "9001", service_id: "31", click_paydoc_id: "77", merchant_trans_id: ORDER, merchant_prepare_id: String(prepareId), amount: "179000.00", action: "1", error: "0", error_note: "Success", sign_time: "2026-11-16 15:00:05", ...extra });

test("Click: the signature is the documented md5 of the fields in order", () => {
  const p = { click_trans_id: "1", service_id: "2", merchant_trans_id: "3", amount: "4", action: "0", sign_time: "5" };
  assert.equal(clickSign(p, "S"), createHash("md5").update("12S3405").digest("hex"));
  const c = { ...p, action: "1", merchant_prepare_id: "9" };
  assert.equal(clickSign(c, "S"), createHash("md5").update("12S39415").digest("hex"));
});

test("Click: prepare → complete opens the library; repeats answer -4; prepare repeats are stable", async () => {
  const store = memoryStore([order(ORDER, "click")]);
  const p1 = await handleClick(prepare(), CLICK, store, NOW);
  assert.equal(p1.error, 0);
  assert.equal(p1.merchant_prepare_id, 1);
  const p1again = await handleClick(prepare(), CLICK, store, NOW);
  assert.equal(p1again.merchant_prepare_id, 1);
  const c1 = await handleClick(complete(1), CLICK, store, NOW);
  assert.equal(c1.error, 0);
  assert.equal(c1.merchant_confirm_id, 1);
  assert.deepEqual(store.paid, [{ orderId: ORDER, ref: "click:9001" }]);
  assert.equal((await handleClick(complete(1), CLICK, store, NOW)).error, -4);
  assert.equal(store.paid.length, 1);
});

test("Click: bad sign -1, wrong amount -2, bad action -3, unknown order -5, unknown prepare id -6", async () => {
  const store = memoryStore([order(ORDER, "click")]);
  assert.equal((await handleClick({ ...prepare(), sign_string: "0".repeat(32) }, CLICK, store, NOW)).error, -1);
  assert.equal((await handleClick(prepare({ amount: "1000.00" }), CLICK, store, NOW)).error, -2);
  assert.equal((await handleClick(prepare({ action: "7" }), CLICK, store, NOW)).error, -3);
  assert.equal((await handleClick(prepare({ merchant_trans_id: ORDER2 }), CLICK, store, NOW)).error, -5);
  assert.equal((await handleClick(complete(42), CLICK, store, NOW)).error, -6);
  assert.equal((await handleClick(prepare(), null, store, NOW)).error, -8);
});

test("Click: complete with error < 0 from Click cancels the transaction and answers -9; no access given", async () => {
  const store = memoryStore([order(ORDER, "click")]);
  const p = await handleClick(prepare(), CLICK, store, NOW);
  const c = await handleClick(complete(p.merchant_prepare_id, { error: "-5017", error_note: "Insufficient funds" }), CLICK, store, NOW);
  assert.equal(c.error, -9);
  assert.equal(store.txns[0].state, -1);
  assert.equal(store.paid.length, 0);
  // The user can try again: a new prepare replaces nothing and works
  const retry = await handleClick(prepare({ click_trans_id: "9002" }), CLICK, store, NOW);
  assert.equal(retry.error, 0);
});

test("checkout links: Payme base64 params (sandbox host in test mode), Click amount N.NN", () => {
  const url = paymeCheckoutUrl(PAYME, { orderId: ORDER, amountTiyin: AMOUNT, returnUrl: "https://vizarai.com/dashboard/subscription?paid=1", lang: "uz" });
  assert.ok(url.startsWith("https://test.paycom.uz/"));
  const decoded = Buffer.from(url.split("/").pop(), "base64").toString("utf8");
  assert.equal(decoded, `m=m-test;ac.order_id=${ORDER};a=${AMOUNT};l=uz;c=https://vizarai.com/dashboard/subscription?paid=1`);
  assert.ok(paymeCheckoutUrl({ ...PAYME, testMode: false }, { orderId: ORDER, amountTiyin: 1, returnUrl: "x", lang: "ru" }).startsWith("https://checkout.paycom.uz/"));
  const click = new URL(clickCheckoutUrl(CLICK, { orderId: ORDER, amountTiyin: AMOUNT, returnUrl: "https://vizarai.com/x" }));
  assert.equal(click.origin + click.pathname, "https://my.click.uz/services/pay");
  assert.equal(click.searchParams.get("amount"), "179000.00");
  assert.equal(click.searchParams.get("transaction_param"), ORDER);
  assert.equal(click.searchParams.get("service_id"), "31");
});

test("the amounts charged match the prices shown on /pricing in every language", async () => {
  const { uz } = await import("../../src/lib/i18n/site/uz.ts");
  const { ru } = await import("../../src/lib/i18n/site/ru.ts");
  const { en } = await import("../../src/lib/i18n/site/en.ts");
  for (const site of [uz, ru, en]) {
    for (const [plan, uzs] of Object.entries(PLAN_PRICE_UZS)) {
      assert.equal(Number(site.pricing.plans[plan].price.replace(/[^\d]/g, "")), uzs, `${plan}`);
    }
  }
});
