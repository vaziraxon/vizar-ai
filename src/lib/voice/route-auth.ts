import "server-only";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user's id for the voice API routes, or null */
export async function voiceUserId(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Uzbek source text for each refusal (translated in the UI) */
export const VOICE_DENIED_MESSAGE: Record<string, string> = {
  not_configured: "Ovozli suhbat hozircha ulanmagan.",
  not_beta: "Ovozli suhbat yopiq beta sinovida — faqat taklif qilingan 25 foydalanuvchi uchun.",
  disabled: "Ovozli suhbat vaqtincha to'xtatilgan.",
  budget: "AI beta sinovining oylik limiti tugadi. Keyinroq qayta urinib ko'ring.",
  week_limit: "Bu haftalik 15 daqiqangiz tugadi. Dushanba 00:00 da (Toshkent) yangilanadi.",
  active_elsewhere: "Sizda boshqa oynada ochiq suhbat bor. Avval uni tugating yoki 30 soniya kuting.",
  bad_request: "So'rov noto'g'ri.",
  provider_error: "Ovozli xizmatga ulanib bo'lmadi. Birozdan keyin qayta urinib ko'ring.",
  not_found: "Suhbat topilmadi.",
};

export const VOICE_DENIED_STATUS: Record<string, number> = {
  not_configured: 503,
  not_beta: 403,
  disabled: 503,
  budget: 429,
  week_limit: 429,
  active_elsewhere: 409,
  bad_request: 400,
  provider_error: 502,
  not_found: 404,
};
