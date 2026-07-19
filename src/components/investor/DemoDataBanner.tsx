import { Sparkles } from "lucide-react";

export function DemoDataBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-400/20 dark:bg-brand-900/20">
      <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" />
      <p className="text-body-sm text-brand-800 dark:text-brand-200">
        <strong>Demo ma&apos;lumotlar.</strong> Investor taqdimoti uchun
        namunaviy ko&apos;rsatkichlar — ushbu raqamlar haqiqiy platforma
        statistikasi sifatida talqin qilinmasligi kerak.
      </p>
    </div>
  );
}
