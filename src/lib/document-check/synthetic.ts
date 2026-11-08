import type { CheckInput } from "./checker";

/**
 * Made-up test documents for the admin bench. Obviously fake on purpose
 * (TEST names, TEST numbers) — never real people, never real files.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
export interface SyntheticSample {
  id: string;
  /** Uzbek source text */
  label: string;
  input: CheckInput;
}

const PDF = { mimeType: "application/pdf", sizeBytes: 420_000, width: 1654, height: 2339 };
const JPG = { mimeType: "image/jpeg", sizeBytes: 380_000, width: 1600, height: 1130 };

export const SYNTHETIC_SAMPLES: SyntheticSample[] = [
  {
    id: "passport-ok",
    label: "Pasport — to'liq va muddati yetarli",
    input: {
      fields: { kind: "passport", surname: "TESTOV", givenNames: "SINOV", documentNumber: "TEST00001", birthDate: "1990-01-01", expiryDate: "2031-05-20", issuingCountry: "UZB" },
      file: JPG,
    },
  },
  {
    id: "passport-expiring",
    label: "Pasport — safardan keyin muddati qisqa",
    input: {
      fields: { kind: "passport", surname: "TESTOVA", givenNames: "NAMUNA", documentNumber: "TEST00002", birthDate: "1988-06-15", expiryDate: "2027-04-10", issuingCountry: "UZB" },
      file: JPG,
    },
  },
  {
    id: "passport-missing",
    label: "Pasport — ism va raqam o'qilmagan",
    input: {
      fields: { kind: "passport", surname: "TESTOV", birthDate: "1995-03-03", expiryDate: "2032-01-01" },
      file: { mimeType: "image/jpeg", sizeBytes: 150_000, width: 640, height: 450 },
    },
  },
  {
    id: "bank-wrong-type",
    label: "Bank ko'chirmasi — noto'g'ri fayl turi",
    input: { fields: { kind: "bank" }, file: { mimeType: "image/heic", sizeBytes: 2_400_000 } },
  },
  {
    id: "insurance-ok",
    label: "Sug'urta polisi — PDF",
    input: { fields: { kind: "insurance" }, file: PDF },
  },
];
