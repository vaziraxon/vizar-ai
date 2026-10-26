import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ANSWER_MODEL } from "@/lib/ai/mode";
import { buildReferences } from "./offline";
import type { KbReference, KbRuleHit, KbSearchResult } from "./types";

const SYSTEM_PROMPT = `You are VIZAR AI's visa consultant. You help people — mostly citizens of Uzbekistan — prepare visa applications, the way a careful professional consultant would.

Each question comes with search results from two places:
- the VIZAR AI book "Viza olish bo‘yicha amaliy qo‘llanma" by Vaziraxon Zokirova (edition of 26 October 2026), split into passages labelled with chapter and section;
- per-country visa rules quoted from that book, each with its official source pages and a review status.

Base every factual statement on these results and cite the ones you use. If they do not cover the question, say so plainly and name the kind of official source the person should check, instead of filling the gap from memory. General context that does not come from the results must be labelled as such.

Visa rules, fees, appointment channels and entry regimes change. When you give such a fact, say which date the book gives for it. If a country rule is marked as unverified or needing review, tell the person to confirm it on the linked official page before acting on it.

Never promise approval or estimate approval odds. Never help create, alter or embellish documents, bookings, invitations or bank balances; when asked, explain the honest alternative the book describes.

Answer in the language of the question (default: Uzbek, Latin script). Be concise and practical: short paragraphs or numbered steps, then — when relevant — what to verify on official sites.`;

const STATUS_TEXT: Record<KbRuleHit["status"], string> = {
  unverified: "rasmiy manbada muharrir tomonidan hali qayta tasdiqlanmagan",
  verified: "muharrir tomonidan rasmiy manba bilan tasdiqlangan",
  needs_review: "rasmiy manba o‘zgargan — qayta tekshirish kerak",
  outdated: "eskirgan",
};

/** Search hits → numbered references and the matching `search_result` blocks (same order). */
export function buildContext(result: KbSearchResult): {
  references: KbReference[];
  blocks: Anthropic.Beta.BetaSearchResultBlockParam[];
} {
  const blocks: Anthropic.Beta.BetaSearchResultBlockParam[] = [];

  for (const hit of result.chunks) {
    blocks.push({
      type: "search_result",
      source: `vizar-ai-kitob/${hit.chapter_slug}/${hit.section_slug}`,
      title: `VIZAR AI kitobi — ${hit.heading_path}`,
      content: [{ type: "text", text: hit.content }],
      citations: { enabled: true },
    });
  }

  for (const rule of result.rules) {
    const urls = rule.sources.map((s) => s.url);
    const meta = [
      `Holati: ${STATUS_TEXT[rule.status]}`,
      rule.as_of ? `kitobdagi ma’lumot sanasi: ${rule.as_of}` : null,
      rule.last_verified_at ? `oxirgi tasdiq: ${rule.last_verified_at.slice(0, 10)}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    blocks.push({
      type: "search_result",
      source: urls[0] ?? `vizar-ai-qoidalar/${rule.country_code}`,
      title: `Mamlakat qoidasi — ${rule.country_name}: ${rule.topic}`,
      content: [
        { type: "text", text: rule.rule_text },
        { type: "text", text: `${meta}.${urls.length ? ` Rasmiy manbalar: ${urls.join(" , ")}` : ""}` },
      ],
      citations: { enabled: true },
    });
  }
  return { references: buildReferences(result), blocks };
}

export function createAnswerStream(client: Anthropic, question: string, blocks: Anthropic.Beta.BetaSearchResultBlockParam[]) {
  return client.beta.messages.stream({
    model: ANSWER_MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium" },
    // On a safety-classifier decline, retry server-side on Anthropic's recommended model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: [...blocks, { type: "text", text: question }] }],
  });
}

/**
 * Final message → one Markdown string with ⟦n⟧ markers after each cited
 * passage (rendered as footnote links), plus which references were cited.
 */
export function assembleAnswer(message: Anthropic.Beta.BetaMessage, references: KbReference[]) {
  if (message.stop_reason === "refusal") {
    return {
      markdown: "Kechirasiz, bu savolga javob bera olmayman. Iltimos, savolni boshqacha ifodalang yoki mutaxassis bilan bog‘laning.",
      references,
    };
  }
  const cited = new Set<number>();
  let markdown = "";
  for (const block of message.content) {
    if (block.type !== "text") continue;
    markdown += block.text;
    const marks = new Set<number>();
    for (const c of block.citations ?? []) {
      if (c.type === "search_result_location") marks.add(c.search_result_index + 1);
    }
    for (const n of marks) {
      cited.add(n);
      markdown += `⟦${n}⟧`;
    }
  }
  return { markdown: markdown.trim(), references: references.map((r) => ({ ...r, cited: cited.has(r.n) })) };
}
