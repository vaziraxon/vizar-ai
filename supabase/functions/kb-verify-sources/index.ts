// kb-verify-sources — change detection for the official pages the book cites.
//
// POST {}                     → re-checks up to 10 sources not checked in 7 days
//                               (public trigger, used by the hourly cron job;
//                               the 7-day window means it cannot be used to
//                               hammer the official sites)
// POST { source_id: "<uuid>" } → re-checks one source now; requires the
//                               caller's JWT to belong to a knowledge-base editor
//
// For each page: fetch, reduce to visible text, SHA-256 it and compare with
// the previous hash. A changed page is marked `changed` and every country
// rule that cites it moves to `needs_review`, so an editor re-reads the
// official page before the assistant keeps relying on the old wording.
// The first successful check only records a baseline.
import { callerClient, json, serviceClient } from "../_shared/kb.ts";

const BATCH = 10;
const TIMEOUT_MS = 12_000;
const MAX_TEXT = 40_000;

function visibleText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/\s+/g, " ")
    .trim();
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type Source = {
  id: string;
  title: string;
  url: string;
  check_status: string;
  last_content_hash: string | null;
  last_text: string | null;
};

async function checkSource(supabase: ReturnType<typeof serviceClient>, src: Source) {
  const now = new Date().toISOString();
  let status = 0;
  let text = "";
  let error: string | null = null;
  try {
    const res = await fetch(src.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent": "VIZAR-AI-SourceMonitor/1.0 (+https://vizarai.com)",
        Accept: "text/html,application/xhtml+xml,application/pdf;q=0.8,*/*;q=0.5",
      },
    });
    status = res.status;
    if (res.ok) {
      const type = res.headers.get("content-type") ?? "";
      const raw = await res.text();
      text = type.includes("html") || raw.trimStart().startsWith("<") ? visibleText(raw) : raw.replace(/\s+/g, " ").trim();
    } else {
      error = `HTTP ${res.status}`;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !text) {
    await supabase
      .from("kb_sources")
      .update({ check_status: status ? "unreachable" : "error", last_checked_at: now, last_http_status: status || null, check_error: error ?? "Empty page" })
      .eq("id", src.id);
    await supabase.from("kb_source_checks").insert({ source_id: src.id, http_status: status || null, error: error ?? "Empty page" });
    return { id: src.id, url: src.url, result: "unreachable", error };
  }

  const hash = await sha256(text);
  const changed = Boolean(src.last_content_hash) && src.last_content_hash !== hash;
  // An unacknowledged change stays "changed" until an editor reviews it.
  const nextStatus = changed || src.check_status === "changed" ? "changed" : "ok";

  await supabase
    .from("kb_sources")
    .update({
      check_status: nextStatus,
      last_checked_at: now,
      last_http_status: status,
      last_content_hash: hash,
      last_text: text.slice(0, MAX_TEXT),
      check_error: null,
      ...(changed ? { last_changed_at: now } : {}),
    })
    .eq("id", src.id);
  await supabase.from("kb_source_checks").insert({
    source_id: src.id,
    http_status: status,
    content_hash: hash,
    changed,
    previous_text: changed ? src.last_text : null,
  });

  if (changed) {
    const { data: links } = await supabase.from("kb_rule_sources").select("rule_id").eq("source_id", src.id);
    const ruleIds = (links ?? []).map((l) => l.rule_id);
    if (ruleIds.length) {
      await supabase
        .from("kb_country_rules")
        .update({ status: "needs_review", review_note: `Rasmiy manba o‘zgardi (${now.slice(0, 10)}): ${src.title}` })
        .in("id", ruleIds)
        .in("status", ["verified", "unverified"]);
    }
    return { id: src.id, url: src.url, result: "changed", rules_flagged: ruleIds.length };
  }
  return { id: src.id, url: src.url, result: src.last_content_hash ? "unchanged" : "baseline" };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const body = await req.json().catch(() => ({}));
  const supabase = serviceClient();
  const columns = "id, title, url, check_status, last_content_hash, last_text";

  let sources: Source[] = [];
  if (typeof body.source_id === "string") {
    const authorization = req.headers.get("Authorization") ?? "";
    const { data: isEditor } = authorization.startsWith("Bearer ")
      ? await callerClient(authorization).rpc("kb_is_editor")
      : { data: false };
    if (isEditor !== true) return json({ error: "Knowledge-base editor access required" }, 403);
    const { data, error } = await supabase.from("kb_sources").select(columns).eq("id", body.source_id).limit(1);
    if (error) return json({ error: error.message }, 500);
    sources = (data ?? []) as Source[];
  } else {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("kb_sources")
      .select(columns)
      .or(`last_checked_at.is.null,last_checked_at.lt.${weekAgo}`)
      .order("last_checked_at", { ascending: true, nullsFirst: true })
      .limit(BATCH);
    if (error) return json({ error: error.message }, 500);
    sources = (data ?? []) as Source[];
  }

  // Five at a time keeps the whole run well inside the function's time limit.
  const results = [];
  for (let i = 0; i < sources.length; i += 5) {
    results.push(...(await Promise.all(sources.slice(i, i + 5).map((s) => checkSource(supabase, s)))));
  }
  return json({ checked: results.length, results });
});
