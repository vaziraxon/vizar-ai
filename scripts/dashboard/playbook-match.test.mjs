// Unit tests for linking the assistant's questions to the interview playbook.
//
//   node --experimental-strip-types --test scripts/dashboard/playbook-match.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectCountry, isInterviewQuestion, queryStems, rankPlaybook } from "../../src/lib/dashboard/playbook-match.ts";
import { PLAYBOOK_COUNTRIES } from "../../src/data/interview-playbook/index.ts";

const country = (q) => detectCountry(q, PLAYBOOK_COUNTRIES);

test("finds the country in any of the three languages, with case endings", () => {
  assert.equal(country("AQSHga turistik viza suhbatida nima so'rashadi?"), "us");
  assert.equal(country("Какие вопросы задают в посольстве США?"), "us");
  assert.equal(country("Interview questions for the United States"), "us");
  assert.equal(country("Germaniyaga viza uchun suhbat"), "de");
  assert.equal(country("Собеседование для визы в Германию"), "de");
  assert.equal(country("Italiyada qancha qolish mumkin?"), "it");
  assert.equal(country("Kanadaga o‘qishga"), "ca");
});

test("a longer name wins over a shorter one it starts with", () => {
  assert.equal(country("Австралия: вопросы на собеседовании"), "au");
  assert.equal(country("Австрия: вопросы на собеседовании"), "at");
  assert.equal(country("Avstraliya vizasi"), "au");
});

test("common other names: Amerika, Angliya", () => {
  assert.equal(country("Amerikaga viza"), "us");
  assert.equal(country("Angliya suhbati"), "gb");
});

test("no country named → null", () => {
  assert.equal(country("Bank ko'chirmasi necha oylik bo'lishi kerak?"), null);
});

test("interview intent in three languages", () => {
  assert.equal(isInterviewQuestion("Suhbatda nimalar so‘raladi?"), true);
  assert.equal(isInterviewQuestion("What do they ask at the visa interview?"), true);
  assert.equal(isInterviewQuestion("Что спрашивают на собеседовании?"), true);
  assert.equal(isInterviewQuestion("Bank ko'chirmasi necha oylik bo'lishi kerak?"), false);
});

test("filler and interview words don't count as shared words, whatever the ending", () => {
  assert.deepEqual(queryStems("Suhbatda qanday savollar beriladi?"), []);
  assert.deepEqual(queryStems("Suhbatda homiy haqida nima so'rashadi?"), ["homiy"]);
  assert.deepEqual(queryStems("Homiy xati qanday yoziladi?"), ["homiy", "xati", "yozil"]);
  assert.deepEqual(queryStems("What do they ask about my sponsor?"), ["spons"]);
});

test("the named country doesn't count as a shared word", () => {
  assert.deepEqual(queryStems("AQShga turistik viza suhbati", PLAYBOOK_COUNTRIES), ["turis"]);
  assert.deepEqual(queryStems("Какие вопросы задают на собеседовании на визу США?", PLAYBOOK_COUNTRIES), []);
  assert.deepEqual(queryStems("Germaniyada o'qish uchun suhbat", PLAYBOOK_COUNTRIES), ["o'qis"]);
});

const row = (id, level, sort_order, uz) => ({ id, level, sort_order, question: { uz, ru: "", en: "" } });
const rows = [
  row("a", "hard", 1, "Homiyingiz kim va uning daromadi qancha?"),
  row("b", "easy", 2, "Safaringiz maqsadi nima?"),
  row("c", "easy", 1, "Qayerda ishlaysiz va maoshingiz qancha?"),
  row("d", "medium", 4, "Homiyingiz bilan qarindoshligingiz qanday?"),
];

test("rows sharing the most words come first, easier first on a tie", () => {
  const ranked = rankPlaybook(queryStems("Homiyingiz haqida qanday savol beriladi?"), rows, { country: null });
  assert.deepEqual(ranked.map((r) => r.id), ["d", "a"]);
});

test("a named country with no shared words falls back to its first easy questions", () => {
  const ranked = rankPlaybook(queryStems("Germaniya", PLAYBOOK_COUNTRIES), rows, { country: "de" });
  assert.deepEqual(ranked.map((r) => r.id), ["c", "b", "d"]);
});

test("nothing shared and no country → nothing shown", () => {
  assert.deepEqual(rankPlaybook(queryStems("Shengen 90/180"), rows, { country: null }), []);
});

test("the same question from several countries is shown once", () => {
  const twins = [row("ar", "medium", 1, "Sizga kim homiylik qilyapti?"), row("at", "medium", 1, "Sizga kim homiylik qilyapti?"), ...rows];
  const ranked = rankPlaybook(["homiy"], twins, { country: null });
  assert.deepEqual(ranked.map((r) => r.id), ["ar", "d", "a"]);
});
