/**
 * Rule-based refusal analysis: maps the reasons a user selects to the risks
 * and the preparation steps commonly recommended for them. General guidance
 * only — not a consular decision. Uzbek source text (phrase table).
 */
export type RefusalReasonId = "funds" | "purpose" | "ties" | "docs" | "history" | "interview";

export const REFUSAL_REASONS: { id: RefusalReasonId; emoji: string; label: string }[] = [
  { id: "funds", emoji: "🏦", label: "Moliyaviy mablag' yetarli emas" },
  { id: "purpose", emoji: "🎯", label: "Safar maqsadi aniq emas" },
  { id: "ties", emoji: "🏠", label: "Vatanga bog'liqlik yetarli ko'rsatilmagan" },
  { id: "docs", emoji: "📄", label: "Hujjatlar to'liq emas yoki noto'g'ri" },
  { id: "history", emoji: "🛂", label: "Oldingi viza qoidabuzarligi" },
  { id: "interview", emoji: "🎤", label: "Suhbatda noaniq javoblar" },
];

export const REFUSAL_ADVICE: Record<RefusalReasonId, { risk: string; actions: string[] }> = {
  funds: {
    risk: "Mablag' yoki daromad manbai yetarlicha isbotlanmagan.",
    actions: [
      "Bank ko'chirmasini so'nggi oylardagi harakat bilan yangilang",
      "Daromad manbaini tasdiqlovchi hujjat qo'shing",
      "Homiy bo'lsa — homiylik xati va uning moliyaviy hujjatlarini ilova qiling",
    ],
  },
  purpose: {
    risk: "Safar rejasi va hujjatlar bir-biriga to'liq mos kelmagan.",
    actions: [
      "Kunlar bo'yicha aniq safar marshrutini tuzing",
      "Mehmonxona va chipta bronlarini rejaga moslang",
      "Maqsadni tasdiqlovchi hujjat qo'shing (taklifnoma, tadbir chiptasi)",
    ],
  },
  ties: {
    risk: "Qaytish niyati va Vatanga bog'liqlik zaif ko'ringan.",
    actions: [
      "Ish joyidan ta'til va qaytish sanasi ko'rsatilgan ma'lumotnoma oling",
      "Oila, mulk yoki o'qishni tasdiqlovchi hujjatlarni qo'shing",
      "Oldingi safarlardan o'z vaqtida qaytganingizni ko'rsating",
    ],
  },
  docs: {
    risk: "Ba'zi hujjatlar to'liq bo'lmagan yoki talabga mos kelmagan.",
    actions: [
      "Rasmiy ro'yxat bo'yicha har bir hujjatni qayta tekshiring",
      "Tarjima va nusxalarni talab bo'yicha tayyorlang",
      "Checklist orqali yetishmayotgan hujjatlarni belgilang",
    ],
  },
  history: {
    risk: "Oldingi qoidabuzarlik ariza bilan birga qayta ko'rib chiqiladi.",
    actions: [
      "Oldingi holat haqida rost va qisqa tushuntirish xati yozing",
      "Holat bartaraf etilganini tasdiqlovchi hujjat qo'shing",
      "Qayta topshirishdan oldin mutaxassis bilan maslahatlashing",
    ],
  },
  interview: {
    risk: "Suhbatdagi javoblar noaniq yoki hujjatlarga zid bo'lgan.",
    actions: [
      "AI suhbat simulyatorida mashq qiling",
      "Javoblaringiz hujjatlardagi ma'lumotlarga mos bo'lsin",
      "Qisqa, aniq va ishonch bilan javob bering",
    ],
  },
};

/** General waiting suggestion in months — longer when history is involved. */
export function suggestedWaitMonths(reasons: RefusalReasonId[]) {
  if (reasons.includes("history")) return 6;
  if (reasons.some((r) => r === "funds" || r === "ties" || r === "docs")) return 3;
  return 1;
}

export interface RefusalSaved {
  country: string;
  visaType: string;
  date: string;
  reasons: RefusalReasonId[];
  note: string;
  at: string;
}
export const REFUSAL_KEY = "vizar-refusal-last";
