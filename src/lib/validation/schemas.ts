import { z } from "zod";

/**
 * Every Server Action / Route Handler that writes to the database
 * should parse its input through one of these schemas before doing
 * anything else. Never trust a client-supplied `user_id` — that value
 * always comes from the authenticated server session instead (see
 * `src/lib/data/*.ts`), so it is deliberately NOT part of these
 * schemas.
 */

export const applicationCreateSchema = z.object({
  destinationCountry: z.string().trim().min(2).max(100),
  visaType: z.string().trim().min(2).max(100),
  travelPurpose: z.string().trim().max(500).optional().nullable(),
  travelDate: z.string().trim().max(20).optional().nullable(), // ISO date string
});

export const applicationUpdateSchema = z.object({
  applicationId: z.string().uuid(),
  destinationCountry: z.string().trim().min(2).max(100).optional(),
  visaType: z.string().trim().min(2).max(100).optional(),
  travelPurpose: z.string().trim().max(500).optional().nullable(),
  travelDate: z.string().trim().max(20).optional().nullable(),
  status: z
    .enum(["draft", "in_review", "ready", "needs_consultation", "completed"])
    .optional(),
});

export const assessmentSaveSchema = z.object({
  applicationId: z.string().uuid(),
  step: z.number().int().min(0).max(10),
  // Coarse, non-sensitive demo answers only — see schema.sql comment
  // on assessments.answers for the constraint this must respect.
 answers: z.record(z.string(), z.any()),
});

export const assessmentCompleteSchema = z.object({
  applicationId: z.string().uuid(),
answers: z.record(z.string(), z.any()),
});
export const documentMetaSchema = z.object({
  applicationId: z.string().uuid(),
  documentType: z.string().trim().min(1).max(50),
  originalFilename: z.string().trim().min(1).max(255),
  storagePath: z.string().trim().min(1).max(500),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/jpg", "image/png"]),
  fileSize: z.number().int().positive().max(6 * 1024 * 1024, "Fayl hajmi 6 MB dan oshmasligi kerak."),
});

export const notificationMarkReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const consultationBookingSchema = z.object({
  applicationId: z.string().uuid().optional().nullable(),
  specialistName: z.string().trim().min(2).max(150),
  scheduledAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Sana noto'g'ri formatda.")
    .refine((v) => new Date(v).getTime() > Date.now(), "O'tmishdagi sanani tanlab bo'lmaydi."),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const consultationCancelSchema = z.object({
  consultationId: z.string().uuid(),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "To'g'ri telefon raqami kiriting.")
    .optional()
    .or(z.literal("")),
  preferredLanguage: z.enum(["uz", "ru", "en"]).optional(),
  accountType: z.enum(["individual", "agency"]).optional(),
});

export const reportCreateSchema = z.object({
  applicationId: z.string().uuid(),
  reportType: z.enum(["readiness", "documents", "interview", "refusal", "summary"]),
  title: z.string().trim().min(1).max(150),
  reportData: z.record(z.string(), z.unknown()),
});

// --- Auth forms -------------------------------------------------------------

export const emailSchema = z.string().trim().email("To'g'ri email manzil kiriting.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak."),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Ismingizni kiriting."),
    lastName: z.string().trim().min(2, "Familiyangizni kiriting."),
    email: emailSchema,
    phone: z.string().trim().regex(/^\+?\d{9,15}$/, "To'g'ri telefon raqami kiriting."),
    password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak."),
    confirmPassword: z.string(),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "Davom etish uchun shartlarga rozilik bildiring." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmadi.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
