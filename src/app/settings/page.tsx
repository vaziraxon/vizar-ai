"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Moon, Sun, PlayCircle, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Modal } from "@/components/modals/Modal";
import { TextField } from "@/components/forms/TextField";
import { InlineAlert } from "@/components/states/InlineAlert";
import { useTheme } from "@/lib/theme-context";
import { logoutAction } from "@/lib/actions/auth";
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
        <div className="card flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-6">
          <div>
            <p className={sectionTitle}>
              <span aria-hidden="true">🌐</span> {l("Til")}
            </p>
            <p className="mt-0.5 text-caption text-ink-400">{l("Interfeys tili: o'zbek, rus yoki ingliz.")}</p>
          </div>
          <LanguageSelector variant="pill" />
        </div>

        <div className="card flex items-center justify-between gap-4 rounded-[24px] p-6">
          <div>
            <p className={sectionTitle}>
              <span aria-hidden="true">🎬</span> {l("Tanishtiruv (onboarding)")}
            </p>
            <p className="text-caption text-ink-400">{l("Birinchi marta ko'rsatilgan tanishtiruv oynasini qayta oching.")}</p>
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
            <span aria-hidden="true">🎨</span> {l("Ko'rinish")}
          </p>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-body-sm font-medium text-ink-900 dark:text-white">
                {l("Tungi rejim")}
              </p>
              <p className="text-caption text-ink-400">{l("Interfeys ko'rinishini almashtiring.")}</p>
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

        <div className="card rounded-[24px] p-6">
          <p className={`mb-3 ${sectionTitle}`}>
            <span aria-hidden="true">🔑</span> {l("Parolni o'zgartirish")}
          </p>
          <p className="mb-4 text-body-sm text-ink-600">
            {l("Xavfsizlik uchun parolni o'zgartirish email orqali tasdiqlash havolasi bilan amalga oshiriladi.")}
          </p>
          <a
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            {l("Parolni tiklash havolasini olish")}
          </a>
        </div>

        <div className="card rounded-[24px] p-6">
          <p className={`mb-3 ${sectionTitle}`}>
            <span aria-hidden="true">🚪</span> {l("Hisobdan chiqish")}
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
            <span aria-hidden="true">⚠️</span> {l("Xavfli hudud")}
          </p>
          <p className="mb-3 text-caption text-ink-400">{l("Hisobni o'chirish qaytarib bo'lmaydigan amal.")}</p>
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
            className="inline-flex items-center gap-2 rounded-pill border border-red-300 px-4 py-2 text-body-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-400/30 dark:hover:bg-red-400/10"
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
          {deleteError && <p role="alert" className="text-body-sm font-medium text-red-600">{l(deleteError)}</p>}
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
