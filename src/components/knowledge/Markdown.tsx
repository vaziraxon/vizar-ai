import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small, safe Markdown renderer for knowledge-base content and AI answers.
 * Builds React elements (no innerHTML), so text from the database or the
 * model can never inject markup. Supports what the book and answers use:
 * headings, paragraphs, line breaks, ordered/unordered lists, blockquotes,
 * GFM tables, **bold**, *italic*, `code`, http(s) links, bare URLs and
 * ⟦n⟧ citation markers (rendered as links to #ref-n).
 */

const INLINE =
  /(\*\*([\s\S]+?)\*\*)|(\*([^*\n]+?)\*)|(`([^`]+)`)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?"'”’])|(⟦(\d+)⟧)|(<br>)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<strong key={key}>{inline(m[2]!, key)}</strong>);
    else if (m[3]) out.push(<em key={key}>{m[4]}</em>);
    else if (m[5]) out.push(<code key={key} className="rounded bg-surface-muted px-1 py-0.5 text-[0.9em]">{m[6]}</code>);
    else if (m[7]) out.push(<a key={key} href={m[9]} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2">{m[8]}</a>);
    else if (m[10]) out.push(<a key={key} href={m[10]} target="_blank" rel="noopener noreferrer" className="break-all text-brand-700 underline underline-offset-2">{m[10]}</a>);
    else if (m[11]) {
      out.push(
        <a key={key} href={`#ref-${m[12]}`} className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700 no-underline">
          [{m[12]}]
        </a>
      );
    } else if (m[13]) out.push(<br key={key} />);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  // Single newlines inside a paragraph are line breaks.
  return out.flatMap<ReactNode>((node, n) =>
    typeof node === "string"
      ? node.split("\n").flatMap<ReactNode>((part, j) => (j === 0 ? [part] : [<br key={`${keyBase}-br-${n}-${j}`} />, part]))
      : [node]
  );
}

const splitRow = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));

function block(raw: string, key: string): ReactNode {
  const lines = raw.split("\n");
  const first = lines[0]!;

  const heading = first.match(/^(#{1,4})\s+(.*)$/);
  if (heading && lines.length === 1) {
    const level = heading[1]!.length;
    const cls = level <= 2 ? "mt-6 font-display text-display-sm text-ink-950" : "mt-5 font-display text-[17px] font-bold text-ink-900";
    return level <= 2 ? (
      <h3 key={key} className={cls}>{inline(heading[2]!, key)}</h3>
    ) : (
      <h4 key={key} className={cls}>{inline(heading[2]!, key)}</h4>
    );
  }

  if (first.startsWith("|") && lines[1]?.match(/^\|\s*-{3}/)) {
    const head = splitRow(first);
    const rows = lines.slice(2).map(splitRow);
    return (
      <div key={key} className="my-4 overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full min-w-[480px] border-collapse text-left text-body-sm">
          <thead className="bg-surface-tint">
            <tr>
              {head.map((h, i) => (
                <th key={i} className="border-b border-surface-border px-3 py-2 font-semibold text-ink-900">{inline(h, `${key}-h${i}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-surface-border last:border-b-0">
                {head.map((_, ci) => (
                  <td key={ci} className="px-3 py-2 align-top text-ink-700">{inline(r[ci] ?? "", `${key}-${ri}-${ci}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (lines.every((l) => /^[-*] /.test(l))) {
    return (
      <ul key={key} className="my-3 list-disc space-y-1.5 pl-5">
        {lines.map((l, i) => <li key={i}>{inline(l.slice(2), `${key}-${i}`)}</li>)}
      </ul>
    );
  }
  if (lines.every((l) => /^\d+[.)] /.test(l))) {
    return (
      <ol key={key} className="my-3 list-decimal space-y-1.5 pl-5">
        {lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+[.)] /, ""), `${key}-${i}`)}</li>)}
      </ol>
    );
  }
  if (lines.every((l) => l.startsWith(">"))) {
    return (
      <blockquote key={key} className="my-4 border-l-4 border-brand-200 bg-brand-50/50 px-4 py-2 text-ink-700 dark:bg-white/5">
        {inline(lines.map((l) => l.replace(/^>\s?/, "")).join("\n"), key)}
      </blockquote>
    );
  }
  if (/^-{3,}$/.test(raw.trim())) return <hr key={key} className="my-6 border-surface-border" />;

  return <p key={key} className="my-3">{inline(raw, key)}</p>;
}

const lineKind = (line: string) =>
  /^\s*[-*] /.test(line) ? "ul"
  : /^\s*\d+[.)] /.test(line) ? "ol"
  : line.startsWith(">") ? "quote"
  : line.startsWith("|") ? "table"
  : /^#{1,4}\s/.test(line) ? "heading"
  : "p";

/** Model output often has no blank line between a sentence and the list after it: split those apart. */
function groups(raw: string): string[] {
  const out: { kind: string; lines: string[] }[] = [];
  for (const line of raw.split("\n")) {
    const kind = lineKind(line);
    const last = out[out.length - 1];
    if (last && last.kind === kind && kind !== "heading") last.lines.push(kind === "ul" || kind === "ol" ? line.trim() : line);
    else out.push({ kind, lines: [kind === "ul" || kind === "ol" ? line.trim() : line] });
  }
  return out.map((g) => g.lines.join("\n"));
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .flatMap(groups);
  return (
    <div className={cn("text-body leading-relaxed text-ink-800", className)}>
      {blocks.map((b, i) => (
        <Fragment key={i}>{block(b, `b${i}`)}</Fragment>
      ))}
    </div>
  );
}
