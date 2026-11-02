/**
 * Turns the visa assessment answers into next steps. Each finding comes from one
 * answer the user gave, by a fixed rule. None of it is a risk score or a
 * prediction of the visa decision, and no AI is involved.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
export interface AssessmentFinding {
  id: "date" | "documents" | "refusal" | "sponsor" | "funds" | "visited" | "interview";
  /** "todo" findings are also saved as recommendations, under `task` */
  tone: "todo" | "good";
  emoji: string;
  /** Uzbek source strings for the phrase table; {placeholders} come from `vars` */
  title: string;
  text: string;
  vars?: Record<string, string | number>;
  /** Listed under the text, e.g. document names */
  items?: string[];
  href?: string;
  link?: string;
  task?: string;
  priority?: "Muhim" | "O'rtacha";
}

const DAY = 86_400_000;
/** Below this, appointment slots and processing times become the urgent question. */
export const SOON_DAYS = 30;

/**
 * Where a saved task (a recommendation title) can be worked on in the app.
 * Booking an appointment and gathering sponsor papers happen elsewhere. The last
 * two are the fixed demo titles the assessment saved before it had real rules.
 */
export const TASK_HREF: Record<string, string> = {
  "Safar sanasini yangilang": "/assessment",
  "Yetishmayotgan hujjatlarni tayyorlang": "/dashboard/checklist",
  "Avvalgi rad javobini tahlil qiling": "/dashboard/rejection-analysis",
  "Mablag' talabini tekshiring": "/knowledge-base",
  "Suhbat mashqini bajaring": "/dashboard/interview",
  "Bank statementni tekshirib chiqing": "/dashboard/documents",
  "AI Interview simulyatorida mashq qiling": "/dashboard/interview",
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function travelFinding(travelDate: string, today: Date): AssessmentFinding | null {
  const travel = Date.parse(`${travelDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || Number.isNaN(travel)) return null;
  const days = Math.round((travel - Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / DAY);

  if (days < 0) {
    return {
      id: "date",
      tone: "todo",
      emoji: "📅",
      title: "Safar sanasi o'tib ketgan",
      text: "Yangi sana bilan tahlilni qayta boshlang.",
      href: "/assessment",
      link: "Yangi tahlil",
      task: "Safar sanasini yangilang",
      priority: "Muhim",
    };
  }
  if (days <= SOON_DAYS) {
    return {
      id: "date",
      tone: "todo",
      emoji: "⏰",
      title: "Safargacha {n} kun qoldi",
      text: "Muddat qisqa. Qabul kunlari va ko'rib chiqish muddatini rasmiy saytdan bugunoq tekshiring.",
      vars: { n: days },
      task: "Qabul kunini band qiling",
      priority: "Muhim",
    };
  }
  return {
    id: "date",
    tone: "good",
    emoji: "📅",
    title: "Safargacha {n} kun bor",
    text: "Qabul kunini oldindan band qiling: ba'zi markazlarda navbat uzoq bo'ladi.",
    vars: { n: days },
  };
}

export function reviewAssessment(answers: Record<string, unknown>, today: Date): AssessmentFinding[] {
  const findings: AssessmentFinding[] = [];

  const travel = travelFinding(text(answers.travelDate), today);
  if (travel) findings.push(travel);

  const docs = answers.docsStatus && typeof answers.docsStatus === "object" ? Object.entries(answers.docsStatus) : [];
  if (docs.length) {
    const notReady = docs.filter(([, status]) => status !== "Tayyor").map(([name]) => name);
    findings.push(
      notReady.length
        ? {
            id: "documents",
            tone: "todo",
            emoji: "📂",
            title: "{n} ta hujjat hali tayyor emas",
            text: "Checklistdan har biri uchun talablarni ko'ring.",
            vars: { n: notReady.length },
            items: notReady,
            href: "/dashboard/checklist",
            link: "Checklist",
            task: "Yetishmayotgan hujjatlarni tayyorlang",
            priority: "Muhim",
          }
        : {
            id: "documents",
            tone: "good",
            emoji: "📂",
            title: "Hamma hujjat tayyor deb belgilandi",
            text: "Ularni Hujjatlar bo'limiga yuklang — tayyorgarlik balingiz shunda oshadi.",
            href: "/dashboard/documents",
            link: "Hujjatlar",
          }
    );
  }

  if (answers.previouslyRefused === "Ha") {
    findings.push({
      id: "refusal",
      tone: "todo",
      emoji: "🔍",
      title: "Avvalgi rad javobi",
      text: "Ariza shaklida so'ralsa, uni yashirmang va o'sha sabab endi qanday hal bo'lganini hujjat bilan ko'rsating.",
      href: "/dashboard/rejection-analysis",
      link: "Rad javobi tahlili",
      task: "Avvalgi rad javobini tahlil qiling",
      priority: "Muhim",
    });
  }

  if (answers.sponsor === "Ha") {
    findings.push({
      id: "sponsor",
      tone: "todo",
      emoji: "🤝",
      title: "Homiy hujjatlari",
      text: "Homiy xati, homiyning daromad va bank hujjatlari hamda qarindoshlikni tasdiqlovchi hujjatni tayyorlang. Aniq ro'yxat davlatga qarab farq qiladi.",
      task: "Homiy hujjatlarini tayyorlang",
      priority: "O'rtacha",
    });
  }

  const income = text(answers.income);
  const balance = text(answers.bankBalance);
  if (income || balance) {
    findings.push({
      id: "funds",
      tone: "todo",
      emoji: "🏦",
      title: "Mablag'ingizni talab bilan solishtiring",
      text: "Siz yozgan daromad: {income}. Bank hisobi: {balance}. Elchixona talab qiladigan miqdorni rasmiy manbadan tekshiring.",
      vars: { income: income || "—", balance: balance || "—" },
      href: "/knowledge-base",
      link: "Viza bazasi",
      task: "Mablag' talabini tekshiring",
      priority: "O'rtacha",
    });
  }

  if (answers.visitedBefore === "Ha") {
    findings.push({
      id: "visited",
      tone: "good",
      emoji: "🧳",
      title: "Bu davlatga avval borgansiz",
      text: "Oldingi viza va kirish-chiqish muhrlari nusxasini ilova qilsangiz, sayohat tarixingiz ko'rinadi.",
    });
  }

  const country = text(answers.country);
  findings.push({
    id: "interview",
    tone: "todo",
    emoji: "🎤",
    title: "Suhbatga tayyorlaning",
    text: country ? "{country} bo'yicha savollar bilan mashq qiling." : "Savollar bilan mashq qiling.",
    vars: country ? { country } : undefined,
    href: "/dashboard/interview",
    link: "Suhbat mashqi",
    task: "Suhbat mashqini bajaring",
    priority: "O'rtacha",
  });

  // Things to do first, then what is already in place.
  return [...findings.filter((f) => f.tone === "todo"), ...findings.filter((f) => f.tone === "good")];
}
