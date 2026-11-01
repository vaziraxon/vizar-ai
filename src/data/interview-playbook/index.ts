/**
 * The VIZAR AI interview playbook: 52 countries, 150 questions each (30 easy,
 * 50 medium, 70 hard), in Uzbek, Russian and English.
 *
 * This file is only the list of countries, so client code can import it. The
 * questions are in Supabase (supabase/interview_questions.sql), because this
 * repository is public, and are read through /api/interview/questions. See
 * scripts/interview-playbook/ for how they are built and loaded.
 */
export type PlaybookLang = "uz" | "ru" | "en";
export type PlaybookLevel = "easy" | "medium" | "hard";

export interface PlaybookEntry {
  id: string;
  question: Record<PlaybookLang, string>;
  /** A sample to adapt: [brackets] mark what the applicant replaces with their own facts */
  answer: Record<PlaybookLang, string>;
  /** Coaching note; the playbook has it in Uzbek only */
  note: string;
}

export interface PlaybookCountry {
  code: string;
  name: Record<PlaybookLang, string>;
  visa: string;
}

/** `label` is the Uzbek source for the phrase table, as saved in practice history. */
export const PLAYBOOK_LEVELS: { key: PlaybookLevel; label: string; emoji: string; count: number }[] = [
  { key: "easy", label: "Oson", emoji: "🌱", count: 30 },
  { key: "medium", label: "O'rtacha", emoji: "⚖️", count: 50 },
  { key: "hard", label: "Qiyin", emoji: "🔥", count: 70 },
];

const SCHENGEN = "Schengen C";

const country = (code: string, uz: string, ru: string, en: string, visa: string): PlaybookCountry => ({
  code,
  name: { uz, ru, en },
  visa,
});

// Same order as the playbook.
export const PLAYBOOK_COUNTRIES: PlaybookCountry[] = [
  country("us", "AQSH", "США", "United States", "B1/B2"),
  country("kr", "Janubiy Koreya", "Южная Корея", "South Korea", "C-3-9"),
  country("de", "Germaniya", "Германия", "Germany", SCHENGEN),
  country("ca", "Kanada", "Канада", "Canada", "TRV"),
  country("gb", "Buyuk Britaniya", "Великобритания", "United Kingdom", "Standard Visitor"),
  country("au", "Avstraliya", "Австралия", "Australia", "Subclass 600"),
  country("jp", "Yaponiya", "Япония", "Japan", "Temporary Visitor"),
  country("nz", "Yangi Zelandiya", "Новая Зеландия", "New Zealand", "Visitor Visa"),
  country("fr", "Fransiya", "Франция", "France", SCHENGEN),
  country("it", "Italiya", "Италия", "Italy", SCHENGEN),
  country("es", "Ispaniya", "Испания", "Spain", SCHENGEN),
  country("pl", "Polsha", "Польша", "Poland", SCHENGEN),
  country("ch", "Shveytsariya", "Швейцария", "Switzerland", SCHENGEN),
  country("at", "Avstriya", "Австрия", "Austria", SCHENGEN),
  country("nl", "Niderlandiya", "Нидерланды", "Netherlands", SCHENGEN),
  country("be", "Belgiya", "Бельгия", "Belgium", SCHENGEN),
  country("cz", "Chexiya", "Чехия", "Czechia", SCHENGEN),
  country("hu", "Vengriya", "Венгрия", "Hungary", SCHENGEN),
  country("dk", "Daniya", "Дания", "Denmark", SCHENGEN),
  country("se", "Shvetsiya", "Швеция", "Sweden", SCHENGEN),
  country("no", "Norvegiya", "Норвегия", "Norway", SCHENGEN),
  country("fi", "Finlandiya", "Финляндия", "Finland", SCHENGEN),
  country("pt", "Portugaliya", "Португалия", "Portugal", SCHENGEN),
  country("gr", "Gretsiya", "Греция", "Greece", SCHENGEN),
  country("ie", "Irlandiya", "Ирландия", "Ireland", "Short Stay C"),
  country("is", "Islandiya", "Исландия", "Iceland", SCHENGEN),
  country("sk", "Slovakiya", "Словакия", "Slovakia", SCHENGEN),
  country("lu", "Lyuksemburg", "Люксембург", "Luxembourg", SCHENGEN),
  country("si", "Sloveniya", "Словения", "Slovenia", SCHENGEN),
  country("mt", "Malta", "Мальта", "Malta", SCHENGEN),
  country("lt", "Litva", "Литва", "Lithuania", SCHENGEN),
  country("lv", "Latviya", "Латвия", "Latvia", SCHENGEN),
  country("ee", "Estoniya", "Эстония", "Estonia", SCHENGEN),
  country("bg", "Bolgariya", "Болгария", "Bulgaria", SCHENGEN),
  country("ro", "Ruminiya", "Румыния", "Romania", SCHENGEN),
  country("hr", "Xorvatiya", "Хорватия", "Croatia", SCHENGEN),
  country("cy", "Kipr", "Кипр", "Cyprus", "National C"),
  country("in", "Hindiston", "Индия", "India", "e-Tourist Visa"),
  country("za", "Janubiy Afrika", "Южная Африка", "South Africa", "Visitor's Visa"),
  country("br", "Braziliya", "Бразилия", "Brazil", "VIVIS"),
  country("mx", "Meksika", "Мексика", "Mexico", "Tourist visa"),
  country("ar", "Argentina", "Аргентина", "Argentina", "Visa para Turismo"),
  country("cl", "Chili", "Чили", "Chile", "Permanencia Transitoria"),
  country("pe", "Peru", "Перу", "Peru", "Visa de Turista"),
  country("co", "Kolumbiya", "Колумбия", "Colombia", "Visa V"),
  country("ec", "Ekvador", "Эквадор", "Ecuador", "eVISAS"),
  country("cr", "Kosta-Rika", "Коста-Рика", "Costa Rica", "Restricted Visa"),
  country("pa", "Panama", "Панама", "Panama", "Visa Autorizada"),
  country("uy", "Urugvay", "Уругвай", "Uruguay", "Tourist visa"),
  country("py", "Paragvay", "Парагвай", "Paraguay", "Tourist visa"),
  country("bo", "Boliviya", "Боливия", "Bolivia", "Tourist visa"),
  country("cu", "Kuba", "Куба", "Cuba", "eVisaCuba"),
];
