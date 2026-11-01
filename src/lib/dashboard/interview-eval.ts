/**
 * Rule-based evaluation of a practice answer — not AI and not a prediction
 * of any consular decision. It looks for signals that interview guides
 * usually stress: a clear, specific answer, ties to home, no hedging and no
 * hint of overstaying. Works on Uzbek, Russian and English text.
 */

export interface AnswerEval {
  accuracy: number;
  confidence: number;
  consistency: number;
  clarity: number;
  relevance: number;
  overall: number;
  /** Phrases found in the user's own answer */
  risky: string[];
  /** Uzbek source tips (translated through the phrase table) */
  tips: string[];
}

const HEDGES = [
  "balki", "ehtimol", "bilmayman", "aniq emas", "aniq bilmayman", "menimcha", "shekilli",
  "maybe", "probably", "not sure", "i think", "i guess", "perhaps",
  "наверное", "может быть", "не знаю", "кажется", "возможно",
];
const OVERSTAY = [
  "qolib ketaman", "qolib ketarman", "qolmoqchiman", "qaytmayman", "o'sha yerda ishlayman", "ishlab qolaman",
  "stay there", "not return", "won't return", "overstay", "work there", "find a job there",
  "остаться там", "остаться навсегда", "остаться жить", "не вернусь", "работать там", "найти работу там",
];
// Not red flags: "o'n kun qolmoqchiman" states a length of stay (an open-ended one is
// the flag), and "I will not overstay" says the opposite of overstaying.
const HARMLESS_STAY = /(kun|kunlik|hafta|oy|gacha|\])\s+qolmoqchiman|(not|never|n't)\s+overstay/g;
// When the question is itself about a past overstay, saying the word is the honest answer.
const ASKS_ABOUT_OVERSTAY = /overstay|muddatdan ortiq|срок пребывания|qolib ketgan/i;
const TIES = [
  "qaytaman", "qaytish", "oilam", "farzand", "ishim", "ishxonam", "o'qishim", "uyim", "kvartira",
  "return", "come back", "my family", "my job", "my work", "my studies", "my home",
  "вернусь", "вернуться", "семья", "работа", "учёба", "дом",
];

// Topic keywords per question theme (matched loosely against the question text)
const TOPICS: { q: RegExp; a: string[] }[] = [
  { q: /maqsad|purpose|цель|nima uchun|why|почему/i, a: ["turizm", "sayohat", "dam olish", "o'qish", "ish", "uchrashuv", "konferensiya", "tour", "visit", "holiday", "study", "business", "meeting", "туризм", "отдых", "учёба", "встреча"] },
  { q: /xarajat|mablag|qoplaydi|pay|cost|расход|оплач|накопил/i, a: ["o'zim", "maosh", "jamg'arma", "homiy", "bank", "so'm", "dollar", "salary", "savings", "sponsor", "myself", "зарплат", "накоплен", "спонсор", "сам"] },
  { q: /qaytish|qayt|bog'lab|return|ties|вернут|связыва/i, a: TIES },
  { q: /yashaysiz|manzil|live|address|живёте|прожива/i, a: ["toshkent", "samarqand", "buxoro", "shahr", "tuman", "ko'cha", "city", "street", "district", "tashkent", "город", "улиц", "ташкент"] },
  { q: /tanish|qarindosh|relative|friend|знаком|родствен/i, a: ["yo'q", "bor", "do'stim", "qarindoshim", "no", "yes", "friend", "relative", "нет", "есть", "друг"] },
  { q: /necha kun|davom|how long|days|сколько дней|длит/i, a: ["kun", "hafta", "oy", "day", "week", "month", "дн", "недел", "месяц"] },
];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
// Matches, without counting a phrase that is part of a longer match ("bilmayman" inside "aniq bilmayman")
const found = (text: string, list: string[]) => {
  const hits = list.filter((w) => text.includes(w));
  return hits.filter((w) => !hits.some((o) => o !== w && o.includes(w)));
};

const normalize = (text: string) => text.toLowerCase().replace(/[‘’`ʻʼ]/g, "'");
// Rough word stems, so different endings still match; [placeholders] don't count.
const stems = (text: string) =>
  new Set(
    normalize(text)
      .replace(/\[[^\]]*\]/g, " ")
      .split(/[^\p{L}\p{N}']+/u)
      .filter((w) => w.length >= 4)
      .map((w) => w.slice(0, 5))
  );
/** How much of the sample answer's vocabulary the answer uses, from 0 to 1. */
function sampleOverlap(answer: string, sample: string) {
  const expected = stems(sample);
  if (!expected.size) return 0;
  const given = stems(answer);
  const shared = [...expected].filter((w) => given.has(w)).length;
  return Math.min(1, shared / Math.min(expected.size, 8));
}

/** `sample` is the playbook's sample answer in the same language, when there is one. */
export function evaluateAnswer(answer: string, question: string, sample?: string): AnswerEval {
  const text = ` ${normalize(answer)} `;
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hedges = found(text, HEDGES);
  const overstay = ASKS_ABOUT_OVERSTAY.test(question) ? [] : found(text.replace(HARMLESS_STAY, " "), OVERSTAY);
  const ties = found(text, TIES);
  // Only ask for numbers where the sample has them: "Have you been there before?" doesn't need a date.
  const hasNumbers = /\d/.test(answer) || (sample !== undefined && !/\d|\[/.test(sample));
  const topic = TOPICS.find((t) => t.q.test(question));
  const onSample = sample !== undefined && sampleOverlap(answer, sample) >= 0.2;
  const onTopic = onSample || (topic ? found(text, topic.a).length > 0 : sample === undefined && words >= 6);

  const clarity = words < 4 ? 35 : words < 8 ? 60 : words <= 70 ? 92 : words <= 120 ? 72 : 55;
  const accuracy = clamp(50 + (hasNumbers ? 20 : 0) + (words >= 10 ? 15 : 0) + (onTopic ? 15 : 0));
  const confidence = clamp(92 - hedges.length * 18);
  const consistency = clamp(84 - overstay.length * 30 + (ties.length ? 10 : 0));
  const relevance = clamp(onTopic ? 90 : 48);
  // Consistency (no overstay hint) and confidence weigh most; an overstay
  // phrase caps the result because it is the most serious red flag.
  const weighted = consistency * 0.3 + confidence * 0.25 + relevance * 0.2 + accuracy * 0.15 + clarity * 0.1;
  // An answer that shares nothing with the sample didn't answer the question, however polished it reads.
  const offTopicCap = sample !== undefined && !onTopic ? 55 : 100;
  const overall = clamp(overstay.length ? Math.min(weighted, 40) : Math.min(weighted, offTopicCap));

  const tips: string[] = [];
  if (words < 8) tips.push("Javobni biroz kengaytiring: 1–3 ta aniq gap yetarli.");
  if (words > 120) tips.push("Javob juda uzun — asosiy fikrni qisqaroq ayting.");
  if (!hasNumbers) tips.push("Aniq tafsilot qo'shing: sana, muddat yoki summa.");
  if (hedges.length) tips.push("Noaniq so'zlardan qoching — ishonch bilan javob bering.");
  if (overstay.length) tips.push("Qolib ketish yoki u yerda ishlash niyatiga o'xshash iboralar xavfli.");
  if (!ties.length && /qayt|return|вернут|bog'lab|ties|связыва/i.test(question)) tips.push("Vatanga bog'liqlikni ko'rsating: ish, oila yoki o'qish.");
  if (!onTopic) tips.push("Avval aynan berilgan savolga javob bering.");
  if (/\[[^\]]*\]/.test(answer)) tips.push("Qavs ichidagi joylarni o'z haqiqiy ma'lumotingiz bilan almashtiring.");
  if (!tips.length) tips.push("Yaxshi javob — xuddi shunday aniq va qisqa davom eting.");

  return { accuracy, confidence, consistency, clarity, relevance, overall, risky: [...hedges, ...overstay], tips };
}

export interface InterviewSession {
  at: string;
  country: string;
  difficulty: string;
  score: number;
}
export const INTERVIEW_HISTORY_KEY = "vizar-interview-history";
