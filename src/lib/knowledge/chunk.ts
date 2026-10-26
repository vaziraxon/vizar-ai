/**
 * Splits a knowledge-base section (stored as Markdown in kb_sections.content_md)
 * into retrieval chunks for kb_chunks.
 *
 * Shared by the admin editor (server actions) and the one-off book importer
 * (scripts/knowledge/import-book.mjs, run with Node's built-in type
 * stripping), so this file must stay dependency-free and use only erasable
 * TypeScript syntax.
 *
 * Rules:
 * - chunks never cross a section boundary;
 * - a `### ` subheading starts a new chunk and is carried in headingPath;
 * - text is never dropped or rewritten — long paragraphs are split on
 *   sentence boundaries, long tables by rows (header repeated), long lists
 *   by items;
 * - target size is ~MAX_CHARS so the embedding model (gte-small, 512 tokens)
 *   sees almost all of each chunk.
 */

export interface ChunkContext {
  /** e.g. "I BOB. Viza tizimi va vizalarning turlari" */
  chapterLabel: string;
  /** e.g. "1.4. Vizada yozilgan ma’lumotlarni o‘qish" */
  sectionLabel: string;
}

export interface SectionChunk {
  chunkIndex: number;
  headingPath: string;
  content: string;
}

export const MAX_CHARS = 1100;

const isTable = (block: string) => block.startsWith("|");
const isList = (block: string) => /^(- |\d+\. )/.test(block);

function groupLines(lines: string[], max: number, prefix: string[] = []): string[] {
  const out: string[] = [];
  let buf: string[] = [];
  let len = prefix.join("\n").length;
  for (const line of lines) {
    if (buf.length > 0 && len + line.length + 1 > max) {
      out.push([...prefix, ...buf].join("\n"));
      buf = [];
      len = prefix.join("\n").length;
    }
    buf.push(line);
    len += line.length + 1;
  }
  if (buf.length > 0) out.push([...prefix, ...buf].join("\n"));
  return out;
}

function splitSentences(text: string): string[] {
  const sentences = text.split(/(?<=[.!?…»”"])\s+(?=[A-ZА-ЯЁЎҚҒҲ0-9“«"(\[—–-])/u);
  const out: string[] = [];
  for (const s of sentences) {
    if (s.length <= MAX_CHARS) {
      out.push(s);
      continue;
    }
    // A single run-on sentence: fall back to word boundaries.
    let rest = s;
    while (rest.length > MAX_CHARS) {
      const cut = rest.lastIndexOf(" ", MAX_CHARS);
      const at = cut > MAX_CHARS / 2 ? cut : MAX_CHARS;
      out.push(rest.slice(0, at));
      rest = rest.slice(at).trimStart();
    }
    if (rest) out.push(rest);
  }
  return out;
}

/** Breaks one oversized Markdown block into pieces no longer than MAX_CHARS where possible. */
function splitBlock(block: string): string[] {
  if (block.length <= MAX_CHARS) return [block];
  const lines = block.split("\n");
  if (isTable(block) && lines.length > 3) return groupLines(lines.slice(2), MAX_CHARS, lines.slice(0, 2));
  if (isList(block) && lines.length > 1) return groupLines(lines, MAX_CHARS);
  // Paragraph (possibly a blockquote): keep the quote marker on every piece.
  const quote = block.startsWith("> ");
  const body = quote ? block.replace(/^> /gm, "") : block;
  const pieces = groupLines(splitSentences(body), MAX_CHARS).map((p) => p.replace(/\n/g, " "));
  return quote ? pieces.map((p) => `> ${p}`) : pieces;
}

export function chunkSectionMarkdown(markdown: string, ctx: ChunkContext): SectionChunk[] {
  const blocks = markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const chunks: SectionChunk[] = [];
  let buf: string[] = [];
  let bufLen = 0;
  let bufHasBody = false;
  let subheading: string | null = null;

  const headingPath = () => [ctx.chapterLabel, ctx.sectionLabel, subheading].filter(Boolean).join(" › ");
  const flush = (force = false) => {
    if (bufHasBody || (force && buf.length > 0)) {
      chunks.push({ chunkIndex: chunks.length, headingPath: headingPath(), content: buf.join("\n\n") });
    }
    buf = [];
    bufLen = 0;
    bufHasBody = false;
  };

  for (const block of blocks) {
    if (block.startsWith("### ")) {
      // Consecutive subheadings with nothing between them stay together.
      if (bufHasBody) flush();
      subheading = block.slice(4).trim();
      buf.push(block);
      bufLen += block.length + 2;
      continue;
    }
    for (const piece of splitBlock(block)) {
      if (bufHasBody && bufLen + piece.length + 2 > MAX_CHARS) {
        flush();
        // Keep the subheading visible at the top of a continued subsection.
        if (subheading) {
          buf.push(`### ${subheading}`);
          bufLen = subheading.length + 4;
        }
      }
      buf.push(piece);
      bufLen += piece.length + 2;
      bufHasBody = true;
    }
  }
  flush(true);
  return chunks;
}
