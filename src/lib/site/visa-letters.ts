/**
 * Visa letters built from a form, no AI: a cover letter with a day-by-day
 * travel programme, an employment certificate and a sponsorship letter, in
 * English, German or Russian. Names and countries are never inflected —
 * they go into "label: value" lines — so any input stays grammatical.
 * An empty field prints as GAP, so a missing detail is visible on paper.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */

export type OutLang = "en" | "de" | "ru";
export type LetterKind = "cover" | "employer" | "sponsor";
export type Purpose = "tourism" | "family" | "business";
export type Plan = "arrival" | "sightseeing" | "museums" | "family" | "business" | "travel" | "free" | "departure";
/** Who the sponsor is to the applicant */
export type Relation = "father" | "mother" | "husband" | "wife" | "son" | "daughter" | "brother" | "sister" | "relative";
export type CostItem = "all" | "flights" | "stay" | "daily" | "insurance";

export const OUT_LANGS: OutLang[] = ["en", "de", "ru"];
export const PURPOSES: Purpose[] = ["tourism", "family", "business"];
export const PLANS: Plan[] = ["arrival", "sightseeing", "museums", "family", "business", "travel", "free", "departure"];
export const RELATIONS: Relation[] = ["father", "mother", "husband", "wife", "son", "daughter", "brother", "sister", "relative"];
export const COST_ITEMS: CostItem[] = ["all", "flights", "stay", "daily", "insurance"];
export const CURRENCIES = ["UZS", "USD", "EUR"];
/** The Schengen states and the United Kingdom */
export const LETTER_COUNTRIES = "AT BE BG CH CZ DE DK EE ES FI FR GB GR HR HU IS IT LI LT LU LV MT NL NO PL PT RO SE SI SK".split(" ");
/** Longest programme shown day by day */
export const MAX_DAYS = 31;

/** A missing detail, printed so it can be seen and filled in by hand */
export const GAP = "[____]";
const val = (s: string | undefined) => (s ?? "").trim() || GAP;
const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
};
const DAY_MS = 86_400_000;

const LOCALE: Record<OutLang, string> = { en: "en-GB", de: "de-DE", ru: "ru-RU" };

/** 12 May 2026 · 12. Mai 2026 · 12 мая 2026 г. */
export function longDate(iso: string, lang: OutLang) {
  if (!isIso(iso)) return GAP;
  return new Intl.DateTimeFormat(LOCALE[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utc(iso));
}

/** 12.05.2026 */
export const shortDate = (iso: string) => (isIso(iso) ? iso.split("-").reverse().join(".") : GAP);

export function countryName(code: string, lang: string) {
  if (!code) return GAP;
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Number of days from `from` to `to`, both counted; 0 when the dates are missing or reversed */
export function tripLength(from: string, to: string) {
  if (!isIso(from) || !isIso(to) || utc(to) < utc(from)) return 0;
  return (utc(to) - utc(from)) / DAY_MS + 1;
}

/** Every date of the trip as YYYY-MM-DD, at most MAX_DAYS */
export function tripDates(from: string, to: string) {
  const n = Math.min(tripLength(from, to), MAX_DAYS);
  return Array.from({ length: n }, (_, i) => new Date(utc(from) + i * DAY_MS).toISOString().slice(0, 10));
}

/** First day arrival, last day departure, sightseeing in between */
export const defaultPlan = (index: number, count: number): Plan =>
  index === 0 ? "arrival" : index === count - 1 ? "departure" : "sightseeing";

interface Phrases {
  tel: string;
  to: (country: string) => string;
  toAnyone: string;
  signature: string;
  stamp: string;
  purposes: Record<Purpose, string>;
  plans: Record<Plan, string>;
  relations: Record<Relation, string>;
  costs: Record<CostItem, string>;
  cover: {
    title: (purpose: string, from: string, to: string) => string;
    greeting: string;
    intro: string;
    name: string;
    born: string;
    passport: string;
    purpose: string;
    datesLabel: string;
    dates: (from: string, to: string, n: number) => string;
    tableHead: [string, string, string, string, string];
    paySelf: string;
    paySponsor: (sponsor: string, relation: string) => string;
    work: (position: string, employer: string) => string;
    back: (to: string, city: string) => string;
    thanks: string;
    closing: string;
  };
  employer: {
    title: string;
    tin: string;
    body: (name: string, born: string, passport: string, company: string, since: string, position: string) => string;
    salary: (amount: string, currency: string) => string;
    leave: (name: string, from: string, to: string, back: string) => string;
  };
  sponsor: {
    title: string;
    body: (name: string, born: string, passport: string, costs: string, applicant: string, aBorn: string, aPassport: string, from: string, to: string) => string;
    relation: string;
    country: string;
    work: (position: string, employer: string) => string;
    enclosed: string;
  };
}

const PHRASES: Record<OutLang, Phrases> = {
  en: {
    tel: "Tel.",
    to: (c) => `To: Embassy / Consulate — ${c}`,
    toAnyone: "To whom it may concern",
    signature: "Signature: ______________",
    stamp: "Stamp",
    purposes: { tourism: "tourism", family: "visiting family and friends", business: "business" },
    plans: {
      arrival: "Arrival, check-in",
      sightseeing: "City sightseeing",
      museums: "Museums and historical sites",
      family: "Visiting family / friends",
      business: "Business meetings",
      travel: "Travel to the next city",
      free: "Free day",
      departure: "Departure",
    },
    relations: {
      father: "father",
      mother: "mother",
      husband: "husband",
      wife: "wife",
      son: "son",
      daughter: "daughter",
      brother: "brother",
      sister: "sister",
      relative: "relative",
    },
    costs: { all: "all travel costs", flights: "flights", stay: "accommodation", daily: "daily expenses", insurance: "travel medical insurance" },
    cover: {
      title: (p, f, t) => `Visa application — ${p}, ${f} – ${t}`,
      greeting: "Dear Sir or Madam,",
      intro: "I hereby apply for a short-stay visa. Please find the details of my trip below.",
      name: "Name",
      born: "Date of birth",
      passport: "Passport No.",
      purpose: "Purpose of the trip",
      datesLabel: "Travel dates",
      dates: (f, t, n) => `${f} – ${t} (${n} ${n === 1 ? "day" : "days"})`,
      tableHead: ["Day", "Date", "City", "Accommodation", "Programme"],
      paySelf: "I am covering all costs of the trip myself.",
      paySponsor: (s, r) => `The costs of the trip are covered by ${s} (my ${r}).`,
      work: (p, e) => `I work as ${p} at ${e}.`,
      back: (t, c) => `At the end of the trip, on ${t}, I will return home to ${c}.`,
      thanks: "Thank you for considering my application.",
      closing: "Yours faithfully,",
    },
    employer: {
      title: "EMPLOYMENT CERTIFICATE",
      tin: "Tax ID (STIR/INN)",
      body: (n, b, p, c, s, pos) =>
        `This is to certify that ${n}, born on ${b}, passport No. ${p}, has been employed by ${c} since ${s} and currently holds the position of ${pos}.`,
      salary: (a, c) => `The employee's total salary for the last 12 months was ${a} ${c}.`,
      leave: (n, f, t, b) => `${n} has been granted leave from ${f} to ${t} and will return to work on ${b}. The position is kept during the leave.`,
    },
    sponsor: {
      title: "LETTER OF SPONSORSHIP",
      body: (n, b, p, costs, a, ab, ap, f, t) =>
        `I, ${n}, born on ${b}, passport No. ${p}, confirm that I will cover the following costs of the trip of ${a}, born on ${ab}, passport No. ${ap}, from ${f} to ${t}: ${costs}.`,
      relation: "Relationship to the applicant",
      country: "Country of travel",
      work: (p, e) => `I am employed as ${p} at ${e}.`,
      enclosed: "Enclosed: a copy of my passport, my bank statement and a document confirming our relationship.",
    },
  },
  de: {
    tel: "Tel.",
    to: (c) => `An: Botschaft / Konsulat – ${c}`,
    toAnyone: "Zur Vorlage bei der zuständigen Stelle",
    signature: "Unterschrift: ______________",
    stamp: "Stempel",
    purposes: { tourism: "Tourismus", family: "Besuch von Familie und Freunden", business: "Geschäftsreise" },
    plans: {
      arrival: "Anreise, Check-in",
      sightseeing: "Stadtbesichtigung",
      museums: "Museen und Sehenswürdigkeiten",
      family: "Besuch bei Familie / Freunden",
      business: "Geschäftstermine",
      travel: "Weiterreise in die nächste Stadt",
      free: "Freier Tag",
      departure: "Abreise",
    },
    relations: {
      father: "Vater",
      mother: "Mutter",
      husband: "Ehemann",
      wife: "Ehefrau",
      son: "Sohn",
      daughter: "Tochter",
      brother: "Bruder",
      sister: "Schwester",
      relative: "Verwandte/r",
    },
    costs: {
      all: "sämtliche Reisekosten",
      flights: "Flugkosten",
      stay: "Unterkunft",
      daily: "Lebenshaltungskosten während der Reise",
      insurance: "Reisekrankenversicherung",
    },
    cover: {
      title: (p, f, t) => `Visumantrag – ${p}, ${f} – ${t}`,
      greeting: "Sehr geehrte Damen und Herren,",
      intro: "hiermit beantrage ich ein Visum für einen kurzfristigen Aufenthalt. Nachstehend finden Sie die Angaben zu meiner Reise.",
      name: "Name",
      born: "Geburtsdatum",
      passport: "Reisepass-Nr.",
      purpose: "Reisezweck",
      datesLabel: "Reisezeitraum",
      dates: (f, t, n) => `${f} – ${t} (${n} ${n === 1 ? "Tag" : "Tage"})`,
      tableHead: ["Tag", "Datum", "Ort", "Unterkunft", "Programm"],
      paySelf: "Die Kosten der Reise trage ich selbst.",
      paySponsor: (s, r) => `Die Kosten der Reise übernimmt ${s} (${r}).`,
      work: (p, e) => `Ich bin als ${p} bei ${e} beschäftigt.`,
      back: (t, c) => `Am Ende der Reise, am ${t}, kehre ich nach ${c} zurück.`,
      thanks: "Vielen Dank für die Prüfung meines Antrags.",
      closing: "Mit freundlichen Grüßen",
    },
    employer: {
      title: "ARBEITGEBERBESCHEINIGUNG",
      tin: "Steuernummer (STIR/INN)",
      body: (n, b, p, c, s, pos) =>
        `Hiermit bestätigen wir, dass ${n}, geboren am ${b}, Reisepass-Nr. ${p}, seit dem ${s} bei ${c} als ${pos} beschäftigt ist.`,
      salary: (a, c) => `Das Gehalt der letzten 12 Monate betrug insgesamt ${a} ${c}.`,
      leave: (_n, f, t, b) =>
        `Für den Zeitraum vom ${f} bis zum ${t} wurde Urlaub gewährt. Die Arbeit wird am ${b} wieder aufgenommen. Der Arbeitsplatz bleibt während des Urlaubs erhalten.`,
    },
    sponsor: {
      title: "ERKLÄRUNG ZUR KOSTENÜBERNAHME",
      body: (n, b, p, costs, a, ab, ap, f, t) =>
        `Ich, ${n}, geboren am ${b}, Reisepass-Nr. ${p}, erkläre, dass ich für die Reise von ${a}, geboren am ${ab}, Reisepass-Nr. ${ap}, im Zeitraum vom ${f} bis zum ${t} folgende Kosten übernehme: ${costs}.`,
      relation: "Verwandtschaftsverhältnis zur antragstellenden Person",
      country: "Reiseland",
      work: (p, e) => `Ich bin als ${p} bei ${e} beschäftigt.`,
      enclosed: "Anlagen: Kopie meines Reisepasses, mein Kontoauszug und ein Nachweis über das Verwandtschaftsverhältnis.",
    },
  },
  ru: {
    tel: "Тел.",
    to: (c) => `В посольство / консульство: ${c}`,
    toAnyone: "По месту требования",
    signature: "Подпись: ______________",
    stamp: "М. П.",
    purposes: { tourism: "туризм", family: "посещение родственников и друзей", business: "деловая поездка" },
    plans: {
      arrival: "Прибытие, заселение",
      sightseeing: "Обзорная экскурсия по городу",
      museums: "Музеи и достопримечательности",
      family: "Встреча с родственниками / друзьями",
      business: "Деловые встречи",
      travel: "Переезд в следующий город",
      free: "Свободный день",
      departure: "Отъезд",
    },
    relations: {
      father: "отец",
      mother: "мать",
      husband: "муж",
      wife: "жена",
      son: "сын",
      daughter: "дочь",
      brother: "брат",
      sister: "сестра",
      relative: "родственник (родственница)",
    },
    costs: {
      all: "все расходы на поездку",
      flights: "авиабилеты",
      stay: "проживание",
      daily: "ежедневные расходы",
      insurance: "медицинская страховка",
    },
    cover: {
      title: (p, f, t) => `Заявление на визу — ${p}, ${f} – ${t}`,
      greeting: "Уважаемые дамы и господа!",
      intro: "Прошу выдать мне краткосрочную визу. Сведения о поездке приведены ниже.",
      name: "ФИО",
      born: "Дата рождения",
      passport: "Паспорт №",
      purpose: "Цель поездки",
      datesLabel: "Даты поездки",
      dates: (f, t, n) => `${f} – ${t} (${n} дн.)`,
      tableHead: ["День", "Дата", "Город", "Проживание", "Программа"],
      paySelf: "Все расходы на поездку я оплачиваю самостоятельно.",
      paySponsor: (s, r) => `Расходы на поездку оплачивает ${s} (${r}).`,
      work: (p, e) => `Место работы: ${e}, должность: ${p}.`,
      back: (t, c) => `По окончании поездки, ${t}, я вернусь домой (${c}).`,
      thanks: "Благодарю за рассмотрение моего заявления.",
      closing: "С уважением,",
    },
    employer: {
      title: "СПРАВКА С МЕСТА РАБОТЫ",
      tin: "ИНН (STIR)",
      body: (n, b, p, c, s, pos) =>
        `Настоящим подтверждаем, что ${n}, дата рождения: ${b}, паспорт № ${p}, работает в ${c} с ${s} в должности «${pos}».`,
      salary: (a, c) => `Заработная плата за последние 12 месяцев составила ${a} ${c}.`,
      // A Russian date ends in "г.", so it takes no second full stop.
      leave: (_n, f, t, b) => `С ${f} по ${t} сотруднику предоставлен отпуск. Выход на работу — ${b.replace(/.$/, "")}. Рабочее место на время отпуска сохраняется.`,
    },
    sponsor: {
      title: "СПОНСОРСКОЕ ПИСЬМО",
      body: (n, b, p, costs, a, ab, ap, f, t) =>
        `Я, ${n}, дата рождения: ${b}, паспорт № ${p}, подтверждаю, что оплачиваю следующие расходы на поездку заявителя ${a} (дата рождения: ${ab}, паспорт № ${ap}) в период с ${f} по ${t}: ${costs}.`,
      relation: "Степень родства с заявителем",
      country: "Страна поездки",
      work: (p, e) => `Место работы: ${e}, должность: ${p}.`,
      enclosed: "Прилагаю: копию паспорта, выписку с банковского счёта и документ, подтверждающий родство.",
    },
  },
};

export type Block =
  | { type: "from"; lines: string[] }
  | { type: "meta"; lines: string[] }
  | { type: "title"; text: string }
  | { type: "text"; text: string }
  | { type: "fields"; rows: [string, string][] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "sign"; lines: string[] };

interface Common {
  /** Where the letter is signed */
  place: string;
  /** Date of the letter, YYYY-MM-DD */
  date: string;
  /** ISO code; "" for an employment certificate with no addressee */
  country: string;
}

export interface CoverData extends Common {
  fullName: string;
  birthDate: string;
  passport: string;
  address: string;
  phone: string;
  email: string;
  homeCity: string;
  purpose: Purpose;
  from: string;
  to: string;
  /** One per trip date, by index. Empty city or stay repeats the day before; plan null is the default. */
  days: { city: string; stay: string; plan: Plan | null }[];
  funding: "self" | "sponsor";
  sponsorName: string;
  relation: Relation;
  position: string;
  employer: string;
}

export interface EmployerData extends Common {
  fullName: string;
  birthDate: string;
  passport: string;
  position: string;
  since: string;
  salary: string;
  currency: string;
  leaveFrom: string;
  leaveTo: string;
  returnOn: string;
  company: string;
  companyAddress: string;
  companyPhone: string;
  companyWeb: string;
  companyTin: string;
  signatory: string;
  signatoryTitle: string;
}

export interface SponsorData extends Common {
  sponsorName: string;
  sponsorBirth: string;
  sponsorPassport: string;
  sponsorAddress: string;
  sponsorPhone: string;
  sponsorPosition: string;
  sponsorEmployer: string;
  relation: Relation;
  applicantName: string;
  applicantBirth: string;
  applicantPassport: string;
  from: string;
  to: string;
  costs: CostItem[];
}

const dateLine = (d: Common, lang: OutLang) => `${val(d.place)}, ${longDate(d.date, lang)}`;
const addressee = (d: Common, t: Phrases, lang: OutLang) => (d.country ? t.to(countryName(d.country, lang)) : t.toAnyone);

export function coverLetter(d: CoverData, lang: OutLang): Block[] {
  const t = PHRASES[lang];
  const c = t.cover;
  const from = longDate(d.from, lang);
  const to = longDate(d.to, lang);
  const dates = tripDates(d.from, d.to);
  let city = "";
  let stay = "";
  const rows = dates.map((iso, i) => {
    const day = d.days[i];
    city = day?.city.trim() || city;
    stay = day?.stay.trim() || stay;
    return [String(i + 1), shortDate(iso), val(city), val(stay), t.plans[day?.plan ?? defaultPlan(i, dates.length)]];
  });
  const hasJob = d.position.trim() || d.employer.trim();
  return [
    {
      type: "from",
      lines: [val(d.fullName), val(d.address), `${t.tel}: ${val(d.phone)}`, ...(d.email.trim() ? [`E-mail: ${d.email.trim()}`] : [])],
    },
    { type: "meta", lines: [dateLine(d, lang), addressee(d, t, lang)] },
    { type: "title", text: c.title(t.purposes[d.purpose], shortDate(d.from), shortDate(d.to)) },
    { type: "text", text: c.greeting },
    { type: "text", text: c.intro },
    {
      type: "fields",
      rows: [
        [c.name, val(d.fullName)],
        [c.born, longDate(d.birthDate, lang)],
        [c.passport, val(d.passport)],
        [c.purpose, t.purposes[d.purpose]],
        [c.datesLabel, c.dates(from, to, tripLength(d.from, d.to))],
      ],
    },
    { type: "table", head: [...c.tableHead], rows: rows.length ? rows : [["1", GAP, GAP, GAP, GAP]] },
    { type: "text", text: d.funding === "self" ? c.paySelf : c.paySponsor(val(d.sponsorName), t.relations[d.relation]) },
    { type: "text", text: [...(hasJob ? [c.work(val(d.position), val(d.employer))] : []), c.back(to, val(d.homeCity))].join(" ") },
    { type: "text", text: c.thanks },
    { type: "sign", lines: [c.closing, val(d.fullName), t.signature] },
  ];
}

export function employerLetter(d: EmployerData, lang: OutLang): Block[] {
  const t = PHRASES[lang];
  const e = t.employer;
  return [
    {
      type: "from",
      lines: [val(d.company), val(d.companyAddress), `${t.tel}: ${val(d.companyPhone)}`, val(d.companyWeb), `${e.tin}: ${val(d.companyTin)}`],
    },
    { type: "meta", lines: [dateLine(d, lang), addressee(d, t, lang)] },
    { type: "title", text: e.title },
    {
      type: "text",
      text: e.body(val(d.fullName), longDate(d.birthDate, lang), val(d.passport), val(d.company), longDate(d.since, lang), val(d.position)),
    },
    { type: "text", text: e.salary(val(d.salary), val(d.currency)) },
    { type: "text", text: e.leave(val(d.fullName), longDate(d.leaveFrom, lang), longDate(d.leaveTo, lang), longDate(d.returnOn, lang)) },
    { type: "sign", lines: [val(d.signatoryTitle), val(d.signatory), t.signature, t.stamp] },
  ];
}

export function sponsorLetter(d: SponsorData, lang: OutLang): Block[] {
  const t = PHRASES[lang];
  const s = t.sponsor;
  const items = d.costs.includes("all") || !d.costs.length ? ["all" as const] : COST_ITEMS.filter((c) => d.costs.includes(c));
  const costs = items.map((c) => t.costs[c]).join(", ");
  const hasJob = d.sponsorPosition.trim() || d.sponsorEmployer.trim();
  return [
    { type: "from", lines: [val(d.sponsorName), val(d.sponsorAddress), `${t.tel}: ${val(d.sponsorPhone)}`] },
    { type: "meta", lines: [dateLine(d, lang), addressee(d, t, lang)] },
    { type: "title", text: s.title },
    {
      type: "text",
      text: s.body(
        val(d.sponsorName),
        longDate(d.sponsorBirth, lang),
        val(d.sponsorPassport),
        costs,
        val(d.applicantName),
        longDate(d.applicantBirth, lang),
        val(d.applicantPassport),
        longDate(d.from, lang),
        longDate(d.to, lang)
      ),
    },
    {
      type: "fields",
      rows: [
        [s.relation, t.relations[d.relation]],
        [s.country, countryName(d.country, lang)],
      ],
    },
    ...(hasJob ? [{ type: "text" as const, text: s.work(val(d.sponsorPosition), val(d.sponsorEmployer)) }] : []),
    { type: "text", text: s.enclosed },
    { type: "sign", lines: [val(d.sponsorName), t.signature] },
  ];
}

/** The letter as plain text, for copying into a word processor */
export function letterText(blocks: Block[]) {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "from":
        case "meta":
        case "sign":
          return b.lines.join("\n");
        case "title":
        case "text":
          return b.text;
        case "fields":
          return b.rows.map(([k, v]) => `${k}: ${v}`).join("\n");
        case "table":
          return [b.head, ...b.rows].map((r) => r.join(" | ")).join("\n");
      }
    })
    .join("\n\n");
}

export const hasGaps = (blocks: Block[]) => letterText(blocks).includes(GAP);
