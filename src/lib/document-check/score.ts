/**
 * Document readiness test: the user marks each required document with one of
 * four answers; this turns the answers into counts, a readiness percentage and
 * an order of what to do first. Everything comes from the user's own answers —
 * no file is read, so this is never a check of document quality or of the
 * chance of getting a visa.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */

export const ANSWERS = ["ready", "partial", "preparing", "missing"] as const;
export type Answer = (typeof ANSWERS)[number];

/** The four options, A–D, in the order shown (Uzbek source text) */
export const ANSWER_LABELS: Record<Answer, { letter: string; label: string }> = {
  ready: { letter: "A", label: "Bor, tayyor" },
  partial: { letter: "B", label: "Bor, lekin to'liq emas yoki muammosi bor" },
  preparing: { letter: "C", label: "Hozir tayyorlanmoqda" },
  missing: { letter: "D", label: "Hali yo'q" },
};

/** How much each answer counts towards readiness (shown to the user) */
export const WEIGHTS: Record<Answer, number> = { ready: 1, partial: 0.5, preparing: 0.25, missing: 0 };

export interface CheckItem {
  id: string;
  title: string;
  note?: string;
}

export const isAnswer = (v: unknown): v is Answer => typeof v === "string" && (ANSWERS as readonly string[]).includes(v);

export interface CheckResult {
  total: number;
  answered: number;
  complete: boolean;
  counts: Record<Answer, number>;
  /** 0–100, weighted by WEIGHTS; only meaningful when complete */
  percent: number;
  /** Not ready yet, most urgent first: missing, then problems, then in progress */
  priorities: { item: CheckItem; answer: Exclude<Answer, "ready"> }[];
}

const URGENCY: Record<Exclude<Answer, "ready">, number> = { missing: 0, partial: 1, preparing: 2 };

export function scoreAnswers(items: CheckItem[], answers: Record<string, unknown>): CheckResult {
  const counts: Record<Answer, number> = { ready: 0, partial: 0, preparing: 0, missing: 0 };
  const priorities: CheckResult["priorities"] = [];
  let points = 0;
  let answered = 0;
  for (const item of items) {
    const a = answers[item.id];
    if (!isAnswer(a)) continue;
    answered++;
    counts[a]++;
    points += WEIGHTS[a];
    if (a !== "ready") priorities.push({ item, answer: a });
  }
  // Stable: within the same urgency keep the list's own order
  priorities.sort((x, y) => URGENCY[x.answer] - URGENCY[y.answer]);
  const total = items.length;
  return {
    total,
    answered,
    complete: total > 0 && answered === total,
    counts,
    percent: total ? Math.round((points / total) * 100) : 0,
    priorities,
  };
}

/** Only answers for the listed documents, and only valid values — anything else is dropped */
export function cleanAnswers(items: CheckItem[], answers: Record<string, unknown>): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  for (const item of items) {
    const a = answers[item.id];
    if (isAnswer(a)) out[item.id] = a;
  }
  return out;
}

/**
 * Everything an AI model may ever receive for this test — nothing more.
 * Only the destination, visa type, document names, the chosen answers and
 * requirement texts from the visa book. No names, passport numbers, JShShIR,
 * photos, bank details or files: the test never collects them, and this
 * builder copies only the listed fields.
 */
export interface AiPayload {
  destination: string;
  visaType: string;
  documents: { name: string; answer: Answer }[];
  bookRequirements: { topic: string; text: string; verified: boolean }[];
}

export function buildAiPayload(input: {
  destination: string;
  visaType: string;
  items: CheckItem[];
  answers: Record<string, unknown>;
  bookRules?: { topic: string; text: string; verified: boolean }[];
}): AiPayload {
  const clean = cleanAnswers(input.items, input.answers);
  return {
    destination: String(input.destination).slice(0, 60),
    visaType: String(input.visaType).slice(0, 60),
    documents: input.items.filter((i) => clean[i.id]).map((i) => ({ name: String(i.title).slice(0, 120), answer: clean[i.id]! })),
    bookRequirements: (input.bookRules ?? []).slice(0, 8).map((r) => ({
      topic: String(r.topic).slice(0, 120),
      text: String(r.text).slice(0, 1200),
      verified: Boolean(r.verified),
    })),
  };
}
