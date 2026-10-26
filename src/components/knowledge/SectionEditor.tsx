"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Markdown } from "@/components/knowledge/Markdown";
import { saveSectionAction } from "@/lib/actions/knowledge";
import { cn } from "@/lib/utils";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary btn-md">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      Saqlash va qidiruvni yangilash
    </button>
  );
}

export function SectionEditor({
  section,
  editable,
}: {
  section: { id: string; number: string | null; title: string; status: string; content_md: string };
  editable: boolean;
}) {
  const [content, setContent] = useState(section.content_md);
  const [tab, setTab] = useState<"edit" | "preview">(editable ? "edit" : "preview");

  return (
    <form action={saveSectionAction} className="card grid gap-4 p-5 sm:p-6 md:grid-cols-4">
      <input type="hidden" name="id" value={section.id} />
      <input type="hidden" name="return_to" value={`/admin/knowledge/sections/${section.id}`} />
      <label className="block">
        <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Raqam</span>
        <input name="number" defaultValue={section.number ?? ""} className="input" disabled={!editable} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Sarlavha</span>
        <input name="title" defaultValue={section.title} required className="input" disabled={!editable} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-body-sm font-medium text-ink-900">Holat</span>
        <select name="status" defaultValue={section.status} className="input" disabled={!editable}>
          <option value="published">published</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>
      </label>

      <div className="md:col-span-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-pill bg-surface-muted p-1">
            {(["edit", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                disabled={t === "edit" && !editable}
                className={cn("rounded-pill px-3 py-1 text-body-sm font-medium", tab === t ? "bg-surface text-ink-900 shadow-xs" : "text-ink-600")}
              >
                {t === "edit" ? "Tahrirlash" : "Ko‘rinish"}
              </button>
            ))}
          </div>
          <span className="text-caption tabular-nums text-ink-500">{content.length.toLocaleString("uz")} belgi</span>
        </div>
        {/* The textarea stays mounted so the form always submits the latest text. */}
        <textarea
          name="content_md"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={28}
          readOnly={!editable}
          className={cn("input min-h-[480px] font-mono text-body-sm leading-relaxed", tab !== "edit" && "hidden")}
        />
        {tab === "preview" ? (
          <div className="max-h-[720px] overflow-y-auto rounded-2xl border border-surface-border p-5">
            <Markdown source={content} />
          </div>
        ) : null}
      </div>
      {editable ? (
        <div className="flex flex-wrap items-center gap-3 md:col-span-4">
          <SaveButton />
          <p className="text-caption text-ink-500">Oldingi matn tarixda saqlanadi. O‘zgargan bo‘laklar uchun embedding avtomatik qayta hisoblanadi.</p>
        </div>
      ) : null}
    </form>
  );
}
