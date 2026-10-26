"use client";

import { useRef, useState, type FormEvent } from "react";
import { BookOpen, ExternalLink, Loader2, Send, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/knowledge/Markdown";
import { useL } from "@/components/i18n/L";
import type { AskEvent, KbReference } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Shengen vizasida 90/180 kun qoidasi qanday hisoblanadi?",
  "AQSh B-1/B-2 vizasi rad etilsa (214(b)) keyin nima qilish kerak?",
  "Bank ko‘chirmasida katta bir martalik tushum bo‘lsa, qanday izoh beriladi?",
  "Germaniya vizasi uchun O‘zbekistondan qayerga topshiriladi?",
];

interface Turn {
  id: number;
  question: string;
  text: string;
  markdown: string | null;
  references: KbReference[];
  mode: "ai" | "retrieval" | null;
  error: string | null;
  pending: boolean;
}

function StatusBadge({ status }: { status: KbReference["status"] }) {
  const l = useL();
  if (!status) return null;
  const verified = status === "verified";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold",
        verified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
      )}
    >
      {verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
      {l(verified ? "Tasdiqlangan" : status === "needs_review" ? "Qayta tekshirish kerak" : "Rasmiy manbada tekshiring")}
    </span>
  );
}

function References({ references }: { references: KbReference[] }) {
  const l = useL();
  const cited = references.filter((r) => r.cited);
  const other = references.filter((r) => !r.cited);
  const item = (r: KbReference) => (
    <li key={r.n} id={`ref-${r.n}`} className="flex gap-3 py-2.5">
      <span className="w-6 shrink-0 text-body-sm font-semibold tabular-nums text-brand-700">[{r.n}]</span>
      <div className="min-w-0 text-body-sm">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
          {r.kind === "book" ? <BookOpen size={14} className="shrink-0 text-ink-400" /> : null}
          {r.title}
          {r.kind === "rule" ? <StatusBadge status={r.status} /> : null}
        </p>
        {r.location ? <p className="mt-0.5 text-ink-500">{r.location}</p> : null}
        {r.kind === "rule" && r.asOf ? <p className="mt-0.5 text-ink-500">{l("Kitobdagi ma’lumot sanasi")}: {r.asOf}</p> : null}
        {r.urls?.length ? (
          <ul className="mt-1 space-y-0.5">
            {r.urls.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-brand-700 underline underline-offset-2">
                  {u}
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
  return (
    <div className="mt-5 border-t border-surface-border pt-4">
      <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l("Manbalar")}</p>
      <ol className="divide-y divide-surface-border">{(cited.length ? cited : references.slice(0, 3)).map(item)}</ol>
      {cited.length > 0 && other.length > 0 ? (
        <details className="mt-1">
          <summary className="cursor-pointer text-body-sm font-medium text-ink-600">
            {l("Topilgan boshqa bo‘limlar")} ({other.length})
          </summary>
          <ol className="divide-y divide-surface-border">{other.map(item)}</ol>
        </details>
      ) : null}
    </div>
  );
}

export function AssistantChat() {
  const l = useL();
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const nextId = useRef(1);
  const busy = turns.some((t) => t.pending);

  const update = (id: number, patch: (t: Turn) => Partial<Turn>) =>
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, ...patch(t) } : t)));

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 3 || busy) return;
    const id = nextId.current++;
    setTurns((all) => [...all, { id, question: q, text: "", markdown: null, references: [], mode: null, error: null, pending: true }]);
    setQuestion("");

    try {
      const res = await fetch("/api/knowledge/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        update(id, () => ({ error: body.error ?? l("Xatolik yuz berdi."), pending: false }));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as AskEvent;
          if (event.type === "references") update(id, () => ({ references: event.references }));
          else if (event.type === "delta") update(id, (t) => ({ text: t.text + event.text }));
          else if (event.type === "final") update(id, () => ({ markdown: event.markdown, references: event.references, mode: event.mode }));
          else if (event.type === "error") update(id, () => ({ error: event.message }));
        }
      }
      update(id, () => ({ pending: false }));
    } catch {
      update(id, () => ({ error: l("Tarmoq xatosi. Qayta urinib ko‘ring."), pending: false }));
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(question);
  };

  return (
    <div className="space-y-6">
      {turns.length === 0 ? (
        <div className="rounded-[28px] border border-surface-border bg-surface p-6 sm:p-8">
          <p className="font-display text-display-sm text-ink-950">{l("Kitobga asoslangan viza maslahatchisi")}</p>
          <p className="mt-2 max-w-2xl text-body text-ink-600">
            {l("Savolingizga VIZAR AI kitobidagi bo‘limlar va mamlakatlar bo‘yicha rasmiy manbalar asosida javob beriladi. Har bir javob ostida qaysi bob va manbaga tayanilgani ko‘rsatiladi.")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => void ask(ex)}
                className="rounded-pill border border-surface-border bg-surface-tint px-3.5 py-2 text-left text-body-sm font-medium text-ink-800 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {l(ex)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {turns.map((t) => (
        <article key={t.id} className="space-y-3">
          <p className="ml-auto max-w-[85%] rounded-[22px] rounded-br-md bg-brand-600 px-4 py-3 text-body text-white sm:max-w-[70%]">{t.question}</p>
          <div className="rounded-[28px] border border-surface-border bg-surface p-5 sm:p-7">
            {t.error ? (
              <p className="text-body text-red-700 dark:text-red-300">{t.error}</p>
            ) : t.markdown !== null ? (
              <Markdown source={t.markdown} />
            ) : t.text ? (
              <Markdown source={t.text} />
            ) : (
              <p className="flex items-center gap-2 text-body text-ink-500">
                <Loader2 size={16} className="animate-spin" />
                {l(t.references.length ? "Javob tayyorlanmoqda…" : "Kitobdan qidirilmoqda…")}
              </p>
            )}
            {t.references.length > 0 && !t.error ? <References references={t.references} /> : null}
          </div>
        </article>
      ))}

      <form onSubmit={onSubmit} className="sticky bottom-20 rounded-[24px] border border-surface-border bg-surface p-3 shadow-float lg:bottom-4">
        <label htmlFor="kb-question" className="sr-only">
          {l("Savolingiz")}
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id="kb-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(question);
              }
            }}
            rows={2}
            maxLength={1000}
            placeholder={l("Masalan: Kanada vizasi uchun bank ko‘chirmasi necha oylik bo‘lishi kerak?")}
            className="min-h-[52px] flex-1 resize-none rounded-2xl bg-transparent px-3 py-2 text-body text-ink-900 outline-none placeholder:text-ink-400"
          />
          <Button type="submit" disabled={busy || question.trim().length < 3} className="shrink-0">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {l("Yuborish")}
          </Button>
        </div>
      </form>
      <p className="text-caption text-ink-500">
        {l("Javoblar ma’lumot uchun. Viza qarorini faqat konsullik qabul qiladi; o‘zgaruvchan talablarni rasmiy saytda tekshiring.")}
      </p>
    </div>
  );
}
