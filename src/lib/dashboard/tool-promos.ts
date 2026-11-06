/**
 * The four tools that work inside the dashboard, as promoted on their public
 * pages and on /dashboard/tools. Taglines, points and steps are Uzbek source
 * for the dashboard phrase table, and each only states what the tool really does.
 */
export type ToolKey = "visaPhoto" | "visaLetters" | "visaTiming" | "schengenCalc";

export interface ToolPromoData {
  key: ToolKey;
  /** The working tool, in the dashboard */
  href: string;
  /** The public promo page */
  publicHref: string;
  emoji: string;
  tint: string;
  tagline: string;
  points: [string, string, string];
  /** "How it works": title, description */
  steps: [string, string][];
}

export const TOOL_PROMOS: ToolPromoData[] = [
  {
    key: "visaPhoto",
    href: "/dashboard/tools/photo",
    publicHref: "/visa-photo",
    emoji: "📸",
    tint: "from-brand-600 to-violet-700",
    tagline: "Rasmingizni bir daqiqada viza o'lchamiga keltiring",
    points: [
      "Shengen, AQSH, Kanada, Yaponiya va Koreya o'lchamlari",
      "10×15 varaqda 8 tagacha rasm — chop etish arzonroq",
      "Rasm serverga yuklanmaydi",
    ],
    steps: [
      ["Davlatni tanlang", "Shengen, AQSH, Kanada, Yaponiya yoki Koreya — o'lcham rasmiy talab bo'yicha qo'yiladi."],
      ["Rasmni yuklang va moslang", "Iyak va bosh chiziqlarga to'g'ri kelguncha suring va kattalashtiring; sifat va fon darhol tekshiriladi."],
      ["Yuklab oling yoki chop eting", "Bitta rasm fayli yoki 10×15 varaq — fotosalonda chop etishga tayyor."],
    ],
  },
  {
    key: "visaLetters",
    href: "/dashboard/tools/letters",
    publicHref: "/visa-letters",
    emoji: "📝",
    tint: "from-violet-600 to-fuchsia-700",
    tagline: "Qo'shimcha xat, ma'lumotnoma va homiylik xati — bir necha daqiqada",
    points: ["Ingliz, nemis yoki rus tilida", "Germaniya elchixonasi ro'yxatidagi maydonlar bilan", "Chop eting yoki PDF qilib saqlang"],
    steps: [
      ["Xat turini tanlang", "Qo'shimcha xat va safar dasturi, ish joyidan ma'lumotnoma yoki homiylik xati."],
      ["Formani to'ldiring", "Xat yonida darhol shakllanadi; to'ldirilmagan joylar belgilanib turadi."],
      ["Chop eting yoki nusxalang", "PDF qilib saqlang yoki matnni Word'ga ko'chiring."],
    ],
  },
  {
    key: "visaTiming",
    href: "/dashboard/tools/timing",
    publicHref: "/visa-timing",
    emoji: "🗓️",
    tint: "from-emerald-700 to-teal-700",
    tagline: "Ariza topshirish muddatini o'tkazib yubormang",
    points: ["Qachondan topshirish mumkinligi va oxirgi tavsiya etilgan kun", "Pasport muddatini tekshirish", "Eslatmalar kalendaringizga"],
    steps: [
      ["Vizani tanlang", "Shengen yoki Buyuk Britaniya — rasmiy qoidalar bo'yicha."],
      ["Safar sanasini kiriting", "Ariza qachondan topshirilishi mumkinligi va oxirgi tavsiya etilgan kun ko'rinadi."],
      ["Eslatma qo'ying", "Sanalarni kalendaringizga bitta fayl bilan qo'shing."],
    ],
  },
  {
    key: "schengenCalc",
    href: "/dashboard/tools/schengen",
    publicHref: "/schengen-calculator",
    emoji: "🧮",
    tint: "from-amber-700 to-orange-700",
    tagline: "Shengen hududida qancha kun qolganini aniq biling",
    points: ["Barcha safarlaringizni kiriting", "Qolgan kunlar va yangi safar uchun eng uzoq muddat", "Safarlar shu brauzerda saqlanadi"],
    steps: [
      ["Safarlaringizni kiriting", "So'nggi 180 kundagi va rejalashtirgan safarlaringiz."],
      ["Natijani ko'ring", "Ishlatilgan va qolgan kunlar; chegara oshadigan kun bo'lsa — ogohlantirish."],
      ["Yangi safarni rejalashtiring", "Tanlangan kundan boshlab ko'pi bilan necha kun qolish mumkinligi."],
    ],
  },
];
