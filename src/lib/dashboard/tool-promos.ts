/**
 * The four tools that work inside the dashboard, as promoted on their public
 * pages and on /dashboard/tools. Taglines and points are Uzbek source for the
 * dashboard phrase table, and each only states what the tool really does.
 */
export type ToolKey = "visaPhoto" | "visaLetters" | "visaTiming" | "schengenCalc";

export const TOOL_PROMOS: { key: ToolKey; href: string; emoji: string; tint: string; tagline: string; points: [string, string, string] }[] = [
  {
    key: "visaPhoto",
    href: "/dashboard/tools/photo",
    emoji: "📸",
    tint: "from-brand-500 to-violet-600",
    tagline: "Rasmingizni bir daqiqada viza o'lchamiga keltiring",
    points: [
      "Shengen, AQSH, Kanada, Yaponiya va Koreya o'lchamlari",
      "10×15 varaqda 8 tagacha rasm — chop etish arzonroq",
      "Rasm serverga yuklanmaydi",
    ],
  },
  {
    key: "visaLetters",
    href: "/dashboard/tools/letters",
    emoji: "📝",
    tint: "from-violet-500 to-fuchsia-500",
    tagline: "Qo'shimcha xat, ma'lumotnoma va homiylik xati — bir necha daqiqada",
    points: ["Ingliz, nemis yoki rus tilida", "Germaniya elchixonasi ro'yxatidagi maydonlar bilan", "Chop eting yoki PDF qilib saqlang"],
  },
  {
    key: "visaTiming",
    href: "/dashboard/tools/timing",
    emoji: "🗓️",
    tint: "from-emerald-500 to-teal-600",
    tagline: "Ariza topshirish muddatini o'tkazib yubormang",
    points: ["Qachondan topshirish mumkinligi va oxirgi tavsiya etilgan kun", "Pasport muddatini tekshirish", "Eslatmalar kalendaringizga"],
  },
  {
    key: "schengenCalc",
    href: "/dashboard/tools/schengen",
    emoji: "🧮",
    tint: "from-amber-400 to-orange-500",
    tagline: "Shengen hududida qancha kun qolganini aniq biling",
    points: ["Barcha safarlaringizni kiriting", "Qolgan kunlar va yangi safar uchun eng uzoq muddat", "Safarlar shu brauzerda saqlanadi"],
  },
];
