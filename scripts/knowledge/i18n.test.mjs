// Checks the Russian/English translations in supabase/i18n/*.json. No network.
//
//   node --test scripts/knowledge/i18n.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { bodyShape, keyDigests, LANGS, loadTranslations, toPayload, validate } from "./i18n-data.mjs";

const t = loadTranslations();
const all = (pick) => [
  ...Object.values(t.chapters).map((v) => pick(v).title ?? pick(v)),
  ...Object.values(t.countries).map(pick),
  ...Object.values(t.topics).map(pick),
  ...Object.values(t.sections).flatMap((list) => Object.values(list).map(pick)),
  ...Object.values(t.bodies).flatMap((list) => Object.values(list).map(pick)),
  ...Object.values(t.rules).map(pick),
];
const bodies = Object.entries(t.bodies).flatMap(([chapter, list]) => Object.entries(list).map(([slug, v]) => [`${chapter}/${slug}`, v]));

test("every entry has a non-empty Russian and English text", () => {
  assert.deepEqual(validate(t), []);
});

test("payload covers the whole book outline in both languages", () => {
  const p = toPayload(t);
  assert.equal(p.chapters.length, 15 * 2);
  assert.equal(p.sections.length, 352 * 2);
  assert.equal(p.countries.length, 61 * 2);
  assert.equal(p.topics.length, 10 * 2);
  assert.equal(p.rules.length, 151 * 2);
});

test("Russian is Cyrillic and English is not", () => {
  for (const ru of all((v) => v.ru)) assert.match(ru, /[Ѐ-ӿ]/, `no Cyrillic in: ${ru}`);
  for (const en of all((v) => v.en)) assert.doesNotMatch(en, /[Ѐ-ӿ]/, `Cyrillic in English: ${en}`);
});

test("source references [R..] and line structure survive translation", () => {
  const refs = (s) => (s.match(/\[R\d+(?:, R\d+)*\]/g) ?? []).join(" ");
  for (const [id, v] of Object.entries(t.rules)) {
    assert.equal(refs(v.ru), refs(v.en), `rule ${id}: references differ between ru and en`);
    assert.equal(v.ru.split("\n").length, v.en.split("\n").length, `rule ${id}: line count differs`);
  }
});

test("section bodies come a whole chapter at a time", () => {
  for (const [chapter, list] of Object.entries(t.bodies)) {
    assert.deepEqual(Object.keys(list).sort(), Object.keys(t.sections[chapter] ?? {}).sort(), `bodies-${chapter}.json must cover every section of ${chapter}`);
  }
});

test("section bodies keep the same markdown skeleton in ru and en", () => {
  for (const [id, v] of bodies) assert.deepEqual(bodyShape(v.en), bodyShape(v.ru), `${id}: structure differs between ru and en`);
});

test("section body tables keep a header, a separator and the same cell count per row", () => {
  for (const [id, v] of bodies) for (const lang of LANGS) {
    for (const table of v[lang].split("\n\n").filter((block) => block.startsWith("|"))) {
      const rows = table.split("\n");
      const cells = (row) => row.split("|").length;
      assert.match(rows[1] ?? "", /^\|( --- \|)+$/, `${id}.${lang}: table without a separator row`);
      for (const row of rows) assert.equal(cells(row), cells(rows[0]), `${id}.${lang}: ${row}`);
    }
  }
});

test("chapter titles start with their label (chapterHeading strips it)", () => {
  for (const [slug, v] of Object.entries(t.chapters)) {
    if (!slug.startsWith("bob-")) continue;
    for (const lang of ["ru", "en"]) assert.ok(v[lang].title.startsWith(`${v[lang].label}. `), `${slug}.${lang}`);
  }
});

test("key digests match the production keys checked on 2026-10-27", () => {
  const d = keyDigests(t);
  assert.equal(d.sections, "fa7502f934324e161c4a9de363667aaa");
  assert.equal(d.rules, "e15c65f07bfe2df69d1476d70ec04155");
  assert.equal(d.chapters, "37ef36a39c21630493fc3a2e9d0f529b");
  assert.equal(d.countries, "6a69f6738dc1b384239d07b69157a277");
});
