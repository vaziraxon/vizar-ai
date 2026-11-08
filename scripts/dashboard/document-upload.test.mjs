import { test } from "node:test";
import assert from "node:assert/strict";
import { documentUploadsEnabled } from "../../src/lib/document-upload.ts";

test("uploads are closed unless explicitly turned on", () => {
  assert.equal(documentUploadsEnabled({}), false);
  assert.equal(documentUploadsEnabled({ DOCUMENT_UPLOAD_ENABLED: "false" }), false);
  assert.equal(documentUploadsEnabled({ DOCUMENT_UPLOAD_ENABLED: "1" }), false);
});

test("production stays closed even if the flag is set", () => {
  assert.equal(documentUploadsEnabled({ DOCUMENT_UPLOAD_ENABLED: "true", VERCEL_ENV: "production" }), false);
});

test("a development or preview environment can turn them on", () => {
  assert.equal(documentUploadsEnabled({ DOCUMENT_UPLOAD_ENABLED: "true" }), true);
  assert.equal(documentUploadsEnabled({ DOCUMENT_UPLOAD_ENABLED: "true", VERCEL_ENV: "preview" }), true);
});
