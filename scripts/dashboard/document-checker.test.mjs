import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDocument, overall, paddleOcrLocalReader, qwenLocalReader, syntheticReader } from "../../src/lib/document-check/checker.ts";
import { SYNTHETIC_SAMPLES } from "../../src/lib/document-check/synthetic.ts";

const ctx = { travelEnd: "2027-03-01", passportMonthsAfterTrip: 3, requiredKinds: ["passport", "bank", "insurance"] };
const sample = (id) => SYNTHETIC_SAMPLES.find((s) => s.id === id).input;
const byId = (findings, id) => findings.find((f) => f.id === id);

test("a complete passport valid long after the trip passes", () => {
  const f = checkDocument(sample("passport-ok"), ctx);
  assert.equal(overall(f), "ok");
});

test("a passport that expires too soon after the trip fails on validity", () => {
  // expires 2027-04-10, but must last until 2027-06-01 (3 months after 2027-03-01)
  const f = checkDocument(sample("passport-expiring"), ctx);
  assert.equal(byId(f, "expiry").level, "fail");
  assert.equal(overall(f), "fail");
});

test("a passport valid for 6 months is fine for a 3-month rule but not a 6-month one", () => {
  const input = { ...sample("passport-ok"), fields: { ...sample("passport-ok").fields, expiryDate: "2027-07-15" } };
  assert.equal(byId(checkDocument(input, ctx), "expiry").level, "ok");
  assert.equal(byId(checkDocument(input, { ...ctx, passportMonthsAfterTrip: 6 }), "expiry").level, "fail");
});

test("missing fields and a small scan are reported", () => {
  const f = checkDocument(sample("passport-missing"), ctx);
  assert.equal(byId(f, "fields").level, "fail");
  assert.match(byId(f, "fields").message, /ism/);
  assert.match(byId(f, "fields").message, /pasport raqami/);
  assert.equal(byId(f, "resolution").level, "warn");
});

test("wrong file types are refused; unlisted kinds only warned", () => {
  assert.equal(byId(checkDocument(sample("bank-wrong-type"), ctx), "type").level, "fail");
  const other = checkDocument(sample("insurance-ok"), { ...ctx, requiredKinds: ["passport"] });
  assert.equal(byId(other, "listed").level, "warn");
});

test("findings never claim authenticity or a visa outcome", () => {
  for (const s of SYNTHETIC_SAMPLES) {
    for (const f of checkDocument(s.input, ctx)) assert.doesNotMatch(f.message, /haqiqiy|soxta|viza beriladi|kafolat/i);
  }
});

test("synthetic samples are obviously fake", () => {
  for (const s of SYNTHETIC_SAMPLES) {
    if (s.input.fields.documentNumber) assert.match(s.input.fields.documentNumber, /^TEST/);
    if (s.input.fields.surname) assert.match(s.input.fields.surname, /^TEST/);
  }
});

test("local Qwen and OCR readers are not connected and refuse to run", async () => {
  assert.equal(syntheticReader.connected, true);
  assert.equal(qwenLocalReader.connected, false);
  assert.equal(paddleOcrLocalReader.connected, false);
  await assert.rejects(() => qwenLocalReader.read(sample("passport-ok")), /ulanmagan/);
  await assert.rejects(() => paddleOcrLocalReader.read(sample("passport-ok")), /ulanmagan/);
});
