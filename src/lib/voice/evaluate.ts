import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claudeCost } from "@/lib/ai/pricing";
import type { VoiceLang } from "@/lib/voice/instructions";

/**
 * After a voice interview, Claude reads the transcript once and returns a
 * practice evaluation. The transcript is used for this call only and is not
 * stored; only the evaluation below is saved with the session.
 */

export interface TranscriptTurn {
  role: "officer" | "applicant";
  text: string;
}

export interface VoiceEvaluation {
  overall: number;
  accuracy: number;
  coherence: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  next_steps: string[];
}

const LANGUAGE: Record<VoiceLang, string> = { uz: "Uzbek (Latin script)", ru: "Russian", en: "English" };

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "accuracy", "coherence", "summary", "strengths", "improvements", "next_steps"],
  properties: {
    overall: { type: "integer", description: "Overall preparedness for this interview, 0-100" },
    accuracy: { type: "integer", description: "How directly and precisely the questions were answered, 0-100" },
    coherence: { type: "integer", description: "Logical consistency of the answers with each other, 0-100" },
    summary: { type: "string", description: "Two or three sentences" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    next_steps: { type: "array", items: { type: "string" } },
  },
} as const;

const system = (lang: VoiceLang) =>
  [
    "You evaluate a PRACTICE visa interview held on VIZAR AI between an AI consular officer and an applicant from Uzbekistan.",
    "The transcript comes from speech recognition, so ignore small wording and spelling errors.",
    "Judge only what is in the transcript: clarity, directness, consistency, and whether the purpose of the trip, finances, ties to home and return plan were explained convincingly.",
    "Never predict whether a visa will be issued. Never ask for or repeat passport, ID or bank numbers.",
    "If the applicant barely spoke, give low scores and say so honestly.",
    `Write all text in ${LANGUAGE[lang]}. Keep each list to at most 4 short items.`,
  ].join("\n");

const clampScore = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const cleanList = (v: unknown) =>
  (Array.isArray(v) ? v : [])
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim().slice(0, 300))
    .filter(Boolean)
    .slice(0, 4);

export async function evaluateInterview(opts: {
  transcript: TranscriptTurn[];
  language: VoiceLang;
  countryName: string;
  visaLabel: string;
  level: string;
}): Promise<{ evaluation: VoiceEvaluation | null; model: string; inputTokens: number; outputTokens: number; costUsd: number }> {
  const text = opts.transcript.map((t) => `${t.role === "officer" ? "OFFICER" : "APPLICANT"}: ${t.text}`).join("\n");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 50_000, maxRetries: 1 });
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    system: system(opts.language),
    messages: [
      {
        role: "user",
        content: `Interview: ${opts.countryName}, ${opts.visaLabel}, level ${opts.level}.\n\nTranscript:\n${text}`,
      },
    ],
  });
  const usage = {
    model: message.model,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    costUsd: claudeCost(message.model, message.usage),
  };
  // Billed either way, so the usage is returned even without an evaluation
  if (message.stop_reason === "refusal") return { ...usage, evaluation: null };
  const raw = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...usage, evaluation: null };
  }
  return {
    ...usage,
    evaluation: {
      overall: clampScore(parsed.overall),
      accuracy: clampScore(parsed.accuracy),
      coherence: clampScore(parsed.coherence),
      summary: String(parsed.summary ?? "").trim().slice(0, 800),
      strengths: cleanList(parsed.strengths),
      improvements: cleanList(parsed.improvements),
      next_steps: cleanList(parsed.next_steps),
    },
  };
}
