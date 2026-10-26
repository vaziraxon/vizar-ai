"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { BulkUploader } from "@/components/dashboard/BulkUploader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDateLocale, useL } from "@/components/i18n/L";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { logoutAction } from "@/lib/actions/auth";
import { deleteDocumentAction, getSignedDocumentUrlAction } from "@/lib/actions/documents";
import { DOCUMENTS } from "@/data/mockData";
import { cn } from "@/lib/utils";

export interface TestBenchProps {
  configured: boolean;
  user: { email: string; provider: string } | null;
  application: { id: string; destination: string; visaType: string } | null;
  documents: { id: string; type: string; filename: string; status: string; storagePath: string | null; createdAt: string }[];
}

type Check = "pending" | "ok" | "off" | "fail";
const DOC_TYPES = DOCUMENTS.map((d) => d.title);
const DOC_STATUS: Record<string, string> = {
  verified: "Tasdiqlandi",
  issue_found: "Kamchilik bor",
  expired: "Yangilash kerak",
  analyzing: "AI tahlil qilmoqda",
  uploaded: "Yangi",
};

function CheckCard({ emoji, title, state, detail }: { emoji: string; title: string; state: Check; detail: string }) {
  const tone = {
    pending: "bg-surface-tint text-ink-500",
    ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    off: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
    fail: "bg-red-500/10 text-red-600 dark:text-red-300",
  }[state];
  const mark = { pending: "…", ok: "✅", off: "⏸️", fail: "❌" }[state];
  return (
    <div className="card spotlight rounded-[22px] p-5">
      <div className="flex items-center justify-between gap-3">
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 text-[22px] ring-1 ring-brand-100">
          {emoji}
        </span>
        <span className={cn("rounded-pill px-2.5 py-1 text-caption font-semibold", tone)}>
          {state === "pending" ? <Loader2 size={13} className="animate-spin" /> : mark}
        </span>
      </div>
      <p className="mt-4 text-body-sm font-semibold text-ink-950">{title}</p>
      <p className="mt-0.5 text-caption text-ink-500">{detail}</p>
    </div>
  );
}

export function TestBench({ configured, user, application, documents }: TestBenchProps) {
  const l = useL();
  const locale = useDateLocale();
  const router = useRouter();
  const [server, setServer] = useState<{ state: Check; ms?: number }>({ state: configured ? "pending" : "fail" });
  const [providers, setProviders] = useState<{ email: Check; google: Check }>({ email: "pending", google: "pending" });
  const [tab, setTab] = useState<"sandbox" | "real">(user && application ? "real" : "sandbox");
  const [sandboxFiles, setSandboxFiles] = useState<{ key: string; name: string; type: string; size: number; url: string; isImage: boolean }[]>([]);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);

  // Connection + providers — the same public settings endpoint the Google button reads
  useEffect(() => {
    const env = getSupabaseEnv();
    if (!configured || !env) {
      setProviders({ email: "fail", google: "fail" });
      return;
    }
    const t0 = performance.now();
    fetch(`${env.url}/auth/v1/settings`, { headers: { apikey: env.anonKey } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s: { external?: Record<string, boolean> }) => {
        setServer({ state: "ok", ms: Math.round(performance.now() - t0) });
        setProviders({ email: s.external?.email ? "ok" : "off", google: s.external?.google ? "ok" : "off" });
      })
      .catch(() => {
        setServer({ state: "fail" });
        setProviders({ email: "fail", google: "fail" });
      });
  }, [configured]);

  // Free sandbox preview URLs when leaving the page (single files are freed on delete)
  const urlsRef = useRef<string[]>([]);
  urlsRef.current = sandboxFiles.map((f) => f.url);
  useEffect(() => () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  async function openDoc(path: string | null) {
    if (!path) return;
    const r = await getSignedDocumentUrlAction(path);
    if (r.ok) window.open(r.data, "_blank", "noopener,noreferrer");
  }

  async function removeDoc(id: string) {
    setBusyDoc(id);
    await deleteDocumentAction(id);
    setBusyDoc(null);
    router.refresh();
  }

  const steps = [
    "Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID → Web application.",
    "Authorized redirect URI: {url}/auth/v1/callback",
    "Supabase → Authentication → Providers → Google: yoqing, Client ID va Client Secret'ni kiriting.",
    "Supabase → Authentication → URL Configuration → Redirect URLs: http://localhost:3000/auth/callback va https://vizarai.com/auth/callback",
  ];

  return (
    <div className="hero-sky grain relative min-h-screen dark:bg-navy-950">
      <header className="relative flex items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <Link href="/" aria-label="VIZAR AI" className="rounded-lg">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="pill" />
          <LanguageSelector variant="pill" />
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-4 sm:px-6">
        {/* Title */}
        <div className="text-center">
          <span aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-surface text-[40px] shadow-float">
            🧪
          </span>
          <p className="mt-5 text-body-sm font-semibold text-brand-700">{l("Faqat test uchun")}</p>
          <h1 className="mt-2 font-display text-display-xl font-extrabold tracking-[-0.04em] text-ink-950">{l("Sinov sahifasi")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-ink-600">
            {l("Ulanish, kirish (email va Google) va fayl yuklashni shu yerda tekshiring.")}
          </p>
        </div>

        {/* 1. Status */}
        <section aria-labelledby="t-status" className="mt-12">
          <h2 id="t-status" className="mb-4 flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true">1️⃣</span> {l("Ulanish holati")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CheckCard
              emoji="🔌"
              title={l("Supabase sozlamalari")}
              state={configured ? "ok" : "fail"}
              detail={configured ? l(".env.local topildi") : l(".env.local da kalitlar yo'q")}
            />
            <CheckCard
              emoji="📡"
              title={l("Server javobi")}
              state={server.state}
              detail={server.state === "ok" ? l("{ms} ms ichida javob berdi", { ms: server.ms ?? 0 }) : server.state === "fail" ? l("Javob olinmadi") : l("Tekshirilmoqda...")}
            />
            <CheckCard
              emoji="✉️"
              title={l("Email bilan kirish")}
              state={providers.email}
              detail={providers.email === "ok" ? l("Yoqilgan") : providers.email === "off" ? l("O'chirilgan") : providers.email === "fail" ? l("Tekshirib bo'lmadi") : l("Tekshirilmoqda...")}
            />
            <CheckCard
              emoji="🟢"
              title={l("Google bilan kirish")}
              state={providers.google}
              detail={providers.google === "ok" ? l("Yoqilgan") : providers.google === "off" ? l("Supabase'da hali yoqilmagan") : providers.google === "fail" ? l("Tekshirib bo'lmadi") : l("Tekshirilmoqda...")}
            />
          </div>
        </section>

        {/* 2. Sign-in */}
        <section aria-labelledby="t-auth" className="mt-10">
          <h2 id="t-auth" className="mb-4 flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true">2️⃣</span> {l("Kirishni sinash")}
          </h2>
          <div className="card grid grid-cols-1 gap-6 rounded-[28px] p-6 sm:p-7 lg:grid-cols-2">
            <div>
              {user ? (
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-brand-500 to-violet-600 text-[24px] shadow-button">
                    👤
                  </span>
                  <div className="min-w-0">
                    <p className="text-caption font-semibold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-300">
                      ✅ {l("Siz tizimdasiz")}
                    </p>
                    <p className="mt-1 truncate text-body font-semibold text-ink-950">{user.email}</p>
                    <p className="text-caption text-ink-500">
                      {l("Kirish usuli:")} {user.provider === "google" ? "Google" : "Email"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/dashboard" className="btn-primary btn-md">
                        {l("Dashboardga o'tish")}
                      </Link>
                      <form action={logoutAction}>
                        <button type="submit" className="btn-secondary btn-md">
                          <LogOut size={15} /> {l("Chiqish")}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">👋 {l("Siz hali kirmagansiz")}</p>
                  <p className="mt-1 text-body-sm text-ink-600">{l("Kirgandan keyin shu sahifaga qaytasiz.")}</p>
                  <div className="mt-4 space-y-3">
                    <GoogleButton next="/sinov" configured={configured} />
                    <Link href="/login?next=/sinov" className="btn-secondary btn-lg w-full">
                      ✉️ {l("Email bilan kirish")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 rounded-[22px] bg-surface-tint p-5">
              {providers.google === "ok" ? (
                <>
                  <p className="font-semibold text-ink-950">✅ {l("Google yoqilgan")}</p>
                  <p className="mt-1 text-body-sm text-ink-600">
                    {l("“Google bilan davom etish” tugmasini bosing — hisob tanlab, shu sahifaga qaytasiz.")}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-ink-950">⚙️ {l("Google'ni yoqish (5 daqiqa)")}</p>
                  <ol className="mt-3 space-y-2">
                    {steps.map((s, i) => (
                      <li key={s} className="flex gap-2.5 text-body-sm text-ink-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-caption font-bold text-brand-700 shadow-xs">
                          {i + 1}
                        </span>
                        <span className="min-w-0 [overflow-wrap:anywhere]">
                          {l(s, { url: getSupabaseEnv()?.url ?? "https://<project>.supabase.co" })}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-caption text-ink-500">{l("Yoqilgach, sahifani yangilang — tugma o'zi faollashadi.")}</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 3. Upload */}
        <section aria-labelledby="t-upload" className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="t-upload" className="flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
              <span aria-hidden="true">3️⃣</span> {l("Fayl yuklashni sinash")}
            </h2>
            <div role="tablist" className="flex rounded-pill border border-surface-border bg-surface p-1">
              {(
                [
                  ["sandbox", "🧪", "Sandbox (serversiz)"],
                  ["real", "☁️", "Haqiqiy yuklash"],
                ] as const
              ).map(([id, emoji, label]) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
                    tab === id ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-button" : "text-ink-600 hover:text-ink-900"
                  )}
                >
                  {emoji} {l(label)}
                </button>
              ))}
            </div>
          </div>

          {tab === "sandbox" ? (
            <>
              <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10">
                🧪 {l("Sandbox: fayllar hech qayerga yuborilmaydi — faqat shu brauzerda ko'rsatiladi. Kirish shart emas.")}
              </p>
              <BulkUploader
                sandbox
                documentTypes={DOC_TYPES}
                onSandboxUpload={(file, type) =>
                  setSandboxFiles((prev) => [
                    ...prev,
                    {
                      key: `${Date.now()}-${file.name}`,
                      name: file.name,
                      type,
                      size: file.size,
                      url: URL.createObjectURL(file),
                      isImage: file.type.startsWith("image/"),
                    },
                  ])
                }
              />
              {sandboxFiles.length > 0 && (
                <div className="card rounded-[24px] p-5">
                  <p className="mb-3 text-body-sm font-semibold text-ink-950">📁 {l("Brauzerda yuklangan fayllar")}</p>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sandboxFiles.map((f) => (
                      <li key={f.key} className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
                        <div className="flex h-28 items-center justify-center bg-surface-tint">
                          {f.isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                          ) : (
                            <FileText size={34} className="text-brand-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-body-sm font-semibold text-ink-900">{f.name}</p>
                            <p className="text-caption text-ink-500">{l(f.type)}</p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={l("Faylni ko'rish")}
                              className="flex h-8 w-8 items-center justify-center rounded-pill text-brand-600 hover:bg-brand-50"
                            >
                              <ExternalLink size={15} />
                            </a>
                            <button
                              type="button"
                              aria-label={l("O'chirish")}
                              onClick={() => {
                                URL.revokeObjectURL(f.url);
                                setSandboxFiles((prev) => prev.filter((x) => x.key !== f.key));
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-pill text-ink-400 hover:bg-red-500/10 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : !user ? (
            <div className="card flex flex-col items-center gap-3 rounded-[28px] p-10 text-center">
              <span aria-hidden="true" className="text-[36px]">🔐</span>
              <p className="font-semibold text-ink-950">{l("Haqiqiy yuklash uchun avval tizimga kiring")}</p>
              <p className="max-w-md text-body-sm text-ink-600">{l("Fayllar sizning shaxsiy papkangizga yuklanadi — faqat siz ko'ra olasiz.")}</p>
              <Link href="/login?next=/sinov" className="btn-primary btn-md mt-2">
                {l("Kirish")}
              </Link>
            </div>
          ) : !application ? (
            <div className="card flex flex-col items-center gap-3 rounded-[28px] p-10 text-center">
              <span aria-hidden="true" className="text-[36px]">🧭</span>
              <p className="font-semibold text-ink-950">{l("Avval viza tahlilini boshlang")}</p>
              <p className="max-w-md text-body-sm text-ink-600">{l("Hujjat yuklash uchun avval kamida bitta viza arizasi kerak.")}</p>
              <Link href="/assessment" className="btn-primary btn-md mt-2">
                {l("Yangi tahlilni boshlash")}
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-body-sm text-ink-700">
                ☁️ {l("Fayllar shu arizaga yuklanadi:")} <strong>{l(application.destination)} · {l(application.visaType)}</strong>.{" "}
                {l("Sinovdan keyin keraksiz fayllarni o'chirib qo'ying.")}
              </p>
              <BulkUploader applicationId={application.id} documentTypes={DOC_TYPES} />
              <div className="card rounded-[24px] p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-body-sm font-semibold text-ink-950">
                    📁 {l("Supabase'dagi fayllar")} <span className="text-ink-400">({documents.length})</span>
                  </p>
                  <button type="button" onClick={() => router.refresh()} className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand-700 hover:text-brand-600">
                    <RefreshCw size={13} /> {l("Yangilash")}
                  </button>
                </div>
                {documents.length === 0 ? (
                  <p className="text-body-sm text-ink-500">{l("Hali fayl yuklanmagan.")}</p>
                ) : (
                  <ul className="divide-y divide-surface-border">
                    {documents.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                        <FileText size={18} className="shrink-0 text-brand-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm font-semibold text-ink-900">{d.filename}</p>
                          <p className="text-caption text-ink-500">
                            {l(d.type)} · {new Date(d.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        <StatusBadge status={DOC_STATUS[d.status] ?? d.status} />
                        <button
                          type="button"
                          onClick={() => openDoc(d.storagePath)}
                          aria-label={l("Faylni ko'rish")}
                          className="flex h-8 w-8 items-center justify-center rounded-pill text-brand-600 hover:bg-brand-50"
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDoc(d.id)}
                          disabled={busyDoc === d.id}
                          aria-label={l("Faylni o'chirish")}
                          className="flex h-8 w-8 items-center justify-center rounded-pill text-ink-400 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                        >
                          {busyDoc === d.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-ink-600 hover:text-ink-900">
            <ArrowLeft size={15} /> {l("Bosh sahifaga qaytish")}
          </Link>
        </div>
      </main>
    </div>
  );
}
