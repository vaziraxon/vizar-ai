/**
 * Photos and emoji for the "Viza ma'lumotlar bazasi" library.
 *
 * Photos are the self-hosted Unsplash images already used on the site
 * (credits in PHOTO_CREDITS, src/lib/site/registry.ts). Emoji are single
 * code points only — no flag emoji (Windows shows them as letters; real
 * flags come from <CountryFlag>) and no ZWJ sequences.
 */
import type { Region } from "./library";

export interface Cover {
  /** Photo in /public/images, or none for an illustrated (gradient + emoji) cover */
  photo?: string;
  /** Three emoji for the illustrated cover / stickers */
  emojis: [string, string, string];
  /** Tailwind gradient classes for the illustrated cover */
  gradient: string;
}

const PASSPORTS = "/images/travel/passports.webp";

export const CHAPTER_COVERS: Record<number, Cover> = {
  1: { photo: PASSPORTS, emojis: ["🛂", "🌍", "✈️"], gradient: "from-sky-100 via-indigo-50 to-violet-100" },
  2: { emojis: ["📑", "🏦", "✍️"], gradient: "from-amber-100 via-orange-50 to-rose-100" },
  3: { emojis: ["🗂️", "📅", "🏛️"], gradient: "from-sky-100 via-cyan-50 to-indigo-100" },
  4: { emojis: ["🎙️", "💬", "✅"], gradient: "from-emerald-100 via-teal-50 to-sky-100" },
  5: { photo: "/images/destinations/schengen.webp", emojis: ["🏛️", "🥐", "🚆"], gradient: "from-blue-100 to-indigo-100" },
  6: { photo: "/images/destinations/gb.webp", emojis: ["🏰", "☕", "🚌"], gradient: "from-rose-100 to-violet-100" },
  7: { photo: "/images/destinations/us.webp", emojis: ["🗽", "🍁", "🦘"], gradient: "from-red-100 to-blue-100" },
  8: { photo: "/images/destinations/jp.webp", emojis: ["🏯", "🌸", "🕌"], gradient: "from-pink-100 to-amber-100" },
  9: { emojis: ["🤖", "✨", "📊"], gradient: "from-violet-200 via-indigo-100 to-sky-100" },
};

const KIND_EMOJI: Record<string, string> = {
  front: "📖",
  intro: "✍️",
  conclusion: "🎯",
  appendix: "🧰",
  sources: "🔗",
  editorial: "📝",
};

const CHAPTER_EMOJI: Record<number, string> = { 1: "🛂", 2: "📑", 3: "🗂️", 4: "🎙️", 5: "🏛️", 6: "🏰", 7: "🗽", 8: "🏯", 9: "🤖" };

export function chapterEmoji(chapter: { kind: string; number: number | null }): string {
  return (chapter.number && CHAPTER_EMOJI[chapter.number]) || KIND_EMOJI[chapter.kind] || "📘";
}

/** For search hits, which carry only the slug: "bob-5" → 🏛️, front matter → 📘. */
export function chapterSlugEmoji(slug: string): string {
  const n = /^bob-(\d+)$/.exec(slug)?.[1];
  return n ? chapterEmoji({ kind: "chapter", number: Number(n) }) : "📘";
}

export function chapterCover(chapter: { kind: string; number: number | null }): Cover {
  return (
    (chapter.number && CHAPTER_COVERS[chapter.number]) || {
      emojis: [chapterEmoji(chapter), "📚", "✨"],
      gradient: "from-violet-100 via-surface to-sky-100",
    }
  );
}

export const REGION_VISUALS: Record<Region, { photo: string; emoji: string; flag?: string; blurb: string }> = {
  schengen: {
    photo: "/images/destinations/schengen.webp",
    emoji: "🏛️",
    flag: "EU",
    blurb: "Bitta viza bilan 29 davlat: qaysi konsullikka topshirish va 90/180 qoidasi.",
  },
  europe_other: {
    photo: "/images/destinations/gb.webp",
    emoji: "🏰",
    blurb: "Britaniya, Irlandiya, Bolqon va Kavkaz: alohida milliy qoidalar.",
  },
  americas_oceania: {
    photo: "/images/destinations/us.webp",
    emoji: "🗽",
    blurb: "AQSh, Kanada, Avstraliya va Yangi Zelandiya: anketa, biometrika, suhbat.",
  },
  asia_middle_east: {
    photo: "/images/destinations/jp.webp",
    emoji: "🏯",
    blurb: "e-Visa, vizasiz kirish va Yaqin Sharq davlatlari: tez o‘zgaradigan rejimlar.",
  },
  general: {
    photo: PASSPORTS,
    emoji: "🧭",
    blurb: "Barcha yo‘nalishlar uchun umumiy qoidalar.",
  },
};

/** Countries with their own photo on the site; the rest use their region's photo. */
const COUNTRY_PHOTOS: Record<string, string> = {
  AE: "/images/destinations/ae.webp",
  CA: "/images/destinations/ca.webp",
  DE: "/images/destinations/de.webp",
  FR: "/images/destinations/fr.webp",
  GB: "/images/destinations/gb.webp",
  IT: "/images/destinations/it.webp",
  JP: "/images/destinations/jp.webp",
  KR: "/images/destinations/kr.webp",
  TR: "/images/destinations/tr.webp",
  US: "/images/destinations/us.webp",
  EU: "/images/destinations/schengen.webp",
};

export function countryPhoto(code: string, region: Region): string {
  return COUNTRY_PHOTOS[code.toUpperCase()] ?? REGION_VISUALS[region].photo;
}

export const hasOwnPhoto = (code: string) => code.toUpperCase() in COUNTRY_PHOTOS;

/** Rule topics ("Murojaat yo‘li", "Viza yig‘imi (2026-10-26 holati)", …) → emoji. */
const TOPIC_EMOJI: [RegExp, string][] = [
  [/murojaat|qabul yo|vakillik/i, "📍"],
  [/hujjat/i, "📑"],
  [/amaliy vaziyat/i, "💡"],
  [/yig.im|to.lov/i, "💳"],
  [/turistik/i, "🧳"],
  [/kirish (rejimi|tartibi)/i, "🛬"],
  [/viza tizimi/i, "⚖️"],
  [/tahririy|tekshirilgan/i, "✅"],
];

export function topicEmoji(topic: string): string {
  return TOPIC_EMOJI.find(([re]) => re.test(topic))?.[1] ?? "📌";
}

/** Section titles → a fitting emoji (first match wins, most specific first). */
// Short stems like "rad" must be whole words: "tekshiradi" is not a refusal.
const SECTION_EMOJI: [RegExp, string][] = [
  [/90\/180|kalendar|muddat|kun qoidasi/i, "📅"],
  [/pasport/i, "🛂"],
  [/anketa|ds-160|tushuntirish xati|xat:/i, "📝"],
  [/bank|ko.chirma|qoldiq|(^|\s)pul|byudjet|moliya|tushum/i, "🏦"],
  [/ish joyi|biznes|ishga borish|faoliyat/i, "💼"],
  [/tadbirkor|kompaniya/i, "🏢"],
  [/talaba|ta.lim/i, "🎓"],
  [/homiy/i, "🤝"],
  [/bola|oila|voyaga/i, "👪"],
  [/tranzit|samolyot|aeroport/i, "✈️"],
  [/e-visa|elektron|eta\b|arrival|raqamli|ees|etias/i, "💻"],
  [/shengen|konsullig/i, "🏛️"],
  [/sug.urta|tibbiy/i, "🩺"],
  [/tarjima|tasdiqlash/i, "🌐"],
  [/turar joy|bron|chipta|safar rejasi/i, "🏨"],
  [/(^|\s)rad(\s|$)|214|221|shikoyat/i, "🚫"],
  [/suhbat/i, "🎙️"],
  [/tekshiring|nazorat|savol|mashq/i, "🧠"],
  [/vaziyat|keys|misol/i, "💡"],
  [/xato|noto.g.ri|signal/i, "⚠️"],
  [/manba|qo.llanma/i, "🔗"],
  [/lug.at|atama/i, "📖"],
  [/algoritm|bosqich|tanlash|reja/i, "🧭"],
  [/turlari|toifa|multi-entry|viza/i, "🏷️"],
  [/yakun|xulosa/i, "🎯"],
];

export function sectionEmoji(title: string): string {
  return SECTION_EMOJI.find(([re]) => re.test(title))?.[1] ?? "📄";
}

const ALIASES: [string, string][] = [
  ["AQSh", "US"],
  ["Britaniya", "GB"],
];

/**
 * Country a section is about, when its title starts with the country's name
 * ("Buyuk Britaniya: …", "BAA: 30 kunlik …", "Kanada va Avstraliya: …").
 * Longest name first, so "Bosniya va Gersegovina" beats a shorter match.
 */
export function sectionCountry(title: string, countries: { code: string; name: string }[]): string | null {
  const names: [string, string][] = [...countries.filter((c) => c.code !== "EU").map((c): [string, string] => [c.name, c.code]), ...ALIASES];
  names.sort((a, b) => b[0].length - a[0].length);
  const hit = names.find(([name]) => title.startsWith(name) && /^[\s:,.(—-]|^$/.test(title.slice(name.length, name.length + 1)));
  return hit?.[1] ?? null;
}

/** Plans in the order shown on /pricing, with the emoji used in the library. */
export const PLAN_EMOJI = { standard: "⚡", premium: "⭐", pro: "🚀", vip: "👑" } as const;
