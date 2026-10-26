"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Moon, Sun, PlayCircle, LogOut, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ConfirmationModal } from "@/components/states/ConfirmationModal";
import { SuccessToast } from "@/components/states/SuccessToast";
import { InlineAlert } from "@/components/states/InlineAlert";
import { useTheme } from "@/lib/theme-context";
import { logoutAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useL } from "@/components/i18n/L";

const sectionTitle = "flex items-center gap-2 text-body-sm font-semibold text-ink-950";

function ToggleRow({
  label,
  description,
  defaultChecked = true,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const l = useL();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-body-sm font-medium text-ink-900 dark:text-white">
          {l(label)}
        </p>
        <p className="text-caption text-ink-400 dark:text-white/40">
          {l(description)}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${
          checked ? "bg-gradient-to-r from-brand-600 to-violet-600" : "bg-surface-muted dark:bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const l = useL();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteToast, setDeleteToast] = useState(false);
  const router = useRouter();
  const configured = isSupabaseConfigured();

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

        <div className="card divide-y divide-surface-border rounded-[24px] p-6">
          <p className={`pb-1 ${sectionTitle}`}>
            <span aria-hidden="true">🔔</span> {l("Bildirishnomalar")}
          </p>
          <ToggleRow
            label="Email orqali bildirishnomalar"
            description="Ariza holati va yangiliklar haqida email oling."
          />
          <ToggleRow
            label="Konsultatsiya eslatmalari"
            description="Rejalashtirilgan konsultatsiyalar haqida eslatma."
          />
        </div>

        <div className="card divide-y divide-surface-border rounded-[24px] p-6">
          <p className={`pb-1 ${sectionTitle}`}>
            <span aria-hidden="true">🔒</span> {l("Maxfiylik")}
          </p>
          <ToggleRow
            label="Ma'lumotlarni tahlil uchun ishlatish"
            description="Platforma sifatini oshirish uchun anonim statistikaga ruxsat bering."
            defaultChecked={false}
          />
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
                {l("Xavfsizlik sababli, hisobni o'chirish brauzerdan to'g'ridan-to'g'ri amalga oshirilmaydi — bu amal maxsus sozlangan server tomonidagi (admin) funksiya orqali bajarilishi kerak. Hozircha bu tugma faqat namunaviy xabar ko'rsatadi.")}
              </span>
            </InlineAlert>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
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

      <ConfirmationModal
        open={deleteOpen}
        title="Hisobni o'chirish (demo)"
        description="Bu — demo rejim. Haqiqiy hisobingiz o'chirilmaydi. Real o'chirish faqat server tomonidagi maxsus funksiya orqali amalga oshiriladi."
        confirmLabel="Ha, o'chirish"
        danger
        onConfirm={() => setDeleteToast(true)}
        onClose={() => setDeleteOpen(false)}
      />
      <SuccessToast
        open={deleteToast}
        message="Demo amal bajarildi — hisob o'chirilmadi"
        onClose={() => setDeleteToast(false)}
      />
    </DashboardShell>
  );
}
