// Unit tests for the library's emoji / flag / photo helpers. No network.
//
//   node --test scripts/knowledge/visuals.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { chapterSlugEmoji, countryPhoto, sectionCountry, sectionEmoji, topicEmoji } from "../../src/lib/knowledge/visuals.ts";

const COUNTRIES = [
  { code: "GB", name: "Buyuk Britaniya" },
  { code: "US", name: "AQSh" },
  { code: "CA", name: "Kanada" },
  { code: "AE", name: "BAA" },
  { code: "BA", name: "Bosniya va Gersegovina" },
  { code: "NZ", name: "Yangi Zelandiya" },
  { code: "EU", name: "Shengen hududi" },
];

test("sectionCountry finds the country a section title starts with", () => {
  assert.equal(sectionCountry("Buyuk Britaniya: Standard Visitor va Student’ni chalkashtirmang", COUNTRIES), "GB");
  assert.equal(sectionCountry("AQSh B-1/B-2: ortiqcha taklifnomaga suyanib qolmang", COUNTRIES), "US");
  assert.equal(sectionCountry("Kanada va Avstraliya: dalil davrlarini solishtirish", COUNTRIES), "CA");
  assert.equal(sectionCountry("BAA: 30 kunlik vizasiz sayohat va uning chegaralari", COUNTRIES), "AE");
  assert.equal(sectionCountry("Bosniya va Gersegovina: hujjatlar hamda 30 kunlik uzluksiz limit", COUNTRIES), "BA");
  assert.equal(sectionCountry("Yangi Zelandiya: aniq mezon bo‘lishi ham mumkin", COUNTRIES), "NZ");
});

test("sectionCountry ignores partial words and the Schengen pseudo-country", () => {
  assert.equal(sectionCountry("AQShning B-1, B-2 va B-1/B-2 vizalari", COUNTRIES), null);
  assert.equal(sectionCountry("Shengen hududi va 90/180 qoidasi", COUNTRIES), null);
  assert.equal(sectionCountry("Pasport tekshiruvi: oddiy, ammo hal qiluvchi boshlang‘ich bosqich", COUNTRIES), null);
});

test("sectionEmoji matches whole words, not fragments", () => {
  assert.equal(sectionEmoji("Konsullik qanday mantiqni tekshiradi? “Hujjat ko‘p” va “dalil ishonchli” farqi"), "📄");
  assert.equal(sectionEmoji("Viza talabini o‘zgartiradigan oltita omil"), "🏷️");
  assert.equal(sectionEmoji("AQSh: 214(b), 221(g) va keyingi choralar"), "🚫");
  assert.equal(sectionEmoji("Shengen qisqa muddatli vizasiga rad javobi berilganda"), "📅");
  assert.equal(sectionEmoji("Bank ko‘chirmasini o‘qish: sun’iy namunali jadval"), "🏦");
  assert.equal(sectionEmoji("Shengen tizimini o‘qish: A, C va D toifalarining vazifasi"), "🏛️");
  assert.equal(sectionEmoji("Qisqa o‘qish, uzoq ta’lim va talabalar uchun alohida yo‘l"), "🎓");
  assert.equal(sectionEmoji("Nazorat savollari va kichik mashqlar"), "🧠");
  assert.equal(sectionEmoji("AQSh: suhbat savollari va javobning mantiqiy tuzilishi"), "🎙️");
  assert.equal(sectionEmoji("Safar rejasi va turar joy: bir-biriga mos bo‘lsin"), "🏨");
});

test("topic, chapter and photo helpers", () => {
  assert.equal(topicEmoji("Murojaat yo‘li"), "📍");
  assert.equal(topicEmoji("Viza yig‘imi (2026-10-26 holati)"), "💳");
  assert.equal(topicEmoji("Kirish rejimi (2026)"), "🛬");
  assert.equal(chapterSlugEmoji("bob-5"), "🏛️");
  assert.equal(chapterSlugEmoji("kirish"), "📘");
  assert.equal(countryPhoto("de", "schengen"), "/images/destinations/de.webp");
  assert.equal(countryPhoto("AT", "schengen"), "/images/destinations/schengen.webp");
});
