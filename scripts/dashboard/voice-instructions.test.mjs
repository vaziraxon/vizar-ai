import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_PLAYBOOK_QUESTIONS, buildInterviewerInstructions } from "../../src/lib/voice/instructions.ts";

const base = { countryName: "United States", visaLabel: "B1/B2", visaKind: "tourist", language: "en", level: "medium", questions: [] };

test("the interviewer plays the chosen country, visa and language, and says it is practice", () => {
  const text = buildInterviewerInstructions({ ...base, language: "uz", countryName: "AQSH" });
  assert.match(text, /embassy of AQSH/);
  assert.match(text, /tourist \/ visitor visa \(B1\/B2\)/);
  assert.match(text, /Speak only Uzbek/);
  assert.match(text, /PRACTICE interview/);
  assert.match(text, /not a real embassy interview/);
});

test("it never asks for passport, JShShIR or bank numbers and never promises a visa", () => {
  const text = buildInterviewerInstructions(base);
  assert.match(text, /Never ask for a passport number/);
  assert.match(text, /JShShIR \/ PINFL/);
  assert.match(text, /bank card or account numbers/);
  assert.match(text, /must not share them/);
  assert.match(text, /Never promise or predict that a visa will be issued/);
});

test("playbook questions are listed, trimmed and capped", () => {
  const questions = Array.from({ length: 20 }, (_, i) => `  Question\n number ${i + 1}?  `);
  const text = buildInterviewerInstructions({ ...base, questions });
  assert.match(text, /1\. Question number 1\?/);
  assert.match(text, new RegExp(`${MAX_PLAYBOOK_QUESTIONS}\\. Question number ${MAX_PLAYBOOK_QUESTIONS}\\?`));
  assert.doesNotMatch(text, new RegExp(`Question number ${MAX_PLAYBOOK_QUESTIONS + 1}\\?`));
});

test("each level changes the officer's style", () => {
  const easy = buildInterviewerInstructions({ ...base, level: "easy" });
  const hard = buildInterviewerInstructions({ ...base, level: "hard" });
  assert.match(easy, /Friendly and patient/);
  assert.match(hard, /sceptical/);
});
