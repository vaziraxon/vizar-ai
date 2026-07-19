"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Moon, Sun, PlayCircle, LogOut, KeyRound, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ConfirmationModal } from "@/components/states/ConfirmationModal";
import { SuccessToast } from "@/components/states/SuccessToast";
import { InlineAlert } from "@/components/states/InlineAlert";
import { useTheme } from "@/lib/theme-context";
import { logoutAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-body-sm font-medium text-ink-900 dark:text-white">
          {label}
        </p>
        <p className="text-caption text-ink-400 dark:text-white/40">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${
          checked ? "bg-brand-600" : "bg-surface-muted dark:bg-white/10"
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
        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-3 text-body-sm font-semibold text-ink-900 dark:text-white">
            Til
          </p>
          <LanguageSelector />
        </div>

        <div className="card flex items-center justify-between gap-4 p-6 dark:border-white/10 dark:bg-navy-800">
          <div>
            <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
              Tanishtiruv (onboarding)
            </p>
            <p className="text-caption text-ink-400 dark:text-white/40">
              Birinchi marta ko&apos;rsatilgan tanishtiruv oynasini qayta oching.
            </p>
          </div>
          <button
            type="button"
            onClick={reopenOnboarding}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            <PlayCircle size={15} /> Qayta ko&apos;rish
          </button>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-1 text-body-sm font-semibold text-ink-900 dark:text-white">
            Ko&apos;rinish
          </p>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-body-sm font-medium text-ink-900 dark:text-white">
                Tungi rejim
              </p>
              <p className="text-caption text-ink-400 dark:text-white/40">
                Interfeys ko&apos;rinishini almashtiring.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-pill border border-surface-border px-3.5 py-2 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
              {theme === "light" ? "Tungi rejim" : "Kunduzgi rejim"}
            </button>
          </div>
        </div>

        <div className="card divide-y divide-surface-border p-6 dark:divide-white/10 dark:border-white/10 dark:bg-navy-800">
          <p className="pb-1 text-body-sm font-semibold text-ink-900 dark:text-white">
            Bildirishnomalar
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

        <div className="card divide-y divide-surface-border p-6 dark:divide-white/10 dark:border-white/10 dark:bg-navy-800">
          <p className="pb-1 text-body-sm font-semibold text-ink-900 dark:text-white">
            Maxfiylik
          </p>
          <ToggleRow
            label="Ma'lumotlarni tahlil uchun ishlatish"
            description="Platforma sifatini oshirish uchun anonim statistikaga ruxsat bering."
            defaultChecked={false}
          />
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
            <KeyRound size={16} className="text-brand-600" /> Parolni o&apos;zgartirish
          </p>
          <p className="mb-4 text-body-sm text-ink-600 dark:text-white/60">
            Xavfsizlik uchun parolni o&apos;zgartirish email orqali tasdiqlash
            havolasi bilan amalga oshiriladi.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            Parolni tiklash havolasini olish
          </a>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-3 text-body-sm font-semibold text-ink-900 dark:text-white">
            Hisobdan chiqish
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-pill border border-surface-border px-4 py-2 text-body-sm font-semibold text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
            >
              <LogOut size={15} /> Chiqish
            </button>
          </form>
        </div>

        <div className="card border-red-200 p-6 dark:border-red-400/20 dark:bg-navy-800">
          <p className="mb-1 text-body-sm font-semibold text-red-600">
            Xavfli hudud
          </p>
          <p className="mb-3 text-caption text-ink-400 dark:text-white/40">
            Hisobni o&apos;chirish qaytarib bo&apos;lmaydigan amal.
          </p>
          <div className="mb-4">
            <InlineAlert variant="warning">
              <span className="flex items-start gap-1.5">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                Xavfsizlik sababli, hisobni o&apos;chirish brauzerdan
                to&apos;g&apos;ridan-to&apos;g&apos;ri amalga
                oshirilmaydi — bu amal maxsus sozlangan server tomonidagi
                (admin) funksiya orqali bajarilishi kerak. Hozircha bu
                tugma faqat namunaviy xabar ko&apos;rsatadi.
              </span>
            </InlineAlert>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-pill border border-red-300 px-4 py-2 text-body-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-400/30 dark:hover:bg-red-400/10"
          >
            <Trash2 size={15} /> Hisobni o&apos;chirish
          </button>
        </div>

        {!configured && (
          <InlineAlert variant="info">
            Supabase sozlanmagan — chiqish va parolni tiklash havolalari
            hozircha ishlamaydi.
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
