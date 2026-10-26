"use client";

import { useState, useRef, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Loader2,
  Sparkles,
  AlertTriangle,
  Eye,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { getSignedDocumentUrlAction, deleteDocumentAction } from "@/lib/actions/documents";
import { runDemoAnalysis, uploadDocumentFile } from "@/lib/documents/upload-client";
import type { DocumentRow } from "@/lib/data/documents";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useL } from "@/components/i18n/L";

interface RealDocumentCardProps {
  applicationId: string;
  documentType: string;
  icon: LucideIcon;
  existingDoc: DocumentRow | null;
}

export function RealDocumentCard({
  applicationId,
  documentType,
  icon: Icon,
  existingDoc,
}: RealDocumentCardProps) {
  const router = useRouter();
  const l = useL();
  const [phase, setPhase] = useState<"idle" | "uploading" | "analyzing" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const doc = existingDoc;
  const analysis = doc?.analysis_summary as { issue?: string; summary?: string } | null;

  async function handleFile(file: File) {
    setErrorMsg("");
    setPhase("uploading");
    setProgress(5);
    const result = await uploadDocumentFile({ file, applicationId, documentType, onProgress: setProgress });
    if (!result.ok) {
      setErrorMsg(result.error);
      setPhase("error");
      return;
    }
    setPhase("analyzing");

    // Simulated demo AI analysis — clearly labeled, not a real service call.
    setTimeout(async () => {
      await runDemoAnalysis(result.documentId, documentType);
      router.refresh();
    }, 1400);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handlePreview() {
    if (!doc?.storage_path) return;
    const result = await getSignedDocumentUrlAction(doc.storage_path);
    if (result.ok) {
      window.open(result.data, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDelete() {
    if (!doc) return;
    await deleteDocumentAction(doc.id);
    router.refresh();
  }

  const displayStatus =
    doc?.status === "verified"
      ? "Tasdiqlandi"
      : doc?.status === "issue_found"
        ? "Kamchilik bor"
        : doc?.status === "expired"
          ? "Yangilash kerak"
          : doc?.status === "analyzing"
            ? "AI tahlil qilmoqda"
            : "Yuklanmagan";

  return (
    <div className="card spotlight flex flex-col gap-3 rounded-[24px] p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <Icon size={18} />
          </span>
          <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
            {l(documentType)}
          </p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {doc && phase === "idle" ? (
        <div className="flex items-center justify-between rounded-lg bg-surface-tint px-3 py-2 dark:bg-white/5">
          <span className="truncate text-caption text-ink-600 dark:text-white/60">
            {doc.original_filename}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handlePreview}
              aria-label={l("Faylni ko'rish")}
              className="text-brand-600 hover:text-brand-700"
            >
              <Eye size={15} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label={l("Faylni o'chirish")}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragOver
              ? "border-brand-400 bg-brand-50 dark:bg-brand-600/20"
              : "border-surface-border hover:border-brand-300 dark:border-white/10"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {phase === "idle" && (
            <>
              <UploadCloud size={22} className="text-brand-500" />
              <p className="text-caption text-ink-500 dark:text-white/50">
                {l("Faylni shu yerga tashlang yoki bosing (PDF, JPG, PNG — 6 MB gacha)")}
              </p>
            </>
          )}

          {phase === "uploading" && (
            <div className="w-full space-y-2">
              <p className="text-caption text-ink-500 dark:text-white/50">
                {l("Yuklanmoqda...")} {progress}%
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-muted dark:bg-white/10">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-pill bg-brand-600"
                />
              </div>
            </div>
          )}

          {phase === "analyzing" && (
            <div className="flex items-center gap-2 text-caption text-brand-600 dark:text-brand-300">
              <Loader2 size={15} className="animate-spin" />
              {l("AI hujjatni tahlil qilmoqda (demo)...")}
            </div>
          )}

          {phase === "error" && (
            <p className="flex items-center gap-1.5 text-caption font-medium text-red-600">
              <AlertTriangle size={13} /> {l(errorMsg)}
            </p>
          )}
        </div>
      )}

      {analysis?.summary && (
        <div className="border-t border-surface-border pt-3 dark:border-white/10">
          <button
            type="button"
            onClick={() => setInsightOpen((v) => !v)}
            className="flex w-full items-center justify-between text-caption font-semibold text-brand-600 dark:text-brand-300"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} /> {l("Demo OCR natijasi")}
            </span>
            <ChevronDown size={14} className={cn("transition-transform", insightOpen && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {insightOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-3 flex items-center gap-1.5 text-caption text-ink-400 dark:text-white/40">
                  <AlertTriangle size={12} /> {l("Bu haqiqiy hujjat tahlili emas — demo namuna.")}
                </p>
                <p className="mt-2 text-body-sm text-ink-700 dark:text-white/70">
                  {l(analysis.summary)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
