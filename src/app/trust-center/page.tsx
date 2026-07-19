"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Database,
  UserCheck,
  FileText,
  Bot,
  Users,
  ScrollText,
  Route,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { TRUST_FAQ } from "@/data/mockData";
import { cn } from "@/lib/utils";

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Ma'lumotlar maxfiyligi",
    description:
      "Demo versiyada barcha ma'lumotlar faqat brauzeringizda saqlanadi va tashqariga yuborilmaydi.",
  },
  {
    icon: Database,
    title: "Shifrlash (rejalashtirilgan)",
    description:
      "Ishlab chiqarish versiyasida ma'lumotlarni uzatish va saqlashda shifrlash qo'llanilishi rejalashtirilgan.",
  },
  {
    icon: FileText,
    title: "Ma'lumotlarni minimallashtirish",
    description:
      "Faqat tahlil uchun zarur bo'lgan ma'lumotlar so'raladi — ortiqcha ma'lumot talab qilinmaydi.",
  },
  {
    icon: UserCheck,
    title: "Foydalanuvchi nazorati",
    description:
      "Foydalanuvchilar o'z ma'lumotlarini ko'rish, tahrirlash va o'chirishni so'rash huquqiga ega bo'ladi.",
  },
  {
    icon: ShieldAlert,
    title: "Demo ma'lumotlar siyosati",
    description:
      "Ushbu platforma demo rejimida ishlaydi — haqiqiy passport yoki moliyaviy hujjatlarni yuklamang.",
  },
  {
    icon: Bot,
    title: "Mas'uliyatli sun'iy intellekt",
    description:
      "AI tahlili faqat tavsiya beruvchi vosita sifatida ishlatiladi, yakuniy qarorlar uchun asos emas.",
  },
  {
    icon: Users,
    title: "Inson tomonidan ko'rib chiqish",
    description:
      "Muhim tavsiyalar va konsultatsiyalar uchun inson mutaxassisi ishtirokini rejalashtirmoqdamiz.",
  },
];

const SECURITY_ROADMAP = [
  "Ma'lumotlarni shifrlash (transit va saqlashda)",
  "Rolga asoslangan kirish nazorati",
  "Muntazam xavfsizlik auditi",
  "GDPR va mahalliy qonunchilikka moslashtirish (kelajakdagi maqsad)",
];

export default function TrustCenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-surface dark:bg-navy-950">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-ink-700 hover:text-ink-900 dark:text-white/70 dark:hover:text-white"
        >
          <ArrowLeft size={15} /> Bosh sahifaga qaytish
        </Link>
      </div>

      <div className="container-page pb-16 pt-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600 dark:border-brand-400/20 dark:bg-brand-900/20">
          <ShieldAlert size={13} /> Trust Center
        </span>
        <h1 className="mt-5 font-display text-display-lg text-ink-900 dark:text-white">
          Xavfsizlik va ishonch markazi
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-body-lg text-ink-600 dark:text-white/60">
          Ma&apos;lumotlaringizga qanday munosabatda bo&apos;lishimiz haqida
          shaffof ma&apos;lumot.
        </p>
      </div>

      <div className="container-page grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <p.icon size={19} />
            </span>
            <p className="mt-4 font-display text-body font-semibold text-ink-900 dark:text-white">
              {p.title}
            </p>
            <p className="mt-1.5 text-body-sm text-ink-600 dark:text-white/60">
              {p.description}
            </p>
          </div>
        ))}
      </div>

      <div className="container-page pb-16">
        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 flex items-center gap-2 font-display text-body font-semibold text-ink-900 dark:text-white">
            <Route size={18} className="text-brand-600" /> Xavfsizlik yo&apos;l xaritasi
          </p>
          <ul className="space-y-2.5">
            {SECURITY_ROADMAP.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-600 dark:text-white/60">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-ink-400 dark:text-white/40">
            Eslatma: kompaniyamiz hozircha ISO, SOC 2, GDPR yoki davlat
            tomonidan tasdiqlangan sertifikatlarga ega emas. Yuqoridagilar
            kelajakdagi maqsadlar sifatida belgilangan.
          </p>
        </div>
      </div>

      <div id="legal-disclaimer" className="container-page pb-16 scroll-mt-24">
        <div className="card border-amber-200 bg-amber-50/60 p-6 dark:border-amber-400/20 dark:bg-amber-400/10">
          <p className="flex items-center gap-2 font-display text-body font-semibold text-amber-900 dark:text-amber-200">
            <ScrollText size={18} /> Huquqiy ogohlantirish
          </p>
          <p className="mt-2 text-body-sm text-amber-900 dark:text-amber-200">
            VIZAR AI mustaqil texnologik platforma bo&apos;lib, elchixona
            yoki konsullik vakolatxonasi emas. Platforma viza
            tasdiqlanishini kafolatlamaydi va yuridik maslahat sifatida
            talqin qilinmasligi kerak.
          </p>
        </div>
      </div>

      <div className="container-page pb-24">
        <h2 className="mb-6 text-center font-display text-display-sm text-ink-900 dark:text-white">
          Ko&apos;p so&apos;raladigan savollar
        </h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {TRUST_FAQ.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-surface-border bg-white dark:border-white/10 dark:bg-navy-800"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-body-sm font-semibold text-ink-900 dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "shrink-0 text-brand-600 transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-body-sm text-ink-600 dark:text-white/60">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
