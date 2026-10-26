"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, ImageIcon, Loader2, UploadCloud, X, AlertTriangle } from "lucide-react";
import { useL } from "@/components/i18n/L";
import { validateFile, MAX_FILE_SIZE_BYTES } from "@/lib/document-constraints";
import { guessDocumentType, runDemoAnalysis, uploadDocumentFile } from "@/lib/documents/upload-client";
import { cn } from "@/lib/utils";

type ItemState = "ready" | "invalid" | "uploading" | "done" | "error";
interface QueueItem {
  key: string;
  file: File;
  type: string;
  state: ItemState;
  progress: number;
  error?: string;
}

const MAX_FILES = 10;
const fmtSize = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1).replace(/\.0$/, "")} MB`);

/**
 * Multi-file upload for the documents page: drop or pick several files,
 * check the auto-detected document type for each, upload them all in one go.
 * Uses the same validated upload path as the single document cards.
 */
export function BulkUploader({
  applicationId,
  documentTypes,
  sandbox = false,
  onSandboxUpload,
}: {
  applicationId?: string;
  documentTypes: string[];
  /** Simulate the upload in the browser only — nothing is sent anywhere */
  sandbox?: boolean;
  onSandboxUpload?: (file: File, documentType: string) => void;
}) {
  const l = useL();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);
  const fallbackType = documentTypes.includes("Qo'shimcha hujjatlar") ? "Qo'shimcha hujjatlar" : documentTypes[documentTypes.length - 1]!;

  function addFiles(list: FileList | File[]) {
    const files = Array.from(list);
    setQueue((prev) => {
      const room = Math.max(0, MAX_FILES - prev.length);
      const next = files.slice(0, room).map<QueueItem>((file, i) => {
        const invalid = validateFile(file);
        return {
          key: `${Date.now()}-${i}-${file.name}`,
          file,
          type: guessDocumentType(file.name, fallbackType),
          state: invalid ? "invalid" : "ready",
          progress: 0,
          error: invalid ?? undefined,
        };
      });
      return [...prev, ...next];
    });
  }

  function update(key: string, patch: Partial<QueueItem>) {
    setQueue((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  async function uploadAll() {
    const pending = queue.filter((q) => q.state === "ready" || q.state === "error");
    if (!pending.length) return;
    setRunning(true);
    const analyses: Promise<void>[] = [];
    for (const item of pending) {
      update(item.key, { state: "uploading", progress: 5, error: undefined });
      if (sandbox || !applicationId) {
        for (const p of [30, 65, 100]) {
          await new Promise((r) => setTimeout(r, 220));
          update(item.key, { progress: p });
        }
        update(item.key, { state: "done", progress: 100 });
        onSandboxUpload?.(item.file, item.type);
        continue;
      }
      const result = await uploadDocumentFile({
        file: item.file,
        applicationId,
        documentType: item.type,
        onProgress: (p) => update(item.key, { progress: p }),
      });
      if (result.ok) {
        update(item.key, { state: "done", progress: 100 });
        analyses.push(runDemoAnalysis(result.documentId, item.type));
      } else {
        update(item.key, { state: "error", error: result.error });
      }
    }
    await Promise.all(analyses);
    setRunning(false);
    if (!sandbox) router.refresh();
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  const readyCount = queue.filter((q) => q.state === "ready" || q.state === "error").length;
  const doneCount = queue.filter((q) => q.state === "done").length;

  return (
    <section aria-labelledby="bulk-title" className="card mb-6 overflow-hidden rounded-[28px] p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-6 py-5">
        <div>
          <h2 id="bulk-title" className="flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true">{sandbox ? "🧪" : "📤"}</span> {l("Bir nechta faylni birdaniga yuklash")}
            {sandbox && (
              <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">
                Sandbox
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-body-sm text-ink-600">{l("Hujjat turi fayl nomidan aniqlanadi — kerak bo'lsa o'zgartiring.")}</p>
        </div>
        {doneCount > 0 && (
          <span className="rounded-pill bg-emerald-500/10 px-3 py-1 text-caption font-semibold text-emerald-700 dark:text-emerald-300">
            ✅ {l("{n} ta fayl yuklandi", { n: doneCount })}
          </span>
        )}
      </div>

      <div className="p-6">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), inputRef.current?.click())}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed px-6 py-9 text-center transition-colors",
            dragOver ? "border-brand-500 bg-brand-50" : "border-surface-strong bg-surface-tint/60 hover:border-brand-300 hover:bg-brand-50/50"
          )}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-button">
            <UploadCloud size={24} />
          </span>
          <p className="mt-1 text-body font-semibold text-ink-900">{l("Fayllarni shu yerga tashlang yoki tanlang")}</p>
          <p className="text-caption text-ink-500">
            {l("PDF, JPG, PNG · har biri {size} gacha · bir martada {n} tagacha", {
              size: fmtSize(MAX_FILE_SIZE_BYTES),
              n: MAX_FILES,
            })}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="application/pdf,image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <AnimatePresence initial={false}>
          {queue.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <ul className="mt-5 space-y-2">
                {queue.map((item) => {
                  const isImage = item.file.type.startsWith("image/");
                  return (
                    <li key={item.key} className="rounded-2xl border border-surface-border bg-surface p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tint text-ink-600">
                          {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm font-semibold text-ink-900">{item.file.name}</p>
                          <p className="text-caption text-ink-500">{fmtSize(item.file.size)}</p>
                        </div>
                        <select
                          value={item.type}
                          onChange={(e) => update(item.key, { type: e.target.value })}
                          disabled={item.state === "uploading" || item.state === "done" || item.state === "invalid"}
                          aria-label={l("Hujjat turi")}
                          className="h-9 max-w-[13rem] rounded-xl border border-surface-border bg-surface px-2.5 text-body-sm text-ink-900 outline-none focus:border-brand-400 disabled:opacity-60"
                        >
                          {documentTypes.map((t) => (
                            <option key={t} value={t}>
                              {l(t)}
                            </option>
                          ))}
                        </select>
                        <span className="flex w-24 shrink-0 justify-end">
                          {item.state === "uploading" && <Loader2 size={18} className="animate-spin text-brand-600" />}
                          {item.state === "done" && <CheckCircle2 size={18} className="text-emerald-600" />}
                          {(item.state === "ready" || item.state === "invalid" || item.state === "error") && (
                            <button
                              type="button"
                              onClick={() => setQueue((prev) => prev.filter((q) => q.key !== item.key))}
                              aria-label={l("Ro'yxatdan olib tashlash")}
                              disabled={running}
                              className="flex h-8 w-8 items-center justify-center rounded-pill text-ink-400 transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </span>
                      </div>
                      {item.state === "uploading" && (
                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.error && (
                        <p className="mt-2 flex items-center gap-1.5 text-caption font-medium text-red-600 dark:text-red-300">
                          <AlertTriangle size={13} /> {l(item.error)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setQueue((prev) => prev.filter((q) => q.state === "uploading"))}
                  disabled={running}
                  className="text-caption font-semibold text-ink-500 hover:text-ink-900 disabled:opacity-40"
                >
                  {l("Ro'yxatni tozalash")}
                </button>
                <button type="button" onClick={uploadAll} disabled={running || readyCount === 0} className="btn-primary btn-md">
                  {running ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {running ? l("Yuklanmoqda...") : readyCount === 0 && doneCount > 0 ? `✅ ${l("Hammasi yuklandi")}` : l("{n} ta faylni yuklash", { n: readyCount })}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
