"use client";

import { useState, useRef } from "react";
import { UploadCloud, Save } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SuccessToast } from "@/components/states/SuccessToast";
import { Button } from "@/components/ui/Button";
import { AGENCY_NAV } from "@/data/mockData";

export default function WhiteLabelPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("Ishonch Viza Agentligi");
  const [primaryColor, setPrimaryColor] = useState("#2E1FD0");
  const [accentColor, setAccentColor] = useState("#22D3EE");
  const [domain, setDomain] = useState("portal.ishonchviza.uz");
  const [senderName, setSenderName] = useState("Ishonch Viza Agentligi");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <DashboardShell
      title="Oq etiketka (White-label) demo"
      subtitle="Brendingizni sozlang va mijoz portali ko'rinishini oldindan ko'ring."
      
      showOnboarding={false}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5 p-6 dark:border-white/10 dark:bg-navy-800">
          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Agentlik logotipi
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-border px-4 py-6 text-center hover:border-brand-300 dark:border-white/10"
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Agentlik logotipi" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <UploadCloud size={22} className="text-brand-500" />
              )}
              <span className="text-caption text-ink-400 dark:text-white/40">
                Logotipni yuklash uchun bosing
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Brend nomi
            </label>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
                Asosiy rang
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-surface-border dark:border-white/10"
                />
                <span className="text-caption text-ink-400 dark:text-white/40">{primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
                Aksent rang
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-surface-border dark:border-white/10"
                />
                <span className="text-caption text-ink-400 dark:text-white/40">{accentColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Maxsus domen (namuna)
            </label>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
            <p className="mt-1 text-caption text-ink-400 dark:text-white/40">
              Haqiqiy domen sozlamalari amalga oshirilmaydi — bu faqat namuna.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Email yuboruvchi nomi
            </label>
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>

          <Button size="md" className="w-full" onClick={() => setSaved(true)}>
            <Save size={16} /> Ko&apos;rinishni saqlash
          </Button>
        </div>

        {/* Live preview */}
        <div className="card overflow-hidden p-0 dark:border-white/10 dark:bg-navy-800">
          <div
            className="flex h-16 items-center gap-3 px-5"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-8 w-8 rounded-md object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-caption font-bold text-white">
                {brandName.charAt(0)}
              </span>
            )}
            <span className="font-display text-body font-semibold text-white">{brandName}</span>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
              Mijoz portali ko&apos;rinishi
            </p>
            <div className="rounded-xl border border-surface-border p-4 dark:border-white/10">
              <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                Xush kelibsiz, Aziz!
              </p>
              <p className="mt-1 text-caption text-ink-400 dark:text-white/40">
                Visa Readiness Score: 78/100
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface-muted dark:bg-white/10">
                <div
                  className="h-full rounded-pill"
                  style={{ width: "78%", background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
                />
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-pill px-5 py-2.5 text-body-sm font-semibold text-white"
              style={{ background: primaryColor }}
            >
              Tahlilni davom ettirish
            </button>
            <p className="text-caption text-ink-400 dark:text-white/40">
              {domain} · {senderName} nomidan yuboriladi
            </p>
          </div>
        </div>
      </div>

      <SuccessToast
        open={saved}
        message="Ko'rinish saqlandi (demo — real domen ulanmagan)"
        onClose={() => setSaved(false)}
      />
    </DashboardShell>
  );
}
