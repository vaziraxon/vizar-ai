/**
 * The readiness score: how much of the preparation the user has actually done.
 * It counts four things the app can see, and nothing else. It doesn't read what
 * a document says and it doesn't predict the visa decision.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
export interface ServerReadinessFacts {
  /** Documents attach to an application, so this comes before uploading. */
  hasApplication: boolean;
  assessmentDone: boolean;
  docsUploaded: number;
  docsTotal: number;
  /** False while real document uploads are closed: the readiness test counts instead */
  uploadsOpen?: boolean;
}

/** The 4-option document readiness test, used for the documents part while uploads are closed */
export interface DocTestFacts {
  /** Sum of the answer weights (ready 1, partial 0.5, preparing 0.25, missing 0) */
  points: number;
  answered: number;
  total: number;
}

export interface ReadinessFacts extends ServerReadinessFacts {
  checklistDone: number;
  checklistTotal: number;
  /** Practice scores out of 100, newest first */
  interviewScores: number[];
  docTest?: DocTestFacts;
}

export interface ReadinessPart {
  key: "documents" | "checklist" | "interview" | "assessment";
  /** Uzbek source strings for the phrase table */
  label: string;
  action: string;
  detail: { text: string; vars?: Record<string, number> };
  emoji: string;
  href: string;
  weight: number;
  points: number;
  percent: number;
  /** Points still to earn; at least 1 until the part is complete */
  gain: number;
}

export const INTERVIEW_SESSIONS = 3;
/** Sample answers score around 90, so a perfect 100 can't be the bar. */
export const INTERVIEW_TARGET = 70;

const share = (done: number, total: number) => (total > 0 ? Math.min(done / total, 1) : 0);

function part(fields: Omit<ReadinessPart, "points" | "percent" | "gain">, value: number): ReadinessPart {
  return {
    ...fields,
    points: Math.round(fields.weight * value),
    percent: Math.round(value * 100),
    gain: value >= 1 ? 0 : Math.max(1, Math.round(fields.weight * (1 - value))),
  };
}

export function computeReadiness(facts: ReadinessFacts) {
  const sessions = facts.interviewScores.slice(0, INTERVIEW_SESSIONS);
  const practised = sessions.reduce((sum, score) => sum + score, 0);
  // Uploads closed: the documents part comes from the user's own test answers
  const byTest = facts.uploadsOpen === false && facts.docTest !== undefined;
  const test = facts.docTest ?? { points: 0, answered: 0, total: 0 };
  const values = {
    documents: byTest ? share(test.points, test.total) : share(facts.docsUploaded, facts.docsTotal),
    checklist: share(facts.checklistDone, facts.checklistTotal),
    interview: share(practised, INTERVIEW_SESSIONS * INTERVIEW_TARGET),
    assessment: facts.assessmentDone ? 1 : 0,
  };

  const parts: ReadinessPart[] = [
    part(
      {
        key: "documents",
        label: "Hujjatlar",
        ...(byTest
          ? {
              action: "Hujjat tayyorgarligi testini to'ldiring",
              detail: test.answered
                ? { text: "Test: {done}/{total} ta hujjat baholangan, tayyorlik {percent}%", vars: { done: test.answered, total: test.total, percent: Math.round(share(test.points, test.total) * 100) } }
                : { text: "Hujjat tayyorgarligi testi hali to'ldirilmagan" },
              href: "/dashboard/documents/check",
            }
          : {
              action: "Hujjatlarni yuklang",
              detail: { text: "{done}/{total} ta hujjat yuklangan", vars: { done: Math.min(facts.docsUploaded, facts.docsTotal), total: facts.docsTotal } },
              href: "/dashboard/documents",
            }),
        emoji: "📄",
        weight: 40,
      },
      values.documents
    ),
    part(
      {
        key: "checklist",
        label: "Checklist",
        action: "Checklistni belgilang",
        detail: { text: "{done}/{total} ta band belgilangan", vars: { done: facts.checklistDone, total: facts.checklistTotal } },
        emoji: "✅",
        href: "/dashboard/checklist",
        weight: 25,
      },
      values.checklist
    ),
    part(
      {
        key: "interview",
        label: "Suhbat mashqi",
        action: "3 ta suhbat mashqida o'rtacha 70% ga yeting",
        detail: sessions.length
          ? { text: "{n}/3 ta mashq, o'rtacha {avg}%", vars: { n: sessions.length, avg: Math.round(practised / sessions.length) } }
          : { text: "Hali mashq qilinmagan" },
        emoji: "🎤",
        href: "/dashboard/interview",
        weight: 20,
      },
      values.interview
    ),
    part(
      {
        key: "assessment",
        label: "Viza tahlili",
        action: "Viza tahlilini yakunlang",
        detail: { text: facts.assessmentDone ? "Yakunlangan" : "Hali yakunlanmagan" },
        emoji: "🧭",
        href: "/assessment",
        weight: 15,
      },
      values.assessment
    ),
  ];

  const score = Math.round(parts.reduce((sum, p) => sum + p.weight * values[p.key], 0));

  // Biggest gain first, but without an application nothing can be uploaded yet.
  const steps = parts
    .filter((p) => p.gain > 0)
    .sort((a, b) => {
      if (!facts.hasApplication && (a.key === "assessment" || b.key === "assessment")) {
        return a.key === "assessment" ? -1 : 1;
      }
      return b.gain - a.gain;
    });

  return { score, parts, steps };
}

/** The required slots the user has filled, ignoring repeats and extra documents. */
export function filledSlots(uploadedTypes: string[], slots: string[]) {
  return slots.filter((slot) => uploadedTypes.includes(slot));
}

/** Uzbek source strings: how far along the user is, not how likely a visa is. */
export function readinessLevel(score: number) {
  if (score <= 0) return "Hali baholanmagan";
  if (score >= 90) return "Deyarli tayyor";
  if (score >= 60) return "Yaxshi ketyapsiz";
  if (score >= 25) return "Davom eting";
  return "Endi boshlanmoqda";
}
