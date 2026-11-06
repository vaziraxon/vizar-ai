/**
 * Turns the visa assessment answers into next steps. Each finding comes from one
 * answer the user gave, by a fixed rule. None of it is a risk score or a
 * prediction of the visa decision, and no AI is involved.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
/**
 * Short trips an ordinary Uzbek passport makes without a visa, so the
 * dashboard asks for no visa application, appointment or interview.
 *
 * Turkey — Turkish MFA, "Visa information for foreigners": Uzbek ordinary
 * passports are "exempted from visa up to 90 days within any 180 day period";
 * "Passport validity requirements": valid at least 60 days beyond the stay.
 * UAE — UAE–Uzbekistan protocol of 16 January 2024 (lex.uz/docs/6799651, in
 * force 16 February 2024): biometric passports valid at least six months, a
 * stay of up to 30 days.
 * Work and study still need a visa or permit, so only tourist and business
 * trips count. Keys are destination slugs and the country names the assessment saves.
 */
export interface VisaFreeRule {
  days: number;
  /** Rolling period the stay limit counts over, when there is one (Turkey: 90 in any 180) */
  window?: number;
  /** Passport valid this many days past the stay, or this many months on entry */
  passport: { beyondStayDays: number } | { months: number };
}
const TURKEY: VisaFreeRule = { days: 90, window: 180, passport: { beyondStayDays: 60 } };
const UAE: VisaFreeRule = { days: 30, passport: { months: 6 } };
const VISA_FREE: Record<string, VisaFreeRule> = { turkey: TURKEY, Turkiya: TURKEY, uae: UAE, BAA: UAE };
/** Checklist visa kinds and assessment visa types that are short trips */
const SHORT_TRIP = new Set(["tourist", "business", "Turistik viza", "Biznes vizasi"]);

export function visaFreeStay(destination: string, visaKind: string): VisaFreeRule | null {
  return SHORT_TRIP.has(visaKind) ? VISA_FREE[destination] ?? null : null;
}

export interface AssessmentFinding {
  id: "date" | "documents" | "refusal" | "sponsor" | "funds" | "visited" | "interview" | "visa-free" | "passport";
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
 * Titles that early versions of the assessment saved and that no longer match
 * what the app is (the interview practice is not AI). Saved rows keep their old
 * text; it is swapped for the current title whenever a row is read.
 */
const LEGACY_TASK_TITLES: Record<string, string> = {
  "AI Interview simulyatorida mashq qiling": "Suhbat mashqini bajaring",
  "Bank statementni tekshirib chiqing": "Bank hisobingizdan ko'chirmani tekshiring",
};

export const currentTaskTitle = (title: string) => LEGACY_TASK_TITLES[title] ?? title;

/**
 * Where a saved task (a recommendation title) can be worked on in the app.
 * Booking an appointment and gathering sponsor papers happen elsewhere. The last
 * one is a fixed demo title the assessment saved before it had real rules.
 */
export const TASK_HREF: Record<string, string> = {
  "Safar sanasini yangilang": "/assessment",
  "Yetishmayotgan hujjatlarni tayyorlang": "/dashboard/checklist",
  "Avvalgi rad javobini tahlil qiling": "/dashboard/rejection-analysis",
  "Mablag' talabini tekshiring": "/dashboard/library",
  "Suhbat mashqini bajaring": "/dashboard/interview",
  "Bank hisobingizdan ko'chirmani tekshiring": "/dashboard/documents",
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function travelFinding(travelDate: string, today: Date, visaFree: boolean): AssessmentFinding | null {
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
  if (visaFree) {
    return {
      id: "date",
      tone: "good",
      emoji: "📅",
      title: "Safargacha {n} kun bor",
      text: "Viza kerak emas, qabul kunini band qilish shart emas.",
      vars: { n: days },
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
  const country = text(answers.country);
  const visaFree = visaFreeStay(country, text(answers.visaType));

  const travel = travelFinding(text(answers.travelDate), today, Boolean(visaFree));
  if (travel) findings.push(travel);

  if (visaFree) {
    findings.push(
      {
        id: "visa-free",
        tone: "good",
        emoji: "🛂",
        title: "Bu safar uchun viza kerak emas",
        ...(visaFree.window
          ? {
              text: "Oddiy pasport bilan istalgan {window} kun ichida {days} kungacha vizasiz qolish mumkin.",
              vars: { days: visaFree.days, window: visaFree.window },
            }
          : { text: "Biometrik pasport bilan {days} kungacha vizasiz qolish mumkin.", vars: { days: visaFree.days } }),
      },
      {
        id: "passport",
        tone: "todo",
        emoji: "📘",
        title: "Pasport muddatini tekshiring",
        ...("beyondStayDays" in visaFree.passport
          ? {
              text: "Pasport qolish muddatidan keyin kamida 60 kun amal qilishi kerak ({days} kunlik safarda jami {total} kun).",
              vars: { days: visaFree.days, total: visaFree.days + visaFree.passport.beyondStayDays },
            }
          : {
              text: "Kirish kunida pasport kamida {months} oy amal qilishi kerak.",
              vars: { months: visaFree.passport.months },
            }),
        task: "Pasport muddatini tekshiring",
        priority: "Muhim",
      }
    );
  }

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
      text: visaFree
        ? "Siz yozgan daromad: {income}. Bank hisobi: {balance}. Chegarada safar uchun yetarli mablag' so'ralishi mumkin."
        : "Siz yozgan daromad: {income}. Bank hisobi: {balance}. Elchixona talab qiladigan miqdorni rasmiy manbadan tekshiring.",
      vars: { income: income || "—", balance: balance || "—" },
      href: "/dashboard/library",
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

  // A visa-free trip has no consular interview
  if (!visaFree) findings.push({
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
