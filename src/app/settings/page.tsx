"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Moon, Sun, PlayCircle, LogOut, ShieldAlert, Loader2, KeyRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Modal } from "@/components/modals/Modal";
import { TextField } from "@/components/forms/TextField";
import { InlineAlert } from "@/components/states/InlineAlert";
import { useTheme } from "@/lib/theme-context";
import { logoutAction, updatePasswordAction } from "@/lib/actions/auth";
import { deleteMyAccountAction } from "@/lib/actions/account";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useL } from "@/components/i18n/L";

const sectionTitle = "flex items-center gap-2 text-body-sm font-semibold text-ink-950";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const l = useL();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordResult, setPasswordResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [fromReset, setFromReset] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);

  // Arriving from a password-reset email (?reset=1): open on the new-password form
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reset") !== "1") return;
    setFromReset(true);
    document.getElementById("password")?.scrollIntoView({ block: "center" });
    passwordInput.current?.focus();
  }, []);

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordResult(null);
    setSavingPassword(true);
    const form = new FormData();
    form.set("password", password);
    form.set("confirmPassword", confirmPassword);
    const result = await updatePasswordAction(form);
    setSavingPassword(false);
    if (result.ok) {
      setPassword("");
      setConfirmPassword("");
      setFromReset(false);
      setPasswordResult({ ok: true, text: l("Yangi parol saqlandi. Keyingi safar shu parol bilan kiring.") });
    } else {
      setPasswordResult({ ok: false, text: result.error ?? l("Parolni saqlab bo'lmadi.") });
    }
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    // On success the action redirects to the home page, so only a failure returns here.
    const result = await deleteMyAccountAction(confirmEmail);
    setDeleting(false);
    setDeleteError(result.error);
  }

  function reopenOnboarding() {
    window.localStorage.removeItem("vizar-ai-onboarding-done");
    router.push("/dashboard");
  }

  return (
    <DashboardShell title="Sozlamalar" subtitle="Hisobingiz sozlamalarini boshqaring.">
      <div className="space-y-6">
        <div className="card flex items-center justify-between gap-4 rounded-[24px] p-6">
          <div className="min-w-0">
            <p className={sectionTitle}>
              {l("Til")}
            </p>
            <p className="mt-0.5 text-caption text-ink-500">{l("Interfeys tili: o'zbek, rus yoki ingliz.")}</p>
          </div>
          <LanguageSelector variant="pill" />
        </div>

        <div className="card flex items-center justify-between gap-4 rounded-[24px] p-6">
          <div>
            <p className={sectionTitle}>
              {l("Tanishtiruv (onboarding)")}
            </p>
            <p className="text-caption text-ink-500">{l("Birinchi marta ko'rsatilgan tanishtiruv oynasini qayta oching.")}</p>
          </div>
          <button
            type="button"
            onClick={reopenOnboarding}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            <PlayCircle size={15} /> {l("Qayta ko'rish")}
          </button>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={`mb-1 ${sectionTitle}`}>
            {l("Ko'rinish")}
          </p>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-body-sm font-medium text-ink-900 dark:text-white">
                {l("Tungi rejim")}
              </p>
              <p className="text-caption text-ink-500">{l("Interfeys ko'rinishini almashtiring.")}</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-pill border border-surface-border px-3.5 py-2 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
              {theme === "light" ? l("Tungi rejim") : l("Kunduzgi rejim")}
            </button>
          </div>
        </div>

        <div id="password" className="card scroll-mt-28 rounded-[24px] p-6">
          <p className={`mb-1 ${sectionTitle}`}>
            <KeyRound size={16} className="text-brand-600" /> {l("Yangi parol o'rnatish")}
          </p>
          <p className="mb-4 text-body-sm text-ink-600">
            {l("Parolingizni almashtiring. Google orqali kirgan bo'lsangiz, bu yerda parol qo'shib, email bilan ham kira olasiz.")}
          </p>
          {fromReset && (
            <div className="mb-4">
              <InlineAlert variant="info">{l("Tiklash havolasi qabul qilindi. Endi yangi parolingizni kiriting.")}</InlineAlert>
            </div>
          )}
          <form onSubmit={handlePassword} noValidate className="grid gap-4 sm:grid-cols-2">
            <TextField
              ref={passwordInput}
              id="new-password"
              label={l("Yangi parol")}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!configured || savingPassword}
            />
            <TextField
              id="confirm-new-password"
              label={l("Yangi parolni takrorlang")}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!configured || savingPassword}
            />
            {passwordResult && (
              <div className="sm:col-span-2" role={passwordResult.ok ? "status" : "alert"}>
                <InlineAlert variant={passwordResult.ok ? "success" : "danger"}>{passwordResult.text}</InlineAlert>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={!configured || savingPassword || !password}
                className="btn-primary btn-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} {l("Parolni saqlash")}
              </button>
              <a href="/forgot-password" className="text-body-sm font-medium text-ink-600 underline-offset-4 hover:text-ink-900 hover:underline">
                {l("Parolni tiklash havolasini olish")}
              </a>
            </div>
          </form>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={`mb-3 ${sectionTitle}`}>
            {l("Hisobdan chiqish")}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
            >
              <LogOut size={15} /> {l("Chiqish")}
            </button>
          </form>
        </div>

        <div className="card rounded-[24px] border-red-200 p-6 dark:border-red-400/20">
          <p className="mb-1 flex items-center gap-2 text-body-sm font-semibold text-red-600 dark:text-red-300">
            {l("Xavfli hudud")}
          </p>
          <p className="mb-3 text-caption text-ink-500">{l("Hisobni o'chirish qaytarib bo'lmaydigan amal.")}</p>
          <div className="mb-4">
            <InlineAlert variant="warning">
              <span className="flex items-start gap-1.5">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                {l("Hisob o'chirilganda arizalar, hujjatlar, tahlillar, tavsiyalar va so'rovlaringiz butunlay o'chadi. Buni qaytarib bo'lmaydi.")}
              </span>
            </InlineAlert>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmEmail("");
              setDeleteError("");
              setDeleteOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-pill border border-red-300 px-4 py-2 text-body-sm font-semibold text-red-600 dark:text-red-300 transition-colors hover:bg-red-50 dark:border-red-400/30 dark:hover:bg-red-400/10"
          >
            <Trash2 size={15} /> {l("Hisobni o'chirish")}
          </button>
        </div>

        {!configured && (
          <InlineAlert variant="info">
            {l("Supabase sozlanmagan — chiqish va parolni tiklash havolalari hozircha ishlamaydi.")}
          </InlineAlert>
        )}
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={l("Hisobni o'chirish")}>
        <form onSubmit={handleDelete} className="space-y-4">
          <p className="text-body-sm text-ink-700">
            {l("Hisob o'chirilganda arizalar, hujjatlar, tahlillar, tavsiyalar va so'rovlaringiz butunlay o'chadi. Buni qaytarib bo'lmaydi.")}
          </p>
          <TextField
            id="confirmEmail"
            type="email"
            label="Tasdiqlash uchun hisobingiz emailini yozing"
            value={confirmEmail}
            autoComplete="off"
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
          {deleteError && <p role="alert" className="text-body-sm font-medium text-red-600 dark:text-red-300">{l(deleteError)}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
            >
              {l("Bekor qilish")}
            </button>
            <button
              type="submit"
              disabled={deleting || !confirmEmail.includes("@")}
              className="inline-flex items-center gap-2 rounded-pill bg-red-600 px-4 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {l("Hisobni butunlay o'chirish")}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
