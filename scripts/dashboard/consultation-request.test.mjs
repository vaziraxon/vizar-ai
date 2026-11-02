// Unit tests for consultation requests stored as JSON in consultations.notes.
//
//   node --experimental-strip-types --test scripts/dashboard/consultation-request.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeRequest, readRequest } from "../../src/lib/dashboard/consultation-request.ts";

const request = { topic: "Rad javobi", contact: "@user", preferredTime: "18:00 dan keyin", message: "AQSH, 214(b)" };

test("a request reads back exactly as it was saved", () => {
  assert.deepEqual(readRequest(encodeRequest(request), null), request);
});

test("old demo bookings fall back to the specialist's name", () => {
  assert.deepEqual(readRequest(null, "Diloram Xasanova"), { topic: "Diloram Xasanova", contact: "", preferredTime: "", message: "" });
});

test("plain-text or broken notes become the message instead of throwing", () => {
  assert.equal(readRequest("Iltimos, qo'ng'iroq qiling", null).message, "Iltimos, qo'ng'iroq qiling");
  assert.equal(readRequest("{not json", null).topic, "Konsultatsiya");
  assert.equal(readRequest('{"no":"topic"}', null).message, '{"no":"topic"}');
});

test("missing optional fields read as empty strings", () => {
  assert.deepEqual(readRequest('{"topic":"Boshqa","contact":"+998"}', null), { topic: "Boshqa", contact: "+998", preferredTime: "", message: "" });
});
