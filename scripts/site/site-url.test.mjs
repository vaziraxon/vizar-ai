import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "../../src/lib/site-url.ts";

test("NEXT_PUBLIC_SITE_URL wins and loses its trailing slash", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://vizarai.com/", VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "other.app" }), "https://vizarai.com");
});

test("production without the setting uses Vercel's production domain", () => {
  assert.equal(resolveSiteUrl({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "vizarai.com" }), "https://vizarai.com");
});

test("previews use their own deployment URL", () => {
  assert.equal(resolveSiteUrl({ VERCEL_ENV: "preview", VERCEL_URL: "vizar-ai-git-x.vercel.app" }), "https://vizar-ai-git-x.vercel.app");
});

test("local development falls back to localhost", () => {
  assert.equal(resolveSiteUrl({}), "http://localhost:3000");
});
