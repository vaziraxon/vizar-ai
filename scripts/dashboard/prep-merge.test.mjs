import { test } from "node:test";
import assert from "node:assert/strict";
import { pickPrepSource } from "../../src/lib/dashboard/prep-merge.ts";

test("nothing anywhere: nothing to do", () => {
  assert.equal(pickPrepSource(null, null), "none");
});

test("only this browser has data: it goes up to the account", () => {
  assert.equal(pickPrepSource(1000, null), "local");
});

test("only the account has data (a new device): it comes down", () => {
  assert.equal(pickPrepSource(null, 1000), "server");
});

test("the copy changed last wins", () => {
  assert.equal(pickPrepSource(2000, 1000), "local");
  assert.equal(pickPrepSource(1000, 2000), "server");
  assert.equal(pickPrepSource(1000, 1000), "server");
});
