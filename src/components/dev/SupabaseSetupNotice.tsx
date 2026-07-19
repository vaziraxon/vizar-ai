import { DatabaseZap } from "lucide-react";
import { SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/config";

export function SupabaseSetupNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
        <DatabaseZap size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-body-sm text-amber-900 dark:text-amber-200">
          {SUPABASE_NOT_CONFIGURED_MESSAGE}
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
          Supabase sozlanmagan
        </p>
        <p className="mt-1.5 max-w-md text-body-sm text-amber-900/90 dark:text-amber-200/90">
          Bu bo&apos;lim haqiqiy ma&apos;lumotlar bazasi bilan ishlashi uchun
          Supabase loyihasi ulanishi kerak. <code>.env.local</code> faylida
          kerakli qiymatlarni kiriting — qadamlar{" "}
          <code>SUPABASE_SETUP.md</code> faylida yozilgan.
        </p>
      </div>
    </div>
  );
}
