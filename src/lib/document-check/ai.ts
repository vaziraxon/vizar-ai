import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { resolveAiMode } from "@/lib/ai/mode";
import { cancelClaude, finishClaude, reserveClaude } from "@/lib/ai/beta";
import { CLAUDE_MODEL, claudeCost } from "@/lib/ai/pricing";
import type { AiPayload } from "@/lib/document-check/score";

/**
 * Optional Claude advice on top of the rule-based result of the 4-option
 * readiness test. Only where an ANTHROPIC_API_KEY is set (KB_AI_MODE live),
 * and only for AI beta users within their 20 daily requests and the monthly
 * budget (src/lib/ai/beta.ts). It only ever receives buildAiPayload()'s
 * fields: destination, visa type, document names, the chosen answers and
 * requirement texts from the visa book — never a file.
 */
export function documentCheckAiEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return resolveAiMode(env) === "live";
}

const LANGUAGE: Record<string, string> = { uz: "o'zbek (lotin)", ru: "rus", en: "ingliz" };

const system = (lang: string) =>
  [
    `Sen VIZAR AI hujjat tayyorgarligi bo'yicha maslahatchisisan. ${LANGUAGE[lang] ?? LANGUAGE.uz} tilida, qisqa va aniq yoz.`,
    "Senga faqat foydalanuvchining o'zi tanlagan javoblari beriladi (A tayyor, B muammoli, C tayyorlanmoqda, D yo'q). Hech qanday hujjatni ko'rmagansan va tekshirmagansan.",
    "Hech qachon 'hujjatingizni tekshirdim' dema. 'Siz bergan javoblarga ko'ra' deb yoz.",
    "Faqat berilgan hujjatlar ro'yxati va kitob talablariga tayan; yangi talab o'ylab topma. 'verified: false' bo'lgan kitob talabini aniq talab sifatida emas, tekshirilishi kerak bo'lgan ma'lumot sifatida tilga ol.",
    "Viza berilishi ehtimolini aytma va kafolat berma. Oxirida rasmiy elchixona yoki viza markazi saytini tekshirishni eslat.",
    "Tuzilma: 1) qisqa xulosa, 2) birinchi navbatda qilinadigan 3 ta ish, 3) kitob talablariga nisbatan mumkin bo'lgan kamchiliklar.",
  ].join("\n");

/** Claude's advice as plain text, or null when AI is off, the user is past a limit, or the call fails */
export async function adviseWithAi(payload: AiPayload, userId: string, lang: string): Promise<string | null> {
  if (!documentCheckAiEnabled()) return null;
  const ticket = await reserveClaude(userId, "doc_advice", CLAUDE_MODEL);
  if (!ticket.ok) return null;
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 60_000, maxRetries: 1 });
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      output_config: { effort: "low" },
      system: system(lang),
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    });
    await finishClaude(ticket, {
      model: message.model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      costUsd: claudeCost(message.model, message.usage),
    });
    if (message.stop_reason === "refusal") return null;
    const text = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return text || null;
  } catch (error) {
    await cancelClaude(ticket);
    const detail = error instanceof Anthropic.APIError ? error.status : error instanceof Error ? error.message : error;
    console.error("[document-check] AI advice failed", detail);
    return null;
  }
}
