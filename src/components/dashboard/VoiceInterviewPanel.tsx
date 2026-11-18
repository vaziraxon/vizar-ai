"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, PhoneOff, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFormatDate, useL } from "@/components/i18n/L";
import { useLanguage } from "@/lib/language-context";
import { PLAYBOOK_COUNTRIES, PLAYBOOK_LEVELS, type PlaybookLevel } from "@/data/interview-playbook";
import { cn } from "@/lib/utils";

/**
 * Live voice interview (AI beta): the browser talks to OpenAI over WebRTC,
 * but the offer goes through our server, which holds the key, counts the
 * time and can end the call. The countdown here is only a display — the
 * server's clock decides (check-in every 10 s). Nothing is recorded; the
 * transcript is sent once at the end for the evaluation and not stored.
 */

type VisaKind = "tourist" | "student" | "work" | "business";
type Lang = "uz" | "ru" | "en";
type Turn = { role: "officer" | "applicant"; text: string };
type Usage = { audio_in: number; audio_cached: number; audio_out: number; text_in: number; text_cached: number; text_out: number };
type Evaluation = {
  overall: number;
  accuracy: number;
  coherence: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  next_steps: string[];
};
type Status = {
  configured: boolean;
  beta: boolean;
  enabled: boolean;
  weeklySeconds: number;
  remainingSeconds: number;
  resetsAt: string;
  active: { id: string; deadlineAt: string } | null;
  history: { id: string; startedAt: string; seconds: number; destination: string; level: PlaybookLevel; language: Lang; overall: number | null; endReason: string | null }[];
};
type Phase = "idle" | "connecting" | "live" | "ending" | "result";

const VISA_KINDS: { key: VisaKind; label: string }[] = [
  { key: "tourist", label: "Turistik" },
  { key: "student", label: "Talaba" },
  { key: "work", label: "Ishchi" },
  { key: "business", label: "Biznes" },
];
const LANGS: { key: Lang; label: string }[] = [
  { key: "uz", label: "O‘zbekcha" },
  { key: "ru", label: "Русский" },
  { key: "en", label: "English" },
];

const mmss = (s: number) => {
  const v = Math.max(0, Math.round(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
};

const emptyUsage = (): Usage => ({ audio_in: 0, audio_cached: 0, audio_out: 0, text_in: 0, text_cached: 0, text_out: 0 });

export function VoiceInterviewPanel() {
  const l = useL();
  const formatDate = useFormatDate();
  const { language } = useLanguage();
  const [status, setStatus] = useState<Status | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("us");
  const [visaKind, setVisaKind] = useState<VisaKind>("tourist");
  const [lang, setLang] = useState<Lang>((["uz", "ru", "en"].includes(language) ? language : "uz") as Lang);
  const [level, setLevel] = useState<PlaybookLevel>("medium");
  const [left, setLeft] = useState(0);
  const [speaking, setSpeaking] = useState<"officer" | "applicant" | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalNote, setEvalNote] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<string | null>(null);
  const transcriptRef = useRef<Turn[]>([]);
  const usageRef = useRef<Usage>(emptyUsage());
  const endsAtRef = useRef(0);
  const endingRef = useRef(false);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/voice/status", { cache: "no-store" }).catch(() => null);
    if (res?.ok) setStatus(await res.json());
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const addText = (role: Turn["role"], text: string, append: boolean) => {
    const turns = transcriptRef.current;
    const last = turns[turns.length - 1];
    if (append && last && last.role === role) last.text += text;
    else if (text.trim()) turns.push({ role, text });
  };

  /** Events from both OpenAI backends (Realtime and Live) */
  const onEvent = (event: Record<string, unknown>) => {
    switch (event.type) {
      // gpt-realtime-2.1-mini
      case "conversation.item.input_audio_transcription.completed":
        addText("applicant", String(event.transcript ?? ""), false);
        break;
      case "response.output_audio_transcript.done":
        addText("officer", String(event.transcript ?? ""), false);
        break;
      case "input_audio_buffer.speech_started":
        setSpeaking("applicant");
        break;
      case "output_audio_buffer.started":
        setSpeaking("officer");
        break;
      case "output_audio_buffer.stopped":
      case "input_audio_buffer.speech_stopped":
        setSpeaking(null);
        break;
      case "response.done": {
        const usage = (event.response as { usage?: Record<string, any> } | undefined)?.usage;
        if (usage) {
          const inD = usage.input_token_details ?? {};
          const cached = inD.cached_tokens_details ?? {};
          const outD = usage.output_token_details ?? {};
          const u = usageRef.current;
          u.audio_cached += cached.audio_tokens ?? 0;
          u.text_cached += cached.text_tokens ?? 0;
          u.audio_in += Math.max(0, (inD.audio_tokens ?? 0) - (cached.audio_tokens ?? 0));
          u.text_in += Math.max(0, (inD.text_tokens ?? 0) - (cached.text_tokens ?? 0));
          u.audio_out += outD.audio_tokens ?? 0;
          u.text_out += outD.text_tokens ?? 0;
        }
        break;
      }
      // gpt-live-1
      case "session.input_transcript.delta":
        setSpeaking("applicant");
        addText("applicant", String(event.delta ?? ""), true);
        break;
      case "session.output_transcript.delta":
        setSpeaking("officer");
        addText("officer", String(event.delta ?? ""), true);
        break;
      case "session.closed":
        void finish();
        break;
    }
  };

  const teardown = () => {
    micRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    setSpeaking(null);
  };

  const finish = useCallback(async () => {
    const id = sessionRef.current;
    if (!id || endingRef.current) return;
    endingRef.current = true;
    teardown();
    setPhase("ending");
    const res = await fetch("/api/voice/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, transcript: transcriptRef.current.slice(0, 300), usage: usageRef.current }),
    }).catch(() => null);
    const data = res?.ok ? await res.json() : null;
    setEvaluation(data?.evaluation ?? null);
    setEvalNote(
      data?.evaluation
        ? null
        : data?.evaluationSkipped === "too_short"
          ? l("Baholash uchun suhbat juda qisqa bo'ldi.")
          : l("Baholashni hozir tayyorlab bo'lmadi.")
    );
    sessionRef.current = null;
    setPhase("result");
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStatus]);

  // Server check-in every 10 s; display countdown every second
  useEffect(() => {
    if (phase !== "live") return;
    const tick = setInterval(() => {
      const s = (endsAtRef.current - Date.now()) / 1000;
      setLeft(s);
      if (s <= 0) void finish();
    }, 1000);
    const beat = setInterval(async () => {
      const id = sessionRef.current;
      if (!id) return;
      const res = await fetch("/api/voice/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      }).catch(() => null);
      const data = res?.ok ? await res.json() : null;
      if (!data || data.ended) void finish();
      else endsAtRef.current = Date.now() + data.remainingSeconds * 1000;
    }, 10_000);
    // Leaving or reloading the page ends the session at once
    const onHide = () => {
      const id = sessionRef.current;
      if (id) navigator.sendBeacon("/api/voice/end", JSON.stringify({ sessionId: id, transcript: [], usage: usageRef.current }));
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      clearInterval(tick);
      clearInterval(beat);
      window.removeEventListener("pagehide", onHide);
    };
  }, [phase, finish]);

  // Leaving the page from inside the app
  useEffect(() => () => teardown(), []);

  const start = async () => {
    setError(null);
    setEvaluation(null);
    setEvalNote(null);
    transcriptRef.current = [];
    usageRef.current = emptyUsage();
    endingRef.current = false;
    setPhase("connecting");
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      micRef.current = mic;
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const audio = audioRef.current ?? new Audio();
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0] ?? null;
      };
      mic.getAudioTracks().forEach((t) => pc.addTrack(t, mic));
      const channel = pc.createDataChannel("oai-events");
      channel.onmessage = (e) => {
        try {
          onEvent(JSON.parse(e.data));
        } catch {
          /* not JSON */
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") void finish();
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const res = await fetch("/api/voice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: offer.sdp, country, visaKind, language: lang, level }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Ovozli xizmatga ulanib bo'lmadi. Birozdan keyin qayta urinib ko'ring.");
      sessionRef.current = data.sessionId;
      endsAtRef.current = Date.now() + data.remainingSeconds * 1000;
      setLeft(data.remainingSeconds);
      await pc.setRemoteDescription({ type: "answer", sdp: data.answerSdp });
      setPhase("live");
    } catch (e) {
      teardown();
      const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError");
      setError(denied ? l("Mikrofonga ruxsat berilmadi. Brauzer sozlamalarida mikrofonni yoqing.") : l(e instanceof Error ? e.message : "Xatolik yuz berdi."));
      // A session that was opened on the server is closed again
      if (sessionRef.current) {
        await fetch("/api/voice/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current, transcript: [], usage: null }),
        }).catch(() => null);
        sessionRef.current = null;
      }
      setPhase("idle");
      void loadStatus();
    }
  };

  const endOther = async (id: string) => {
    await fetch("/api/voice/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, transcript: [], usage: null }),
    }).catch(() => null);
    void loadStatus();
  };

  // Production without keys, or before the status loads: nothing to show
  if (!status || !status.configured) return null;

  const pill = (active: boolean) =>
    cn(
      "min-h-[44px] rounded-pill border px-4 py-2 text-body-sm font-semibold transition-colors",
      active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-border bg-surface text-ink-700 hover:bg-surface-tint"
    );

  const header = (
    <div className="flex items-start gap-4">
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-surface shadow-float">
        <Mic size={22} strokeWidth={1.8} className="text-brand-700" />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-display text-body-lg font-bold text-ink-950">
          {l("Jonli ovozli suhbat")}
          <span className="rounded-pill bg-brand-50 px-2.5 py-0.5 text-caption font-semibold text-brand-700 ring-1 ring-brand-100">{l("Beta")}</span>
        </p>
        <p className="text-body-sm text-ink-600">{l("AI elchixona xodimi rolida siz bilan ovozda gaplashadi. Haftasiga 15 daqiqa, bepul.")}</p>
      </div>
    </div>
  );

  if (!status.beta || !status.enabled) {
    return (
      <div className="card mx-auto mb-6 max-w-2xl rounded-[28px] p-6 sm:p-8">
        {header}
        <p className="mt-4 rounded-2xl bg-surface-tint px-4 py-3 text-body-sm text-ink-700">
          {status.beta
            ? l("Ovozli suhbat vaqtincha to'xtatilgan.")
            : l("Ovozli suhbat yopiq beta sinovida — faqat taklif qilingan 25 foydalanuvchi uchun.")}
        </p>
      </div>
    );
  }

  const remaining = phase === "live" ? left : status.remainingSeconds;
  const used = status.weeklySeconds - status.remainingSeconds;
  const countryName = (code: string) => PLAYBOOK_COUNTRIES.find((c) => c.code === code)?.name[lang] ?? code;

  return (
    <div className="card mx-auto mb-6 max-w-2xl space-y-5 rounded-[28px] p-6 sm:p-8">
      {header}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-tint px-4 py-3">
        <span className="text-body-sm text-ink-700">{l("Bu hafta qolgan vaqt")}</span>
        <span className="font-display text-[1.6rem] font-bold tabular-nums text-ink-950" aria-live="polite">
          {mmss(remaining)}
        </span>
        <span className="w-full text-caption text-ink-500">
          {l("{used} ishlatildi · dushanba 00:00 da (Toshkent) 15:00 ga yangilanadi, qolgani o'tmaydi", { used: mmss(used) })}
        </span>
      </div>

      {phase === "idle" && (
        <>
          {status.active && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-800 dark:border-amber-400/20 dark:bg-amber-400/10">
              <span>{l("Boshqa oynada ochiq suhbat bor.")}</span>
              <Button size="sm" variant="secondary" onClick={() => endOther(status.active!.id)}>
                {l("Uni tugatish")}
              </Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-body-sm font-medium text-ink-700">
              {l("Davlat")}
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="input mt-1.5 min-h-[44px] w-full">
                {PLAYBOOK_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name[lang]} — {c.visa}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-body-sm font-medium text-ink-700">
              {l("Viza turi")}
              <select value={visaKind} onChange={(e) => setVisaKind(e.target.value as VisaKind)} className="input mt-1.5 min-h-[44px] w-full">
                {VISA_KINDS.map((v) => (
                  <option key={v.key} value={v.key}>
                    {l(v.label)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <p className="mb-2 text-body-sm font-medium text-ink-700">{l("Suhbat tili")}</p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((x) => (
                <button key={x.key} type="button" onClick={() => setLang(x.key)} className={pill(lang === x.key)} aria-pressed={lang === x.key}>
                  {x.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-body-sm font-medium text-ink-700">{l("Daraja")}</p>
            <div className="flex flex-wrap gap-2">
              {PLAYBOOK_LEVELS.map((x) => (
                <button key={x.key} type="button" onClick={() => setLevel(x.key)} className={pill(level === x.key)} aria-pressed={level === x.key}>
                  {l(x.label)}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-body-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <Button className="w-full sm:w-auto" onClick={start} disabled={status.remainingSeconds < 30 || Boolean(status.active)}>
            <Mic size={18} /> {l("Ovozli suhbatni boshlash")}
          </Button>
          {status.remainingSeconds < 30 && (
            <p className="text-body-sm text-ink-600">{l("Bu haftalik 15 daqiqangiz tugadi. Dushanba 00:00 da (Toshkent) yangilanadi.")}</p>
          )}
          <p className="text-caption text-ink-500">
            {l("Mikrofon ruxsati so'raladi. Ovoz yozib olinmaydi. Pasport raqami, JShShIR yoki bank ma'lumotlarini aytmang.")}
          </p>
        </>
      )}

      {phase === "connecting" && (
        <p className="flex items-center gap-2 text-body-sm text-ink-700" aria-live="polite">
          <Loader2 size={18} className="animate-spin" /> {l("Ulanmoqda… mikrofonga ruxsat bering.")}
        </p>
      )}

      {phase === "live" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-4 dark:border-white/10 dark:bg-white/5" aria-live="polite">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-600" />
            </span>
            <span className="text-body-sm font-semibold text-ink-900">
              {speaking === "officer" ? l("Elchixona xodimi gapiryapti…") : speaking === "applicant" ? l("Sizni tinglayapti…") : l("Suhbat davom etmoqda")}
            </span>
          </div>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => void finish()}>
            <PhoneOff size={18} /> {l("Suhbatni tugatish")}
          </Button>
        </div>
      )}

      {phase === "ending" && (
        <p className="flex items-center gap-2 text-body-sm text-ink-700" aria-live="polite">
          <Loader2 size={18} className="animate-spin" /> {l("Suhbat tugatildi. Baholash tayyorlanmoqda…")}
        </p>
      )}

      {phase === "result" && (
        <div className="space-y-4">
          {evaluation ? (
            <div className="space-y-4 rounded-2xl border border-surface-border bg-surface p-5">
              <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-950">
                <Sparkles size={16} className="text-brand-700" /> {l("Suhbat bahosi")}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Umumiy tayyorgarlik", value: evaluation.overall },
                  { label: "Javoblar aniqligi", value: evaluation.accuracy },
                  { label: "Mantiqiy izchillik", value: evaluation.coherence },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-surface-tint px-2 py-3">
                    <p className="font-display text-[1.5rem] font-bold tabular-nums text-ink-950">{s.value}</p>
                    <p className="text-caption text-ink-600">{l(s.label)}</p>
                  </div>
                ))}
              </div>
              {evaluation.summary && <p className="text-body-sm text-ink-700">{evaluation.summary}</p>}
              {[
                { title: "Yaxshi tomonlar", items: evaluation.strengths },
                { title: "Yaxshilash kerak", items: evaluation.improvements },
                { title: "Keyingi mashq uchun", items: evaluation.next_steps },
              ]
                .filter((g) => g.items.length)
                .map((g) => (
                  <div key={g.title}>
                    <p className="mb-1.5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l(g.title)}</p>
                    <ul className="list-disc space-y-1 pl-5 text-body-sm text-ink-700">
                      {g.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ) : (
            evalNote && <p className="rounded-2xl bg-surface-tint px-4 py-3 text-body-sm text-ink-700">{evalNote}</p>
          )}
          <Button variant="secondary" onClick={() => setPhase("idle")}>
            {l("Yangi suhbat")}
          </Button>
        </div>
      )}

      <p className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-caption text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        {l("Bu mashq — rasmiy elchixona intervyusi emas va viza berilishini kafolatlamaydi.")}
      </p>

      {status.history.length > 0 && (
        <div>
          <p className="mb-2 text-body-sm font-semibold text-ink-950">{l("Foydalanish tarixi")}</p>
          <ul className="space-y-1.5">
            {status.history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl bg-surface-tint px-4 py-2.5 text-body-sm">
                <span className="min-w-0 text-ink-700">
                  {formatDate(h.startedAt)} · {countryName(h.destination)}
                </span>
                <span className="flex shrink-0 items-center gap-3 tabular-nums">
                  <span className="text-ink-600">{mmss(h.seconds)}</span>
                  {h.overall !== null && <span className="font-semibold text-ink-950">{h.overall}/100</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <audio ref={audioRef} autoPlay className="hidden" />
    </div>
  );
}
