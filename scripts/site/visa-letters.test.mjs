// Unit tests for the visa letter templates.
//
//   node --experimental-strip-types --test scripts/site/visa-letters.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GAP,
  MAX_DAYS,
  coverLetter,
  employerLetter,
  hasGaps,
  letterText,
  longDate,
  sponsorLetter,
  tripDates,
  tripLength,
} from "../../src/lib/site/visa-letters.ts";

// Made-up people and companies
const cover = {
  place: "Toshkent",
  date: "2026-04-20",
  country: "DE",
  fullName: "Aziza Karimova",
  birthDate: "1995-03-08",
  passport: "FA1234567",
  address: "Chilonzor 9, Toshkent",
  phone: "+998 90 000 00 00",
  email: "",
  homeCity: "Tashkent",
  purpose: "tourism",
  from: "2026-05-12",
  to: "2026-05-14",
  days: [
    { city: "Berlin", stay: "Hotel Example", plan: null },
    { city: "", stay: "", plan: "museums" },
    { city: "", stay: "", plan: null },
  ],
  funding: "self",
  sponsorName: "",
  relation: "father",
  position: "accountant",
  employer: "Example LLC",
};

test("dates in the letter's own language", () => {
  assert.equal(longDate("2026-05-12", "en"), "12 May 2026");
  assert.equal(longDate("2026-05-12", "de"), "12. Mai 2026");
  assert.equal(longDate("2026-05-12", "ru"), "12 мая 2026 г.");
  assert.equal(longDate("", "en"), GAP);
});

test("trip length counts both ends, rejects reversed dates and caps the programme", () => {
  assert.equal(tripLength("2026-05-12", "2026-05-14"), 3);
  assert.equal(tripLength("2026-05-14", "2026-05-12"), 0);
  assert.deepEqual(tripDates("2026-05-31", "2026-06-01"), ["2026-05-31", "2026-06-01"]);
  assert.equal(tripDates("2026-01-01", "2026-03-01").length, MAX_DAYS);
});

test("cover letter: complete form, no gaps, programme day by day", () => {
  const blocks = coverLetter(cover, "en");
  const text = letterText(blocks);
  assert.equal(hasGaps(blocks), false, text);
  assert.ok(text.includes("To: Embassy / Consulate — Germany"));
  assert.ok(text.includes("Travel dates: 12 May 2026 – 14 May 2026 (3 days)"));
  assert.ok(text.includes("I am covering all costs of the trip myself."));
  assert.ok(text.includes("I work as accountant at Example LLC. At the end of the trip, on 14 May 2026, I will return home to Tashkent."));
  const table = blocks.find((b) => b.type === "table");
  assert.deepEqual(
    table.rows.map((r) => [r[2], r[3], r[4]]),
    [
      ["Berlin", "Hotel Example", "Arrival, check-in"],
      ["Berlin", "Hotel Example", "Museums and historical sites"],
      ["Berlin", "Hotel Example", "Departure"],
    ]
  );
});

test("cover letter in German with a sponsor", () => {
  const text = letterText(coverLetter({ ...cover, funding: "sponsor", sponsorName: "Karim Karimov" }, "de"));
  assert.ok(text.includes("An: Botschaft / Konsulat – Deutschland"));
  assert.ok(text.includes("Reisezeitraum: 12. Mai 2026 – 14. Mai 2026 (3 Tage)"));
  assert.ok(text.includes("Die Kosten der Reise übernimmt Karim Karimov (Vater)."));
  assert.ok(text.includes("Tag | Datum | Ort | Unterkunft | Programm"));
  assert.ok(text.includes("Mit freundlichen Grüßen"));
});

test("an empty form shows gaps instead of inventing details", () => {
  const empty = { ...cover, fullName: "", passport: "", from: "", to: "", days: [] };
  assert.equal(hasGaps(coverLetter(empty, "en")), true);
});

const employer = {
  place: "Toshkent",
  date: "2026-04-20",
  country: "",
  fullName: "Aziza Karimova",
  birthDate: "1995-03-08",
  passport: "FA1234567",
  position: "Buchhalterin",
  since: "2020-03-01",
  salary: "120 000 000",
  currency: "UZS",
  leaveFrom: "2026-05-11",
  leaveTo: "2026-05-15",
  returnOn: "2026-05-18",
  company: "Example LLC",
  companyAddress: "Amir Temur 1, Toshkent",
  companyPhone: "+998 71 000 00 00",
  companyWeb: "example.uz",
  companyTin: "123456789",
  signatory: "B. Rahimov",
  signatoryTitle: "Direktor",
};

test("employment certificate holds what the German embassy lists", () => {
  const text = letterText(employerLetter(employer, "de"));
  for (const part of [
    "seit dem 1. März 2020 bei Example LLC als Buchhalterin beschäftigt",
    "Das Gehalt der letzten 12 Monate betrug insgesamt 120 000 000 UZS.",
    "vom 11. Mai 2026 bis zum 15. Mai 2026 wurde Urlaub gewährt",
    "am 18. Mai 2026 wieder aufgenommen",
    "Tel.: +998 71 000 00 00",
    "example.uz",
    "Steuernummer (STIR/INN): 123456789",
    "Zur Vorlage bei der zuständigen Stelle",
  ]) {
    assert.ok(text.includes(part), part);
  }
});

test("employment certificate in Russian", () => {
  const text = letterText(employerLetter({ ...employer, position: "бухгалтер" }, "ru"));
  assert.ok(text.includes("СПРАВКА С МЕСТА РАБОТЫ"));
  assert.ok(text.includes("работает в Example LLC с 1 марта 2020 г. в должности «бухгалтер»"));
  assert.ok(text.includes("По месту требования"));
  assert.ok(text.includes("М. П."));
  assert.ok(text.includes("Выход на работу — 18 мая 2026 г. Рабочее"), "one full stop after the date");
  assert.ok(!text.includes("г.."));
});

const sponsor = {
  place: "Toshkent",
  date: "2026-04-20",
  country: "IT",
  sponsorName: "Karim Karimov",
  sponsorBirth: "1965-01-15",
  sponsorPassport: "FB7654321",
  sponsorAddress: "Chilonzor 9, Toshkent",
  sponsorPhone: "+998 90 111 11 11",
  sponsorPosition: "engineer",
  sponsorEmployer: "Example Plant",
  relation: "father",
  applicantName: "Aziza Karimova",
  applicantBirth: "1995-03-08",
  applicantPassport: "FA1234567",
  from: "2026-05-12",
  to: "2026-05-14",
  costs: ["flights", "stay"],
};

test("sponsorship letter lists the chosen costs; 'all' replaces the rest", () => {
  const text = letterText(sponsorLetter(sponsor, "en"));
  assert.ok(text.includes("from 12 May 2026 to 14 May 2026: flights, accommodation."));
  assert.ok(text.includes("Relationship to the applicant: father"));
  assert.ok(text.includes("Country of travel: Italy"));
  assert.ok(text.includes("I am employed as engineer at Example Plant."));
  const all = letterText(sponsorLetter({ ...sponsor, costs: ["all", "flights"] }, "ru"));
  assert.ok(all.includes(": все расходы на поездку."));
  assert.ok(all.includes("Страна поездки: Италия"));
});
