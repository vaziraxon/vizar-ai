// Node module hooks for the voice/AI-beta flow tests: resolves the "@/" alias
// to src/, extensionless relative imports to .ts, and swaps the modules that
// would reach Supabase, OpenAI or Anthropic for in-memory fakes. Nothing in
// these tests touches a network or a real database.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../../../src");

const FAKES = {
  "server-only": path.join(here, "empty.mjs"),
  "@/lib/supabase/admin": path.join(here, "admin.mjs"),
  "@/lib/voice/providers": path.join(here, "providers.mjs"),
  "@/lib/voice/evaluate": path.join(here, "evaluate.mjs"),
};

function withExtension(base) {
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (FAKES[specifier]) return { url: pathToFileURL(FAKES[specifier]).href, shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const file = withExtension(path.join(src, specifier.slice(2)));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !path.extname(specifier) && context.parentURL?.startsWith("file:")) {
    const file = withExtension(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  return next(specifier, context);
}
