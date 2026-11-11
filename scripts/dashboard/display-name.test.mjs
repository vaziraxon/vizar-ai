import { test } from "node:test";
import assert from "node:assert/strict";
import { firstNameFromMetadata } from "../../src/lib/profile/display-name.ts";

test("email sign-ups keep their own first name", () => {
  assert.equal(firstNameFromMetadata({ first_name: " Vazira ", given_name: "X" }), "Vazira");
});

test("Google sign-ups use given_name, then the first word of full_name or name", () => {
  assert.equal(firstNameFromMetadata({ given_name: "Vaziraxon", full_name: "Vaziraxon Zokirova" }), "Vaziraxon");
  assert.equal(firstNameFromMetadata({ full_name: "Vaziraxon Zokirova" }), "Vaziraxon");
  assert.equal(firstNameFromMetadata({ name: "Vaziraxon" }), "Vaziraxon");
});

test("nothing usable gives an empty name", () => {
  assert.equal(firstNameFromMetadata(null), "");
  assert.equal(firstNameFromMetadata({}), "");
  assert.equal(firstNameFromMetadata({ given_name: 42 }), "");
});
