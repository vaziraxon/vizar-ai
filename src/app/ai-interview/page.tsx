"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mic,
  Send,
  ArrowRight,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  History,
  Gauge as GaugeIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  INTERVIEW_COUNTRY_QUESTION_SETS,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_SESSION_HISTORY,
} from "@/data/mockData";
import type { InterviewFeedback } from "@/types";
import { cn } from "@/lib/utils";

const MOCK_FEEDBACK: InterviewFeedback & { clarity: number; relevance: number } = {
  accuracy: 82,
  confidence: 74,
  consistency: 88,
  clarity: 79,
  relevance: 86,
  riskyPhrases: ["\"aniq bilmayman\"", "\"balki qolib ketarman\""],
  improvedExample:
    "Men ushbu safarni aniq maqsad bilan rejalashtirganman va belgilangan muddatda O'zbekistonga qaytaman, chunki ishim va oilam shu yerda.",
};

const COUNTRIES = Object.keys(INTERVIEW_COUNTRY_QUESTION_SETS);

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-6 items-center gap-0.5">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-brand-500"
          animate={active ? { height: [4, 18, 6, 22, 4] } : { height: 4 }}
          transition={{
            duration: 0.9,
            repeat: active ? Infinity : 0,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function AiInterviewPage() {
  const [country, setCountry] = useState(COUNTRIES[0]!);
  const [difficulty, setDifficulty] = useState(INTERVIEW_DIFFICULTIES[1]!);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [recording, setRecording] = useState(false);

  const questions = INTERVIEW_COUNTRY_QUESTION_SETS[country]!;

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [current, finished, started]);

  const question = questions[current];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const sentiment =
    MOCK_FEEDBACK.confidence >= 75 ? "Ijobiy" : MOCK_FEEDBACK.confidence >= 55 ? "Neytral" : "Xavfli";
  const sentimentColor =
    sentiment === "Ijobiy" ? "text-success" : sentiment === "Neytral" ? "text-warning" : "text-red-500";

  function submitAnswer() {
    if (!answer.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowFeedback(true);
    }, 1000);
  }

  function nextQuestion() {
    if (current === questions.length - 1) {
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    setAnswer("");
    setShowFeedback(false);
    setSeconds(0);
  }

  function restart() {
    setStarted(false);
    setCurrent(0);
    setFinished(false);
    setAnswer("");
    setShowFeedback(false);
    setSeconds(0);
  }

  if (!started) {
    return (
      <DashboardShell
        title="AI Interview Simulator"
        subtitle="Mashqni boshlashdan oldin davlat va qiyinlik darajasini tanlang."
      >
        <div className="card mx-auto max-w-2xl space-y-5 p-6 dark:border-white/10 dark:bg-navy-800 sm:p-8">
          <div>
            <label className="mb-2 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Davlat
            </label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(c)}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-body-sm font-medium transition-colors",
                    country === c
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Qiyinlik darajasi
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-body-sm font-medium transition-colors",
                    difficulty === d
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Button size="md" className="w-full" onClick={() => setStarted(true)}>
            Mashqni boshlash <ArrowRight size={16} />
          </Button>

          <div className="border-t border-surface-border pt-5 dark:border-white/10">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <History size={15} className="text-brand-600" /> Mashqlar tarixi
            </p>
            <ul className="space-y-2">
              {INTERVIEW_SESSION_HISTORY.map((s) => (
                <li key={s.date} className="flex items-center justify-between text-body-sm">
                  <span className="text-ink-600 dark:text-white/60">{s.date}</span>
                  <span className="font-semibold text-ink-900 dark:text-white">{s.score}/100</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (finished) {
    return (
      <DashboardShell
        title="AI Interview — natija"
        subtitle="Mashqingiz asosidagi mock baholash."
      >
        <div id="interview-report" className="card mx-auto max-w-2xl p-8 text-center dark:border-white/10 dark:bg-navy-800">
          <div className="flex justify-center">
            <ScoreRing score={76} size={130} strokeWidth={10} label="/ 100" />
          </div>
          <p className="mt-4 text-body font-semibold text-ink-900 dark:text-white">
            Intervyu tayyorgarligi — {country}, {difficulty} daraja
          </p>
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-surface-border p-4 dark:border-white/10">
              <p className="mb-2 flex items-center gap-1.5 text-body-sm font-semibold text-success">
                <CheckCircle2 size={15} /> Kuchli javoblar
              </p>
              <ul className="space-y-1.5 text-body-sm text-ink-600 dark:text-white/60">
                <li>Safar maqsadi bo&apos;yicha savol</li>
                <li>Yashash manzili bo&apos;yicha savol</li>
              </ul>
            </div>
            <div className="rounded-xl border border-surface-border p-4 dark:border-white/10">
              <p className="mb-2 flex items-center gap-1.5 text-body-sm font-semibold text-red-600">
                <AlertTriangle size={15} /> Zaif javoblar
              </p>
              <ul className="space-y-1.5 text-body-sm text-ink-600 dark:text-white/60">
                <li>Qaytish kafolati bo&apos;yicha savol</li>
                <li>Xarajatlarni qoplash bo&apos;yicha savol</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-body-sm text-ink-600 dark:text-white/60">
            Tavsiya: qaytish niyatingizni yanada aniqroq va ishonchli
            asoslashga e&apos;tibor bering.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="md" onClick={restart}>
              Qayta mashq qilish
            </Button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-surface-border px-6 py-3.5 text-body-sm font-semibold text-ink-700 dark:border-white/10 dark:text-white/70"
            >
              <Printer size={16} /> Hisobotni yuklab olish (demo)
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="AI Interview Simulator"
      subtitle={`${country} — ${difficulty} daraja intervyu mashqi.`}
    >
      <div className="card mx-auto max-w-2xl p-6 dark:border-white/10 dark:bg-navy-800 sm:p-8">
        <div className="flex items-center justify-between text-caption text-ink-400 dark:text-white/40">
          <span>
            Savol {current + 1} / {questions.length}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {mm}:{ss}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-tint p-4 dark:bg-white/5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
            <Bot size={17} />
          </span>
          <p className="text-body font-medium text-ink-900 dark:text-white">
            {question!.question}
          </p>
        </div>

        <div className="mt-4">
          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="Javobingizni shu yerga yozing..."
            className="w-full resize-none rounded-lg border border-surface-border bg-white px-4 py-3 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 disabled:opacity-60 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setRecording((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-pill border px-4 py-2 text-body-sm font-medium transition-colors",
              recording
                ? "border-red-300 bg-red-50 text-red-600 dark:border-red-400/30 dark:bg-red-400/10"
                : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
            )}
          >
            <Mic size={15} />
            {recording ? <Waveform active /> : "Ovozli javob (demo)"}
          </button>

          {!showFeedback ? (
            <Button size="md" onClick={submitAnswer} disabled={analyzing}>
              {analyzing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Javobni yuborish
            </Button>
          ) : (
            <Button size="md" onClick={nextQuestion}>
              Keyingi savol <ArrowRight size={16} />
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden border-t border-surface-border pt-6 dark:border-white/10"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                  AI fikri (mock)
                </p>
                <span className={cn("flex items-center gap-1.5 text-caption font-semibold", sentimentColor)}>
                  <GaugeIcon size={13} /> Kayfiyat: {sentiment}
                </span>
              </div>
              <div className="space-y-3">
                <ProgressBar label="Aniqlik" value={MOCK_FEEDBACK.accuracy} />
                <ProgressBar label="Ishonchlilik" value={MOCK_FEEDBACK.confidence} />
                <ProgressBar label="Mantiqiy izchillik" value={MOCK_FEEDBACK.consistency} />
                <ProgressBar label="Aniqlik (clarity)" value={MOCK_FEEDBACK.clarity} />
                <ProgressBar label="Savolga mosligi" value={MOCK_FEEDBACK.relevance} />
              </div>
              <p className="mt-4 text-caption font-semibold text-red-600">
                Xavfli iboralar aniqlandi:
              </p>
              <p className="text-body-sm text-ink-600 dark:text-white/60">
                {MOCK_FEEDBACK.riskyPhrases.join(", ")}
              </p>
              <p className="mt-3 text-caption font-semibold text-success">
                Yaxshilangan javob namunasi:
              </p>
              <p className="text-body-sm italic text-ink-600 dark:text-white/60">
                &quot;{MOCK_FEEDBACK.improvedExample}&quot;
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
