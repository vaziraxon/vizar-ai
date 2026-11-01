#!/usr/bin/env node
// Loads the interview playbook into public.interview_questions (see
// supabase/interview_questions.sql). The JSON comes from build.mjs and stays
// outside this public repository. The app never holds a service-role key, so
// this uses the same token-guarded pattern as scripts/knowledge/import-book.mjs:
//
//   node scripts/interview-playbook/import.mjs prepare <token-file>      # prints SQL: temporary import function
//   node scripts/interview-playbook/import.mjs run <data-dir> <token-file>   # one request per country
//   node scripts/interview-playbook/import.mjs digest <data-dir>         # local digest, and the SQL to compare it with
//   node scripts/interview-playbook/import.mjs cleanup                   # prints SQL: drop the function
//
// Run the "prepare" output in the SQL Editor, then "run", then "cleanup", and
// delete the token file. Reads NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY from
// .env.local; never prints them or the token.
import { createHash, randomBytes } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LEVELS = ["easy", "medium", "hard"];
const TEXT_COLUMNS = ["question_uz", "question_ru", "question_en", "answer_uz", "answer_ru", "answer_en", "note"];
const COLUMNS = ["id", "country_code", "level", "sort_order", ...TEXT_COLUMNS];

const [mode, ...args] = process.argv.slice(2);

function countryRows(dir, file) {
  const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
  return LEVELS.flatMap((level) =>
    data[level].map((entry, index) => ({
      id: entry.id,
      country_code: data.code,
      level,
      sort_order: index + 1,
      question_uz: entry.question.uz,
      question_ru: entry.question.ru,
      question_en: entry.question.en,
      answer_uz: entry.answer.uz,
      answer_ru: entry.answer.ru,
      answer_en: entry.answer.en,
      note: entry.note,
    }))
  );
}

const jsonFiles = (dir) => readdirSync(dir).filter((f) => f.endsWith(".json"));

if (mode === "prepare") {
  const [tokenFile] = args;
  if (!tokenFile) throw new Error("usage: prepare <token-file>");
  const token = randomBytes(32).toString("hex");
  writeFileSync(tokenFile, token, { mode: 0o600 });
  const hash = createHash("sha256").update(token).digest("hex");
  console.log(`create or replace function public.interview_questions_import(p_token text, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  n integer;
begin
  if encode(sha256(convert_to(p_token, 'UTF8')), 'hex') <> '${hash}' then
    raise exception 'invalid import token' using errcode = '42501';
  end if;
  insert into public.interview_questions (${COLUMNS.join(", ")})
  select ${COLUMNS.map((c) => `r.${c}`).join(", ")}
  from jsonb_to_recordset(p_rows) as r(id text, country_code text, level text, sort_order integer, ${TEXT_COLUMNS.map((c) => `${c} text`).join(", ")})
  on conflict (id) do update set
    ${COLUMNS.slice(1)
      .map((c) => `${c} = excluded.${c}`)
      .join(",\n    ")};
  get diagnostics n = row_count;
  return n;
end;
$fn$;
revoke all on function public.interview_questions_import(text, jsonb) from public;
grant execute on function public.interview_questions_import(text, jsonb) to anon, authenticated;`);
} else if (mode === "run") {
  const [dir, tokenFile] = args;
  if (!dir || !tokenFile) throw new Error("usage: run <data-dir> <token-file>");
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")])
  );
  const token = readFileSync(tokenFile, "utf8").trim();
  let total = 0;
  for (const file of jsonFiles(dir)) {
    const rows = countryRows(dir, file);
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/interview_questions_import`, {
      method: "POST",
      headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: token, p_rows: rows }),
    });
    const body = await res.text();
    if (!res.ok || Number(body) !== rows.length) {
      console.error(`${file}: HTTP ${res.status}: ${body.slice(0, 300)}`);
      process.exit(1);
    }
    total += rows.length;
  }
  console.log(`loaded ${total} rows from ${jsonFiles(dir).length} countries`);
} else if (mode === "digest") {
  const [dir] = args;
  if (!dir) throw new Error("usage: digest <data-dir>");
  const rows = jsonFiles(dir)
    .flatMap((file) => countryRows(dir, file))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  const text = rows.map((row) => COLUMNS.map((c) => row[c]).join("|")).join("\n");
  console.log(`local: ${rows.length} rows, md5 ${createHash("md5").update(text).digest("hex")}`);
  console.log(`select count(*) as rows, count(distinct country_code) as countries,
  md5(string_agg(concat_ws('|', ${COLUMNS.join(", ")}), E'\\n' order by id collate "C")) as digest
from public.interview_questions;`);
} else if (mode === "cleanup") {
  console.log("drop function if exists public.interview_questions_import(text, jsonb);");
} else {
  console.error("usage: import.mjs prepare <token-file> | run <data-dir> <token-file> | digest <data-dir> | cleanup");
  process.exit(2);
}
