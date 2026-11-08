import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { resolveAiMode } from "@/lib/ai/mode";
import type { AiPayload } from "@/lib/document-check/score";

/**
 * Optional Claude advice on top of the rule-based result. OFF unless both
 * KB_AI_MODE resolves to "live" (an ANTHROPIC_API_KEY is set) AND
 * DOCUMENT_CHECK_AI=on — so adding a key for the library never starts paid
 * document analyses by surprise. It only ever receives buildAiPayload()'s
 * fields: destination, visa type, document names, the chosen answers and
 * requirement texts from the visa book.
 */
export function documentCheckAiEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return resolveAiMode(env) === "live" && env.DOCUMENT_CHECK_AI === "on";
}

const MODEL = "claude-haiku-5-5";

const SYSTEM = [
  "Sen VIZAR AI hujjat tayyorgarligi bo'yicha maslahatchisisan. O'zbek tilida, qisqa va aniq yoz.",
  "Senga faqat foydalanuvchining o'zi tanlagan javoblari beriladi (A tayyor, B muammoli, C tayyorlanmoqda, D yo'q). Hech qanday hujjatni ko'rmagansan va tekshirmagansan.",
  "Hech qachon 'hujjatingizni tekshirdim' dema. 'Siz bergan javoblarga ko'ra' deb yoz.",
  "Faqat berilgan hujjatlar ro'yxati va kitob talablariga tayan; yangi talab o'ylab topma. 'verified: false' bo'lgan kitob talabini aniq talab sifatida emas, tekshirilishi kerak bo'lgan ma'lumot sifatida tilga ol.",
  "Viza berilishi ehtimolini aytma va kafolat berma. Oxirida rasmiy elchixona yoki viza markazi saytini tekshirishni eslat.",
  "Tuzilma: 1) qisqa xulosa, 2) birinchi navbatda qilinadigan 3 ta ish, 3) kitob talablariga nisbatan mumkin bo'lgan kamchiliklar.",
].join("\n");

/** Claude's advice as plain text, or null when AI is off or the call fails */
export async function adviseWithAi(payload: AiPayload): Promise<string | null> {
  if (!documentCheckAiEnabled()) return null;
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30_000, maxRetries: 1 });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    });
    const text = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return text || null;
  } catch (error) {
    console.error("[document-check] AI advice failed", error instanceof Error ? error.message : error);
    return null;
  }
}
