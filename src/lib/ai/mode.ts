/**
 * Which answer generator the knowledge assistant uses.
 *
 *   live — Claude via ANTHROPIC_API_KEY (paid API calls)
 *   mock — canned answers built from the retrieved passages; development
 *          only, never calls a paid API
 *   off  — no generator: the assistant shows the retrieved book passages
 *          and official sources (free, works without any AI key)
 *
 * Default: live when ANTHROPIC_API_KEY is set, otherwise mock under
 * `next dev` and off everywhere else (production and Vercel previews).
 * KB_AI_MODE=off|mock|live overrides it: "off" is a kill switch for paid
 * calls even when a key is present, "mock" is ignored outside development,
 * and "live" without a key falls back to the default.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */
export type AiMode = "live" | "mock" | "off";

export const ANSWER_MODEL = "claude-opus-5-5";

export const AI_NOTICES = {
  off: "AI javoblari hozircha ulanmagan. Savolingiz bo‘yicha kitobdan eng mos bo‘limlar va rasmiy manbalar ko‘rsatiladi.",
  mock: "Test rejimi: javoblar sun’iy (mock) va faqat development muhitida ko‘rinadi.",
  liveFailed: "AI xizmati hozir javob bera olmadi. Kitobdan eng mos bo‘limlar ko‘rsatildi.",
  locked: "To‘liq javob va kitob matni faol obunada ochiladi (Standard, Premium, Pro yoki VIP). Hozircha savolingizga mos bo‘limlar ko‘rsatildi.",
} as const;

export function resolveAiMode(env: Record<string, string | undefined> = process.env): AiMode {
  const isDev = env.NODE_ENV === "development";
  const hasKey = Boolean(env.ANTHROPIC_API_KEY?.trim());
  const fallback: AiMode = isDev ? "mock" : "off";
  switch ((env.KB_AI_MODE ?? "").trim().toLowerCase()) {
    case "off":
      return "off";
    case "mock":
      return isDev ? "mock" : "off";
    default:
      return hasKey ? "live" : fallback;
  }
}
