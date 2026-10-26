"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, ArrowRight, Clock, Loader2, Printer, Volume2, RotateCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/site/Flag";
import { useDateLocale, useL } from "@/components/i18n/L";
import { useLanguage } from "@/lib/language-context";
import { matchDestination } from "@/lib/site/destination-match";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import {
  evaluateAnswer,
  INTERVIEW_HISTORY_KEY,
  type AnswerEval,
  type InterviewSession,
} from "@/lib/dashboard/interview-eval";
import {
  INTERVIEW_COUNTRY_QUESTION_SETS,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_SESSION_HISTORY,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const COUNTRIES = Object.keys(INTERVIEW_COUNTRY_QUESTION_SETS);
const DIFFICULTY_EMOJI: Record<string, string> = { Oson: "🌱", "O'rtacha": "⚖️", Qiyin: "🔥" };
const SPEECH_LANG: Record<string, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };

// Minimal typing for the Web Speech API (not in the TS DOM lib)
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
function recognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function Waveform() {
  return (
    <span className="flex h-5 items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-red-500"
          animate={{ height: [4, 16, 6, 18, 4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

export default function AiInterviewPage() {
  const l = useL();
  const locale = useDateLocale();
  const { language } = useLanguage();
  const [country, setCountry] = useState(COUNTRIES[0]!);
  const [difficulty, setDifficulty] = useState(INTERVIEW_DIFFICULTIES[1]!);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evals, setEvals] = useState<AnswerEval[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [history, setHistory] = useLocalState<InterviewSession[]>(INTERVIEW_HISTORY_KEY, []);
  const recognitionRef = useRef<Recognition | null>(null);

  const questions = INTERVIEW_COUNTRY_QUESTION_SETS[country]!;
  const question = questions[current];
  const feedback = evals[current];

  useEffect(() => setVoiceSupported(recognitionCtor() !== null), []);

  useEffect(() => {
    if (!started || finished || showFeedback) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [current, finished, started, showFeedback]);

  // Stop listening / speaking when leaving the page
  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    []
  );

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  function speakQuestion() {
    if (!question || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(l(question.question));
    u.lang = SPEECH_LANG[language] ?? "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function toggleVoice() {
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = SPEECH_LANG[language] ?? "en-US";
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        if (r.isFinal) text += r[0].transcript;
      }
      if (text) setAnswer((a) => (a ? `${a.trim()} ${text.trim()}` : text.trim()));
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  }

  function submitAnswer() {
    if (!answer.trim() || !question) return;
    recognitionRef.current?.stop();
    setAnalyzing(true);
    setTimeout(() => {
      const result = evaluateAnswer(answer, question.question);
      setEvals((prev) => {
        const next = [...prev];
        next[current] = result;
        return next;
      });
      setAnalyzing(false);
      setShowFeedback(true);
    }, 600);
  }

  function nextQuestion() {
    if (current === questions.length - 1) {
      const answered = evals.filter(Boolean);
      const score = answered.length ? Math.round(answered.reduce((s, e) => s + e.overall, 0) / answered.length) : 0;
      setHistory((prev) => [{ at: new Date().toISOString(), country, difficulty, score }, ...prev].slice(0, 12));
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
    setEvals([]);
    setShowFeedback(false);
    setSeconds(0);
  }

  /* ------------------------------------------------------------- Setup */
  if (!started) {
    return (
      <DashboardShell title="AI Interview Simulator" subtitle="Mashqni boshlashdan oldin davlat va qiyinlik darajasini tanlang.">
        <div className="card mx-auto max-w-2xl space-y-6 overflow-hidden rounded-[28px] p-6 sm:p-8">
          <div className="hero-sky-soft grain relative -mx-6 -mt-6 flex items-center gap-4 overflow-hidden px-6 py-6 sm:-mx-8 sm:-mt-8 sm:px-8">
            <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-surface text-[28px] shadow-float">🤖</span>
            <div>
              <p className="font-display text-body-lg font-bold text-ink-950">{l("Konsul bilan suhbatni mashq qiling")}</p>
              <p className="text-body-sm text-ink-600">{l("Savolga yozib yoki ovoz bilan javob bering — javobingiz darhol tahlil qilinadi.")}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-body-sm font-medium text-ink-700">{l("Davlat")}</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => {
                const visual = matchDestination(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountry(c)}
                    aria-pressed={country === c}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-pill border py-1.5 pl-1.5 pr-4 text-body-sm font-semibold transition-colors",
                      country === c ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                    )}
                  >
                    {visual ? <Flag code={visual.flag} size={26} /> : <span aria-hidden="true">🌍</span>}
                    {l(c)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-body-sm font-medium text-ink-700">{l("Qiyinlik darajasi")}</p>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  aria-pressed={difficulty === d}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-body-sm font-semibold transition-colors",
                    difficulty === d ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
                  )}
                >
                  <span aria-hidden="true">{DIFFICULTY_EMOJI[d] ?? "•"}</span> {l(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 text-caption text-ink-600 sm:grid-cols-3">
            <p className="rounded-2xl bg-surface-tint px-3 py-2.5">📝 {l("{n} ta savol", { n: questions.length })}</p>
            <p className="rounded-2xl bg-surface-tint px-3 py-2.5">
              {voiceSupported ? "🎙️" : "⌨️"} {voiceSupported ? l("Ovozli javob mavjud") : l("Matnli javob")}
            </p>
            <p className="rounded-2xl bg-surface-tint px-3 py-2.5">💾 {l("Natija saqlanadi")}</p>
          </div>

          <Button size="md" className="w-full" onClick={() => setStarted(true)}>
            {l("Mashqni boshlash")} <ArrowRight size={16} />
          </Button>

          <div className="border-t border-surface-border pt-5">
            <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900">
              <span aria-hidden="true">🕒</span> {l("Mashqlar tarixi")}
              {history.length === 0 && (
                <span className="rounded-md bg-surface-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  {l("Namuna")}
                </span>
              )}
            </p>
            <ul className="space-y-2">
              {(history.length
                ? history.map((s) => ({
                    key: s.at,
                    label: `${new Date(s.at).toLocaleDateString(locale, { day: "numeric", month: "short" })} · ${l(s.country)} · ${l(s.difficulty)}`,
                    score: s.score,
                  }))
                : INTERVIEW_SESSION_HISTORY.map((s) => ({ key: s.date, label: l(s.date), score: s.score }))
              ).map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-tint px-4 py-2.5 text-body-sm">
                  <span className="min-w-0 truncate text-ink-600">{s.label}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-surface-muted sm:block">
                      <span className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" style={{ width: `${s.score}%` }} />
                    </span>
                    <span className="font-semibold text-ink-950">{s.score}/100</span>
                  </span>
                </li>
              ))}
            </ul>
            {history.length > 0 && (
              <button type="button" onClick={() => setHistory([])} className="mt-3 text-caption font-semibold text-ink-500 hover:text-red-600">
                {l("Tarixni tozalash")}
              </button>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  /* ----------------------------------------------------------- Result */
  if (finished) {
    const answered = questions.map((q, i) => ({ q, e: evals[i] })).filter((x) => x.e);
    const score = answered.length ? Math.round(answered.reduce((s, x) => s + x.e!.overall, 0) / answered.length) : 0;
    const strong = answered.filter((x) => x.e!.overall >= 75);
    const weak = answered.filter((x) => x.e!.overall < 65);
    const tips = Array.from(new Set(answered.flatMap((x) => x.e!.tips))).slice(0, 3);

    return (
      <DashboardShell title="AI Interview — natija" subtitle="Javoblaringiz asosidagi qoidaga asoslangan baho.">
        <div id="interview-report" className="card mx-auto max-w-2xl rounded-[28px] p-8 text-center">
          <div className="flex justify-center">
            <ScoreRing score={score} size={130} strokeWidth={10} label="/ 100" />
          </div>
          <p className="mt-4 text-body font-semibold text-ink-900">
            {l("Intervyu tayyorgarligi — {country}, {difficulty} daraja", { country: l(country), difficulty: l(difficulty) })}
          </p>
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-body-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <span aria-hidden="true">💪</span> {l("Kuchli javoblar")}
              </p>
              <ul className="space-y-1.5 text-body-sm text-ink-600">
                {strong.length ? strong.map((x) => <li key={x.q.id}>{l(x.q.question)}</li>) : <li>—</li>}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-body-sm font-semibold text-red-600 dark:text-red-300">
                <span aria-hidden="true">⚠️</span> {l("Zaif javoblar")}
              </p>
              <ul className="space-y-1.5 text-body-sm text-ink-600">
                {weak.length ? weak.map((x) => <li key={x.q.id}>{l(x.q.question)}</li>) : <li>—</li>}
              </ul>
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-left">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2 rounded-2xl bg-surface-tint px-4 py-2.5 text-body-sm text-ink-700">
                <span aria-hidden="true">💡</span> {l(tip)}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-ink-400">{l("Qoidaga asoslangan tahlil — haqiqiy AI yoki konsullik qarori emas.")}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="md" onClick={restart}>
              <RotateCcw size={16} /> {l("Qayta mashq qilish")}
            </Button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-surface-border px-6 py-3.5 text-body-sm font-semibold text-ink-700"
            >
              <Printer size={16} /> {l("Hisobotni chop etish")}
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  /* ---------------------------------------------------------- Session */
  const sentiment = feedback ? (feedback.confidence >= 75 ? "Ijobiy" : feedback.confidence >= 55 ? "Neytral" : "Xavfli") : null;

  return (
    <DashboardShell
      title="AI Interview Simulator"
      subtitle={l("{country} — {difficulty} daraja intervyu mashqi.", { country: l(country), difficulty: l(difficulty) })}
    >
      <div className="card mx-auto max-w-2xl rounded-[28px] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 text-caption text-ink-400">
          <span className="rounded-pill bg-surface-tint px-3 py-1 font-semibold text-ink-700">
            {l("Savol {n} / {total}", { n: current + 1, total: questions.length })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {mm}:{ss}
          </span>
        </div>
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < current || (i === current && showFeedback)
                  ? "bg-gradient-to-r from-brand-500 to-violet-500"
                  : i === current
                    ? "bg-brand-200"
                    : "bg-surface-muted"
              )}
            />
          ))}
        </div>

        <div className="mt-5 flex items-start gap-3">
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-[20px] shadow-button">
            🤖
          </span>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-surface-tint px-4 py-3">
            <p className="text-body font-medium text-ink-900">{l(question!.question)}</p>
            <button
              type="button"
              onClick={speakQuestion}
              className="mt-2 inline-flex items-center gap-1.5 text-caption font-semibold text-brand-700 hover:text-brand-600"
            >
              <Volume2 size={13} /> {l("Savolni tinglash")}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder={l("Javobingizni shu yerga yozing...")}
            aria-label={l("Javobingiz")}
            className="w-full resize-none rounded-2xl border border-surface-border bg-surface px-4 py-3 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 disabled:opacity-60"
          />
          <p className="mt-1 text-right text-caption text-ink-400">
            {l("{n} so'z", { n: answer.trim() ? answer.trim().split(/\s+/).length : 0 })}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleVoice}
            disabled={!voiceSupported || showFeedback}
            title={voiceSupported ? undefined : l("Brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi")}
            className={cn(
              "flex items-center gap-2 rounded-pill border px-4 py-2 text-body-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              recording ? "border-red-300 bg-red-500/10 text-red-600" : "border-surface-border text-ink-700 hover:bg-surface-tint"
            )}
          >
            {recording ? <MicOff size={15} /> : <Mic size={15} />}
            {recording ? (
              <>
                <Waveform /> {l("To'xtatish")}
              </>
            ) : voiceSupported ? (
              l("Ovozli javob")
            ) : (
              l("Ovozli javob mavjud emas")
            )}
          </button>

          {!showFeedback ? (
            <Button size="md" onClick={submitAnswer} disabled={analyzing || !answer.trim()}>
              {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {l("Javobni yuborish")}
            </Button>
          ) : (
            <Button size="md" onClick={nextQuestion}>
              {current === questions.length - 1 ? l("Natijani ko'rish") : l("Keyingi savol")} <ArrowRight size={16} />
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showFeedback && feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden border-t border-surface-border pt-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-body-sm font-semibold text-ink-900">📊 {l("Javob tahlili")}</p>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-pill px-2.5 py-1 text-caption font-semibold",
                      sentiment === "Ijobiy" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                      sentiment === "Neytral" && "bg-amber-400/15 text-amber-700 dark:text-amber-300",
                      sentiment === "Xavfli" && "bg-red-500/10 text-red-600 dark:text-red-300"
                    )}
                  >
                    {l("Kayfiyat:")} {l(sentiment ?? "")}
                  </span>
                  <span className="rounded-pill bg-brand-50 px-2.5 py-1 font-accent text-body font-medium italic text-brand-700">
                    {feedback.overall}/100
                  </span>
                </span>
              </div>
              <div className="space-y-3">
                <ProgressBar label="Aniqlik" value={feedback.accuracy} />
                <ProgressBar label="Ishonchlilik" value={feedback.confidence} />
                <ProgressBar label="Mantiqiy izchillik" value={feedback.consistency} />
                <ProgressBar label="Aniqlik (clarity)" value={feedback.clarity} />
                <ProgressBar label="Savolga mosligi" value={feedback.relevance} />
              </div>
              <p className="mt-5 text-caption font-semibold text-ink-700">🚩 {l("Xavfli iboralar aniqlandi:")}</p>
              {feedback.risky.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {feedback.risky.map((p) => (
                    <span key={p} className="rounded-pill bg-red-500/10 px-2.5 py-1 text-caption font-semibold text-red-600 dark:text-red-300">
                      “{p}”
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-body-sm text-emerald-700 dark:text-emerald-300">✅ {l("Xavfli ibora topilmadi")}</p>
              )}
              <ul className="mt-4 space-y-2">
                {feedback.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 rounded-2xl bg-surface-tint px-3 py-2 text-body-sm text-ink-700">
                    <span aria-hidden="true">💡</span> {l(tip)}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-caption text-ink-400">{l("Qoidaga asoslangan tahlil — haqiqiy AI yoki konsullik qarori emas.")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
