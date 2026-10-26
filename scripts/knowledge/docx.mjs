// Minimal, dependency-free .docx reader: unzips the archive with Node's
// zlib and walks word/document.xml into ordered blocks (paragraphs with
// run-level bold, and tables). Only what parse-book.mjs needs.
import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

export function readZipEntries(path, wanted) {
  const buf = readFileSync(path);
  // End of central directory record: signature 0x06054b50, scanned from the end.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a zip file (no end of central directory)");
  const count = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const out = {};
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error("Corrupt central directory");
    const method = buf.readUInt16LE(ptr + 10);
    const compSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.toString("utf8", ptr + 46, ptr + 46 + nameLen);
    ptr += 46 + nameLen + extraLen + commentLen;
    if (!wanted.includes(name)) continue;
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + lNameLen + lExtraLen;
    const data = buf.subarray(start, start + compSize);
    out[name] = (method === 0 ? data : inflateRawSync(data)).toString("utf8");
  }
  return out;
}

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");

function runText(run) {
  let out = "";
  for (const m of run.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>|<w:cr\/>/g)) {
    if (m[0] === "<w:tab/>") out += " ";
    else if (m[0] === "<w:br/>" || m[0] === "<w:cr/>") out += "\n";
    else out += decode(m[1]);
  }
  return out;
}

function isBold(run) {
  const rpr = run.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
  if (!rpr) return false;
  const b = rpr[1].match(/<w:b(?:\s+w:val="([^"]*)")?\s*\/>/);
  return Boolean(b) && !["0", "false", "off"].includes(b[1] ?? "");
}

/** Paragraph → { text, segments: [{ text, bold }] } (adjacent same-weight runs merged). */
function paragraph(p) {
  const segments = [];
  for (const m of p.matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)) {
    const text = runText(m[1]);
    if (!text) continue;
    const bold = isBold(m[1]);
    const last = segments[segments.length - 1];
    if (last && last.bold === bold) last.text += text;
    else segments.push({ text, bold });
  }
  return { text: segments.map((s) => s.text).join(""), segments };
}

function findClose(src, start, tag) {
  let depth = 0;
  const re = new RegExp(`<${tag}\\b[^>]*?(/?)>|</${tag}>`, "g");
  re.lastIndex = start;
  let m;
  while ((m = re.exec(src))) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) return re.lastIndex;
    } else if (m[1] === "/") {
      if (depth === 0) return re.lastIndex;
    } else depth++;
  }
  return src.length;
}

/** Ordered body blocks: { type: "p", style, ...paragraph } | { type: "table", rows: string[][] }. */
export function readDocxBlocks(path) {
  const files = readZipEntries(path, ["word/document.xml", "word/styles.xml"]);
  const xml = files["word/document.xml"];
  if (!xml) throw new Error("word/document.xml not found");
  const styleNames = {};
  for (const m of (files["word/styles.xml"] ?? "").matchAll(/<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g)) {
    const n = m[2].match(/<w:name w:val="([^"]+)"/);
    styleNames[m[1]] = n ? n[1] : m[1];
  }

  const body = xml.slice(xml.indexOf("<w:body>") + 8, xml.lastIndexOf("</w:body>"));
  const blocks = [];
  let i = 0;
  while (i < body.length) {
    const next = body.slice(i).search(/<w:(p|tbl)\b/);
    if (next < 0) break;
    const s = i + next;
    const isTable = body.startsWith("<w:tbl", s);
    const e = findClose(body, s, isTable ? "w:tbl" : "w:p");
    const chunk = body.slice(s, e);
    if (isTable) {
      const rows = [];
      for (const r of chunk.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)) {
        const cells = [];
        for (const c of r[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)) {
          const paras = [...c[0].matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((x) => paragraph(x[0]).text);
          cells.push(paras.join("\n").trim());
        }
        rows.push(cells);
      }
      blocks.push({ type: "table", rows });
    } else {
      const st = chunk.match(/<w:pStyle w:val="([^"]+)"/);
      blocks.push({ type: "p", style: st ? styleNames[st[1]] ?? st[1] : "Normal", ...paragraph(chunk) });
    }
    i = e;
  }
  return blocks;
}
