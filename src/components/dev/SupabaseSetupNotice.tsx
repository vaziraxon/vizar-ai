import { DatabaseZap } from "lucide-react";
import { SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/config";
import { L } from "@/components/i18n/L";

export function SupabaseSetupNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
        <DatabaseZap size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-body-sm text-amber-900 dark:text-amber-200">
          <L>{SUPABASE_NOT_CONFIGURED_MESSAGE}</L>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-10 text-center dark:border-amber-400/20 dark:bg-amber-400/10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-400/20">
        <DatabaseZap size={22} />
      </span>
      <div>
        <p className="text-body font-semibold text-amber-900 dark:text-amber-200">
          <L>Supabase sozlanmagan</L>
        </p>
        <p className="mt-1.5 max-w-md text-body-sm text-amber-900/90 dark:text-amber-200/90">
          <L>{"Bu bo'lim haqiqiy ma'lumotlar bazasi bilan ishlashi uchun Supabase loyihasi ulanishi kerak. .env.local faylida kerakli qiymatlarni kiriting — qadamlar SUPABASE_SETUP.md faylida yozilgan."}</L>
        </p>
      </div>
    </div>
  );
}
