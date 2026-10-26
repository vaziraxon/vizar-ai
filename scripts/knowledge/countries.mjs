// Countries the book covers, keyed by ISO 3166-1 alpha-2 ("EU" = the
// Schengen area as a whole). `names` are the Uzbek spellings used in the
// book; `match` adds English names/domains used to link a rule to an
// official source when the book gives no inline reference.
export const COUNTRIES = {
  EU: { name: "Shengen hududi", region: "schengen", names: ["Shengen hududi"], match: ["schengen", "europa.eu"] },
  AT: { name: "Avstriya", region: "schengen", names: ["Avstriya"], match: ["Austria", "Avstriya"] },
  BE: { name: "Belgiya", region: "schengen", names: ["Belgiya"], match: ["Belgium", "Belgiya"] },
  BG: { name: "Bolgariya", region: "schengen", names: ["Bolgariya"], match: ["Bulgaria", "Bolgariya"] },
  CZ: { name: "Chexiya", region: "schengen", names: ["Chexiya"], match: ["Czech", "Chexiya"] },
  DK: { name: "Daniya", region: "schengen", names: ["Daniya"], match: ["Denmark", "Daniya"] },
  EE: { name: "Estoniya", region: "schengen", names: ["Estoniya"], match: ["Estonia", "Estoniya"] },
  FI: { name: "Finlandiya", region: "schengen", names: ["Finlandiya"], match: ["Finland", "Finlandiya"] },
  FR: { name: "Fransiya", region: "schengen", names: ["Fransiya"], match: ["France", "Fransiya"] },
  DE: { name: "Germaniya", region: "schengen", names: ["Germaniya"], match: ["Germany", "Germaniya"] },
  GR: { name: "Gretsiya", region: "schengen", names: ["Gretsiya"], match: ["Greece", "Gretsiya"] },
  IS: { name: "Islandiya", region: "schengen", names: ["Islandiya"], match: ["Iceland", "Islandiya"] },
  ES: { name: "Ispaniya", region: "schengen", names: ["Ispaniya"], match: ["Spain", "Ispaniya"] },
  IT: { name: "Italiya", region: "schengen", names: ["Italiya"], match: ["Italy", "Italiya"] },
  LV: { name: "Latviya", region: "schengen", names: ["Latviya"], match: ["Latvia", "Latviya"] },
  LI: { name: "Lixtenshteyn", region: "schengen", names: ["Lixtenshteyn"], match: ["Liechtenstein", "Lixtenshteyn"] },
  LT: { name: "Litva", region: "schengen", names: ["Litva"], match: ["Lithuania", "Litva"] },
  LU: { name: "Lyuksemburg", region: "schengen", names: ["Lyuksemburg"], match: ["Luxembourg", "Lyuksemburg"] },
  MT: { name: "Malta", region: "schengen", names: ["Malta"], match: ["Malta"] },
  NL: { name: "Niderlandiya", region: "schengen", names: ["Niderlandiya"], match: ["Netherlands", "Niderlandiya"] },
  NO: { name: "Norvegiya", region: "schengen", names: ["Norvegiya"], match: ["Norway", "Norvegiya"] },
  PL: { name: "Polsha", region: "schengen", names: ["Polsha"], match: ["Poland", "Polsha"] },
  PT: { name: "Portugaliya", region: "schengen", names: ["Portugaliya"], match: ["Portugal", "Portugaliya"] },
  RO: { name: "Ruminiya", region: "schengen", names: ["Ruminiya"], match: ["Romania", "Ruminiya"] },
  SK: { name: "Slovakiya", region: "schengen", names: ["Slovakiya"], match: ["Slovakia", "Slovakiya"] },
  SI: { name: "Sloveniya", region: "schengen", names: ["Sloveniya"], match: ["Slovenia", "Sloveniya"] },
  SE: { name: "Shvetsiya", region: "schengen", names: ["Shvetsiya"], match: ["Sweden", "Shvetsiya"] },
  CH: { name: "Shveytsariya", region: "schengen", names: ["Shveytsariya"], match: ["Switzerland", "Shveytsariya"] },
  HU: { name: "Vengriya", region: "schengen", names: ["Vengriya"], match: ["Hungary", "Vengriya"] },
  HR: { name: "Xorvatiya", region: "schengen", names: ["Xorvatiya"], match: ["Croatia", "Xorvatiya"] },

  GB: { name: "Buyuk Britaniya", region: "europe_other", names: ["Buyuk Britaniya", "Britaniya"], match: ["gov.uk", "UK ", "Britaniya", "UKVI"] },
  IE: { name: "Irlandiya", region: "europe_other", names: ["Irlandiya"], match: ["Ireland", "irishimmigration", "Irlandiya"] },
  CY: { name: "Kipr", region: "europe_other", names: ["Kipr"], match: ["Cyprus", "Kipr"] },
  AL: { name: "Albaniya", region: "europe_other", names: ["Albaniya"], match: ["Albania", "e-visa.al", "Albaniya"] },
  RS: { name: "Serbiya", region: "europe_other", names: ["Serbiya"], match: ["Serbia", "Serbiya"] },
  ME: { name: "Chernogoriya", region: "europe_other", names: ["Chernogoriya"], match: ["Montenegro", "Chernogoriya"] },
  BA: { name: "Bosniya va Gersegovina", region: "europe_other", names: ["Bosniya va Gersegovina", "Bosniya"], match: ["Bosnia", "Bosniya"] },
  MK: { name: "Shimoliy Makedoniya", region: "europe_other", names: ["Shimoliy Makedoniya", "Makedoniya"], match: ["Macedonia", "Makedoniya"] },
  XK: { name: "Kosovo", region: "europe_other", names: ["Kosovo"], match: ["Kosovo"] },
  MD: { name: "Moldova", region: "europe_other", names: ["Moldova"], match: ["Moldova"] },
  TR: { name: "Turkiya", region: "europe_other", names: ["Turkiya"], match: ["Turkey", "Türkiye", "Turkiya"] },
  GE: { name: "Gruziya", region: "europe_other", names: ["Gruziya"], match: ["Georgia", "Gruziya"] },
  AM: { name: "Armaniston", region: "europe_other", names: ["Armaniston"], match: ["Armenia", "Armaniston"] },
  AZ: { name: "Ozarbayjon", region: "europe_other", names: ["Ozarbayjon"], match: ["Azerbaijan", "Ozarbayjon"] },

  US: { name: "AQSh", region: "americas_oceania", names: ["AQSh"], match: ["travel.state.gov", "U.S.", "AQSh", "ustraveldocs", "usembassy"] },
  CA: { name: "Kanada", region: "americas_oceania", names: ["Kanada"], match: ["canada.ca", "IRCC", "Canada", "Kanada"] },
  AU: { name: "Avstraliya", region: "americas_oceania", names: ["Avstraliya"], match: ["homeaffairs.gov.au", "Australia", "Avstraliya"] },
  NZ: { name: "Yangi Zelandiya", region: "americas_oceania", names: ["Yangi Zelandiya"], match: ["immigration.govt.nz", "New Zealand", "Zelandiya"] },

  JP: { name: "Yaponiya", region: "asia_middle_east", names: ["Yaponiya"], match: ["Japan", "emb-japan", "mofa.go.jp", "Yaponiya"] },
  KR: { name: "Janubiy Koreya", region: "asia_middle_east", names: ["Janubiy Koreya"], match: ["Korea", "mofa.go.kr", "k-eta", "Koreya"] },
  CN: { name: "Xitoy", region: "asia_middle_east", names: ["Xitoy"], match: ["China", "Xitoy", "gov.uz/en/mfa"] },
  AE: { name: "BAA", region: "asia_middle_east", names: ["BAA", "Birlashgan Arab Amirliklari"], match: ["UAE", "Emirates", "u.ae", "icp.gov.ae", "BAA"] },
  TH: { name: "Tailand", region: "asia_middle_east", names: ["Tailand"], match: ["Thai", "Tailand"] },
  VN: { name: "Vyetnam", region: "asia_middle_east", names: ["Vyetnam"], match: ["Viet", "Vyetnam"] },
  ID: { name: "Indoneziya", region: "asia_middle_east", names: ["Indoneziya"], match: ["Indonesia", "imigrasi", "Indoneziya"] },
  MY: { name: "Malayziya", region: "asia_middle_east", names: ["Malayziya"], match: ["Malaysia", "imi.gov.my", "MDAC", "Malayziya"] },
  SG: { name: "Singapur", region: "asia_middle_east", names: ["Singapur"], match: ["Singapore", "ica.gov.sg", "Singapur"] },
  IN: { name: "Hindiston", region: "asia_middle_east", names: ["Hindiston"], match: ["India", "indianvisaonline", "Hindiston"] },
  SA: { name: "Saudiya Arabistoni", region: "asia_middle_east", names: ["Saudiya Arabistoni", "Saudiya"], match: ["Saudi", "visa.visitsaudi", "Saudiya"] },
  QA: { name: "Qatar", region: "asia_middle_east", names: ["Qatar"], match: ["Qatar", "hayya", "moi.gov.qa"] },
  OM: { name: "Omon", region: "asia_middle_east", names: ["Omon"], match: ["Oman", "rop.gov.om", "Omon"] },
};

const NAME_INDEX = Object.entries(COUNTRIES)
  .filter(([code]) => code !== "EU")
  .flatMap(([code, c]) => c.names.map((name) => ({ code, name })))
  .sort((a, b) => b.name.length - a.name.length);

/** ISO codes of every country named in `text`, longest names first ("Janubiy Koreya" before "Koreya"). */
export function countriesIn(text) {
  let rest = ` ${text} `;
  const found = [];
  for (const { code, name } of NAME_INDEX) {
    // Suffixes are allowed ("AQShga", "Avstriyada"); the left edge must be a word start.
    const re = new RegExp(`(^|[^\\p{L}])${name}`, "u");
    if (re.test(rest)) {
      if (!found.includes(code)) found.push(code);
      rest = rest.replace(new RegExp(name, "gu"), " ");
    }
  }
  return found;
}
