/**
 * Checks the question bank and the rule-based evaluator against each other:
 *   node scripts/interview-playbook/check.mjs <data-dir>
 *
 * The playbook's own sample answers are good answers, so the evaluator must not
 * flag them as risky or score them low. Exits non-zero when the data is broken
 * or too many samples are flagged.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateAnswer } from "../../src/lib/dashboard/interview-eval.ts";

const DIR = process.argv[2];
if (!DIR) throw new Error("Usage: node check.mjs <data-dir>");
const LANGS = ["uz", "ru", "en"];
const CYRILLIC = /[а-яё]/i;

const problems = [];
let total = 0;
const scores = { uz: [], ru: [], en: [] };
const risky = new Map();
const lowest = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  for (const level of ["easy", "medium", "hard"]) {
    for (const e of data[level]) {
      total++;
      for (const lang of LANGS) {
        const q = e.question[lang];
        const a = e.answer[lang];
        if (!q || !a) problems.push(`${e.id}: empty ${lang}`);
        if (lang === "ru" && !(CYRILLIC.test(q) && CYRILLIC.test(a))) problems.push(`${e.id}: ru text is not Cyrillic`);
        if (lang !== "ru" && (CYRILLIC.test(q) || CYRILLIC.test(a))) problems.push(`${e.id}: Cyrillic in ${lang}`);
        const result = evaluateAnswer(a, q, a);
        scores[lang].push(result.overall);
        for (const phrase of result.risky) {
          if (!risky.has(phrase)) risky.set(phrase, []);
          risky.get(phrase).push(`${e.id}/${lang}: ${a.slice(0, 100)}`);
        }
        if (result.overall < 60) lowest.push(`${result.overall} ${e.id}/${lang}: ${a.slice(0, 90)}`);
      }
      if (!e.note) problems.push(`${e.id}: empty note`);
    }
  }
}

const flagged = [...risky.values()].reduce((n, list) => n + list.length, 0);
console.log(`entries=${total} problems=${problems.length} riskyHits=${flagged} below60=${lowest.length}`);
for (const lang of LANGS) {
  const list = scores[lang].sort((a, b) => a - b);
  console.log(`${lang}: min=${list[0]} median=${list[Math.floor(list.length / 2)]} max=${list[list.length - 1]}`);
}
for (const [phrase, list] of [...risky.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 14)) {
  console.log(`  "${phrase}" x${list.length}  e.g. ${list[0]}`);
}
console.log(lowest.slice(0, 10).join("\n"));
if (problems.length) console.log(problems.slice(0, 20).join("\n"));

// A handful of samples may legitimately contain a cautious phrase; more means the rules are wrong.
if (problems.length || total !== 7800 || flagged > 23400 * 0.01) process.exit(1);
