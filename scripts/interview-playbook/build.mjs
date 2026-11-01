/**
 * Builds the interview question bank from the VIZAR AI interview playbook PDF.
 *
 *   pdftotext -enc UTF-8 -layout playbook.pdf playbook.txt
 *   node scripts/interview-playbook/build.mjs playbook.txt <output-dir> [dropped-lines.txt]
 *
 * Writes one JSON file per country to <output-dir>, for import.mjs to load into
 * Supabase. This repository is public, so the folder must be outside it.
 *
 * The parts of the book are not laid out alike: titles, level headings and
 * numbering differ, and many parts open with a short introduction. What they
 * share is the shape of an entry and the count, so that is what this relies on:
 * every country has exactly 150 entries in the order 30 easy, 50 medium, 70 hard.
 * It stops with an error if any of that fails, so a bad extract can't be
 * loaded. Lines that belong to no entry are written to the optional last
 * argument so they can be reviewed.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

// Same order as the playbook's table of contents.
const COUNTRIES = [
  "us", "kr", "de", "ca", "gb", "au", "jp", "nz", "fr", "it", "es", "pl", "ch", "at", "nl", "be", "cz", "hu", "dk", "se",
  "no", "fi", "pt", "gr", "ie", "is", "sk", "lu", "si", "mt", "lt", "lv", "ee", "bg", "ro", "hr", "cy", "in", "za", "br",
  "mx", "ar", "cl", "pe", "co", "ec", "cr", "pa", "uy", "py", "bo", "cu",
];
const PER_COUNTRY = 150;
// Entries that close a level; what follows them is a heading or an introduction.
const LEVEL_ENDS = new Set([30, 80, 150]);
const levelOf = (n) => (n <= 30 ? "easy" : n <= 80 ? "medium" : "hard");

const FIELDS = [
  [/^JAVOB • UZ\s*/, "answerUz"],
  [/^ВОПРОС • RU\s*/, "questionRu"],
  [/^ОТВЕТ • RU\s*/, "answerRu"],
  [/^QUESTION • EN\s*/, "questionEn"],
  [/^ANSWER • EN\s*/, "answerEn"],
  [/^IZOH\s*/, "note"],
];
const PAGE_CHROME = [/^VIZAR AI \/ VISA INTERVIEW PLAYBOOK$/, /^VIZAR AI • O.quv qo.llanma \| \d+$/];

const [source, OUT, droppedFile] = process.argv.slice(2);
if (!source || !OUT) throw new Error("Usage: node build.mjs <playbook.txt> <output-dir> [dropped-lines.txt]");
const fromRepo = relative(REPO, resolve(OUT));
if (!fromRepo.startsWith("..") && !isAbsolute(fromRepo)) throw new Error("<output-dir> must be outside this public repository.");
const lines = readFileSync(source, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !PAGE_CHROME.some((re) => re.test(l)));

// A line wrapped right after a hyphen joins without a space ("Nyu-" + "York").
const glue = (a, b) => (!a ? b : /\p{L}-$/u.test(a) ? a + b : `${a} ${b}`);

const countries = COUNTRIES.map((code) => ({ code, easy: [], medium: [], hard: [] }));
const problems = [];
const dropped = [];
let total = 0;
let lastNumber = 0;
let entry = null;
let field = null;
let closed = false;

const finish = () => {
  if (!entry) return;
  for (const key of ["questionUz", ...FIELDS.map(([, k]) => k)]) {
    if (!entry[key]?.trim()) problems.push(`${entry.id}: empty ${key}`);
  }
  entry.country[levelOf(entry.position)].push({
    id: entry.id,
    question: { uz: entry.questionUz, ru: entry.questionRu, en: entry.questionEn },
    answer: { uz: entry.answerUz, ru: entry.answerRu, en: entry.answerEn },
    note: entry.note,
  });
  entry = null;
  field = null;
};

// Entries start after the table of contents and the rules, at the first "001." line.
const first = lines.findIndex((l) => /^001\.\s/.test(l));
if (first < 0) throw new Error("First entry not found");
dropped.push(...lines.slice(0, first));

for (let i = first; i < lines.length; i++) {
  const line = lines[i];

  // Numbering runs on through some parts and restarts in others, so "next" or
  // "1" starts an entry, and only when the entry before it is complete.
  const number = /^(\d{1,4})\.\s+(.*)$/.exec(line);
  const n = number ? Number(number[1]) : 0;
  // A few parts list their levels as "1. OSON DARAJA — 30 SAVOL-JAVOB".
  const isHeading = number && /^(OSON|O.RTA|QIYIN) DARAJA/.test(number[2]);
  if (isHeading) {
    dropped.push(`[numbered heading] ${line}`);
    continue;
  }
  if (number && (n === lastNumber + 1 || n === 1) && (!entry || entry.note !== undefined)) {
    finish();
    const countryIndex = Math.floor(total / PER_COUNTRY);
    const position = (total % PER_COUNTRY) + 1;
    const country = countries[countryIndex];
    if (!country) {
      problems.push(`Entry past the last country: ${line.slice(0, 70)}`);
      break;
    }
    total++;
    lastNumber = n;
    closed = false;
    entry = { id: `${country.code}-${position}`, country, position, questionUz: number[2] };
    field = "questionUz";
    continue;
  }

  const marker = FIELDS.find(([re]) => re.test(line));
  if (marker && entry) {
    field = marker[1];
    entry[field] = line.replace(marker[0], "");
    continue;
  }

  // After the last entry of a level comes a heading or introduction, not more
  // note. A note that reached the end of a sentence is taken as complete there.
  if (field === "note" && LEVEL_ENDS.has(entry.position) && (closed || /[.!?»”")]$/.test(entry.note))) {
    closed = true;
    dropped.push(`[after ${entry.id}] ${line}`);
    continue;
  }

  if (entry && field) entry[field] = glue(entry[field], line);
  else dropped.push(line);
}
finish();

for (const c of countries) {
  for (const [key, count] of [["easy", 30], ["medium", 50], ["hard", 70]]) {
    if (c[key].length !== count) problems.push(`${c.code}/${key}: ${c[key].length} entries, expected ${count}`);
  }
}
if (total !== COUNTRIES.length * PER_COUNTRY) problems.push(`${total} entries, expected ${COUNTRIES.length * PER_COUNTRY}`);

let longest = { name: "", id: "", length: 0 };
for (const c of countries) {
  for (const e of [...c.easy, ...c.medium, ...c.hard]) {
    for (const [name, value] of [
      ["question.uz", e.question.uz], ["question.ru", e.question.ru], ["question.en", e.question.en],
      ["answer.uz", e.answer.uz], ["answer.ru", e.answer.ru], ["answer.en", e.answer.en], ["note", e.note],
    ]) {
      if (/ • |ВОПРОС|ОТВЕТ •|QUESTION •|ANSWER •|[A-Z‘]{3,} DARAJA|PLAYBOOK|-QISM|-qism/.test(value)) problems.push(`${e.id} ${name}: marker inside text: ${value.slice(0, 100)}`);
      if (value.length > longest.length) longest = { name, id: e.id, length: value.length };
    }
  }
}

if (droppedFile) writeFileSync(droppedFile, dropped.join("\n"));
console.log(`countries=${countries.length} entries=${total} dropped=${dropped.length} longest=${longest.name}#${longest.id}(${longest.length}) problems=${problems.length}`);
if (problems.length) {
  console.log(problems.slice(0, 40).join("\n"));
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
let bytes = 0;
for (const c of countries) {
  const json = JSON.stringify(c);
  bytes += Buffer.byteLength(json);
  writeFileSync(join(OUT, `${c.code}.json`), `${json}\n`);
}
console.log(`wrote ${countries.length} files, ${(bytes / 1048576).toFixed(2)} MB`);
