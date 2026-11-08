/**
 * Document checker — the modular core for the future in-country service.
 *
 *   reader (adapter) → extracted fields + file facts → rules → findings
 *
 * Readers are swappable: today only the synthetic reader exists (it returns
 * made-up test data). The local Qwen vision model and PaddleOCR readers are
 * placeholders that refuse to run until a server in Uzbekistan is connected —
 * nothing here pretends otherwise. The rules only judge completeness,
 * dates and file quality; they never decide whether a document is genuine or
 * whether a visa will be issued.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */

export type DocKind = "passport" | "bank" | "employment" | "insurance" | "other";

export interface ExtractedFields {
  kind: DocKind;
  givenNames?: string;
  surname?: string;
  documentNumber?: string;
  /** ISO dates (yyyy-mm-dd) */
  birthDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
}

export interface FileFacts {
  mimeType: string;
  sizeBytes: number;
  /** Pixels of the scan or the first PDF page, when known */
  width?: number;
  height?: number;
}

export interface CheckInput {
  fields: ExtractedFields;
  file: FileFacts;
}

export interface CheckContext {
  /** Last day of the trip (yyyy-mm-dd) */
  travelEnd: string;
  /** Passport must stay valid this many months after the trip (Schengen 3, many others 6) */
  passportMonthsAfterTrip: number;
  /** Document kinds this application needs */
  requiredKinds: DocKind[];
}

export type FindingLevel = "ok" | "warn" | "fail";
export interface Finding {
  id: string;
  level: FindingLevel;
  /** Uzbek source text */
  message: string;
}

/** A reader turns a file into fields. Real readers run only on the in-country server. */
export interface DocumentReader {
  id: "synthetic" | "qwen-local" | "paddleocr-local";
  /** True only when it can actually run here */
  connected: boolean;
  read(input: CheckInput): Promise<ExtractedFields>;
}

export const syntheticReader: DocumentReader = {
  id: "synthetic",
  connected: true,
  // Synthetic samples already carry their fields
  read: async (input) => input.fields,
};

const notConnected = (id: DocumentReader["id"]): DocumentReader => ({
  id,
  connected: false,
  read: async () => {
    throw new Error(`${id}: mahalliy server hali ulanmagan`);
  },
});

/** Placeholders for the in-country service — they refuse to run until it exists */
export const qwenLocalReader = notConnected("qwen-local");
export const paddleOcrLocalReader = notConnected("paddleocr-local");

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 6 * 1024 * 1024;
const MIN_SHORT_SIDE = 1000;

function addMonths(iso: string, months: number): Date {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

/** Completeness, dates and file quality — never authenticity or visa odds */
export function checkDocument(input: CheckInput, ctx: CheckContext): Finding[] {
  const { fields, file } = input;
  const out: Finding[] = [];

  // Fit with the application's list
  out.push(
    ctx.requiredKinds.includes(fields.kind)
      ? { id: "listed", level: "ok", message: "Hujjat turi ariza ro'yxatida bor." }
      : { id: "listed", level: "warn", message: "Bu hujjat turi ariza ro'yxatida yo'q — kerakligini tekshiring." }
  );

  // File quality
  out.push(
    ACCEPTED_TYPES.includes(file.mimeType)
      ? { id: "type", level: "ok", message: "Fayl turi mos (PDF, JPG yoki PNG)." }
      : { id: "type", level: "fail", message: "Fayl turi mos emas: faqat PDF, JPG yoki PNG." }
  );
  if (file.sizeBytes > MAX_BYTES) out.push({ id: "size", level: "fail", message: "Fayl hajmi 6 MB dan katta." });
  if (file.width && file.height) {
    out.push(
      Math.min(file.width, file.height) >= MIN_SHORT_SIDE
        ? { id: "resolution", level: "ok", message: "Tasvir o'lchami o'qish uchun yetarli." }
        : { id: "resolution", level: "warn", message: "Tasvir o'lchami kichik — matn o'qilmasligi mumkin (kamida 1000 px)." }
    );
  }

  if (fields.kind === "passport") {
    // Fields a passport page must show
    const missing = [
      ["surname", "familiya"],
      ["givenNames", "ism"],
      ["documentNumber", "pasport raqami"],
      ["birthDate", "tug'ilgan sana"],
      ["expiryDate", "amal qilish muddati"],
    ].filter(([k]) => !fields[k as keyof ExtractedFields]);
    out.push(
      missing.length
        ? { id: "fields", level: "fail", message: `O'qilmagan maydonlar: ${missing.map(([, label]) => label).join(", ")}.` }
        : { id: "fields", level: "ok", message: "Asosiy maydonlar o'qildi." }
    );

    // Validity after the trip
    if (isIsoDate(fields.expiryDate) && isIsoDate(ctx.travelEnd)) {
      const expiry = new Date(`${fields.expiryDate}T00:00:00Z`);
      const needed = addMonths(ctx.travelEnd, ctx.passportMonthsAfterTrip);
      if (expiry < new Date(`${ctx.travelEnd}T00:00:00Z`)) {
        out.push({ id: "expiry", level: "fail", message: "Pasport safar tugashidan oldin muddati tugaydi." });
      } else if (expiry < needed) {
        out.push({
          id: "expiry",
          level: "fail",
          message: `Pasport safardan keyin kamida ${ctx.passportMonthsAfterTrip} oy amal qilishi kerak.`,
        });
      } else {
        out.push({ id: "expiry", level: "ok", message: "Amal qilish muddati safardan keyin ham yetarli." });
      }
    }
  }

  return out;
}

/** Overall: the worst finding */
export function overall(findings: Finding[]): FindingLevel {
  if (findings.some((f) => f.level === "fail")) return "fail";
  if (findings.some((f) => f.level === "warn")) return "warn";
  return "ok";
}
