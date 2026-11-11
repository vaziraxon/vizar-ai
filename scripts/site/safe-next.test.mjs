import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "../../src/lib/auth/safe-next.ts";

test("same-site paths pass through", () => {
  assert.equal(safeNextPath("/dashboard/checklist"), "/dashboard/checklist");
  assert.equal(safeNextPath("/sinov?tab=real#x"), "/sinov?tab=real#x");
});

test("other sites and tricks fall back to the dashboard", () => {
  const bad = [
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
    null,
    undefined,
  ];
  for (const value of bad) assert.equal(safeNextPath(value), "/dashboard", JSON.stringify(value));
});

test("a custom fallback is used when given", () => {
  assert.equal(safeNextPath("//evil.com", "/"), "/");
});
