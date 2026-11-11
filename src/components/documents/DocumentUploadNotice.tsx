import { ShieldCheck } from "lucide-react";
import { L } from "@/components/i18n/L";
import { cn } from "@/lib/utils";

/**
 * "AI document checking — test phase": shown wherever document upload is
 * offered (the dashboard's Hujjatlar page and the public Document Hub page)
 * while real uploads are closed. Same words in both places, in uz/ru/en.
 */
export function DocumentUploadNotice({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="upload-closed"
      className={cn(
        "flex flex-col gap-4 rounded-[28px] border border-violet-200 bg-gradient-to-br from-violet-50 via-surface to-surface p-6 text-left shadow-xs sm:flex-row sm:items-start sm:p-7 dark:border-white/10 dark:from-violet-500/10",
        className
      )}
    >
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-violet-700 shadow-float ring-1 ring-violet-100 dark:text-violet-200 dark:ring-white/10">
        <ShieldCheck size={22} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-caption font-semibold uppercase tracking-[0.08em] text-violet-700 dark:text-violet-300">
          <L>Sinov bosqichida</L>
        </p>
        <h2 id="upload-closed" className="mt-1 font-sans text-[1.2rem] font-semibold leading-snug text-ink-950">
          <L>AI hujjat tekshiruvi — sinov bosqichida</L>
        </h2>
        <p className="mt-2 text-body-sm text-ink-700">
          <L>{"Hujjatlaringiz xavfsizligi biz uchun birinchi o'rinda."}</L>{" "}
          <L>{"VIZAR AI hujjat tekshirish xizmatini O'zbekiston hududidagi himoyalangan serverda ishga tushirishga tayyorlamoqda."}</L>
        </p>
        <p className="mt-2 text-body-sm text-ink-700">
          <L>{"Shaxsiy ma'lumotlaringizni himoya qilish maqsadida ushbu funksiya xavfsizlik tekshiruvlari yakunlangunga qadar vaqtincha yopiq. Tez orada xizmatdan foydalanishingiz mumkin bo'ladi."}</L>
        </p>
      </div>
    </section>
  );
}
