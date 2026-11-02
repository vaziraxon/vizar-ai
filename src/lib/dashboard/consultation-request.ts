/**
 * A consultation request: what the user needs help with and how to reach them.
 * Stored as JSON in consultations.notes (supabase/consultation_requests.sql),
 * so the table needs no new columns. Site editors answer it outside the app.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
export const CONSULTATION_TOPICS = [
  "Hujjatlar",
  "Rad javobi",
  "Suhbatga tayyorgarlik",
  "Viza turini tanlash",
  "Boshqa",
] as const;

export interface ConsultationRequest {
  topic: string;
  contact: string;
  preferredTime: string;
  message: string;
}

export const encodeRequest = (request: ConsultationRequest) => JSON.stringify(request);

/** Rows from the old demo booking have no JSON, so they fall back to the specialist's name. */
export function readRequest(notes: string | null, specialistName: string | null): ConsultationRequest {
  try {
    const parsed: unknown = notes ? JSON.parse(notes) : null;
    if (parsed && typeof parsed === "object" && typeof (parsed as { topic?: unknown }).topic === "string") {
      const r = parsed as Record<string, unknown>;
      return {
        topic: String(r.topic),
        contact: String(r.contact ?? ""),
        preferredTime: String(r.preferredTime ?? ""),
        message: String(r.message ?? ""),
      };
    }
  } catch {
    // Plain-text notes: shown as the message below.
  }
  return { topic: specialistName ?? "Konsultatsiya", contact: "", preferredTime: "", message: notes ?? "" };
}

/** consultations.status as the user sees a request; Uzbek source strings for StatusBadge */
export const REQUEST_STATUS_LABEL: Record<string, string> = {
  booked: "Kutilmoqda",
  completed: "Bog'lanildi",
  cancelled: "Bekor qilindi",
};
