/**
 * Answers that need no AI provider: the reference list, the "retrieval"
 * answer shown when AI is off, and the development-only mock answer.
 *
 * Dependency-free (type-only imports) so it runs in the API route and in
 * plain Node tests alike.
 */
import type { KbChunkHit, KbReference, KbRuleHit, KbSearchResult } from "./types";

const sectionName = (hit: KbChunkHit) => (hit.section_number ? `${hit.section_number}. ${hit.section_title}` : hit.section_title);

/** Numbered references in retrieval order: book passages first, then country rules. */
export function buildReferences(result: KbSearchResult): KbReference[] {
  const references: KbReference[] = [];
  for (const hit of result.chunks) {
    references.push({
      n: references.length + 1,
      kind: "book",
      title: sectionName(hit),
      location: `${hit.chapter_title} › ${sectionName(hit)}`,
      cited: false,
    });
  }
  for (const rule of result.rules) {
    references.push({
      n: references.length + 1,
      kind: "rule",
      title: `${rule.country_name}: ${rule.topic}`,
      urls: rule.sources.map((s) => s.url),
      status: rule.status,
      asOf: rule.as_of,
      cited: false,
    });
  }
  return references;
}

const markCited = (references: KbReference[], cited: Set<number>) => references.map((r) => ({ ...r, cited: cited.has(r.n) }));

/** Plain text of a passage: no table pipes, heading marks or line breaks; cut at a sentence or word boundary. */
export function excerpt(markdown: string, max = 240): string {
  const text = markdown
    .split("\n")
    .filter((line) => !line.startsWith("|") && !line.startsWith("###"))
    .join(" ")
    .replace(/[*>]/g, "")
    .replace(/<br>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentenceEnd > max * 0.5) return cut.slice(0, sentenceEnd + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max)}…`;
}

/** Rules lifted from tables start with the country column ("Davlat: AQSh"); skip it. */
function ruleLine(rule: KbRuleHit): string {
  const lines = rule.rule_text.split("\n");
  return excerpt((lines.length > 1 ? lines.slice(1) : lines).join("; "), 160);
}

/**
 * Shown when AI answers are off: the most relevant book passages verbatim,
 * plus the matching country rules, each with its ⟦n⟧ reference.
 */
export function retrievalAnswer(result: KbSearchResult): { markdown: string; references: KbReference[] } {
  const references = buildReferences(result);
  if (!result.chunks.length && !result.rules.length) {
    return { markdown: "Kitobda bu savolga mos bo‘lim topilmadi. Savolni boshqacha ifodalab ko‘ring.", references };
  }
  const cited = new Set<number>();
  const parts: string[] = [];
  result.chunks.slice(0, 3).forEach((hit, i) => {
    cited.add(i + 1);
    parts.push(`**${hit.heading_path}** ⟦${i + 1}⟧\n\n${hit.content}`);
  });
  if (result.rules.length) {
    const lines = result.rules.map((rule, i) => {
      const n = result.chunks.length + i + 1;
      cited.add(n);
      return `- **${rule.country_name}: ${rule.topic}** — ${ruleLine(rule)} ⟦${n}⟧`;
    });
    parts.push(`**Mamlakat qoidalari** (o‘zgarishi mumkin — rasmiy manbada tekshiring):\n\n${lines.join("\n")}`);
  }
  return { markdown: parts.join("\n\n---\n\n"), references: markCited(references, cited) };
}

/**
 * Development-only stand-in for the AI answer: a short, clearly labelled
 * summary stitched from the retrieved passages, so the chat UI, streaming
 * and citations can be tested without any paid API call.
 */
export function mockAnswer(result: KbSearchResult): { markdown: string; references: KbReference[] } {
  const references = buildReferences(result);
  const cited = new Set<number>();
  const lines: string[] = [
    "> 🧪 **Test javobi (mock).** Bu haqiqiy AI javobi emas — u faqat development muhitida interfeys va manbalarni sinash uchun kitobdan topilgan parchalardan yig‘iladi.",
  ];
  if (!result.chunks.length && !result.rules.length) {
    lines.push("Kitobda bu savolga mos bo‘lim topilmadi.");
    return { markdown: lines.join("\n\n"), references };
  }
  const points = result.chunks.slice(0, 3).map((hit, i) => {
    cited.add(i + 1);
    return `${i + 1}. **${sectionName(hit)}** — ${excerpt(hit.content, 220)} ⟦${i + 1}⟧`;
  });
  if (points.length) lines.push(`Kitobda bu mavzu bo‘yicha asosiy fikrlar:\n${points.join("\n")}`);
  const rules = result.rules.slice(0, 2).map((rule, i) => {
    const n = result.chunks.length + i + 1;
    cited.add(n);
    return `- **${rule.country_name}: ${rule.topic}** — ${ruleLine(rule)} ⟦${n}⟧`;
  });
  if (rules.length) lines.push(`Mamlakat qoidalari:\n${rules.join("\n")}`);
  lines.push("Aniq talablarni ariza topshirishdan oldin rasmiy manbalarda tekshiring.");
  return { markdown: lines.join("\n\n"), references: markCited(references, cited) };
}
