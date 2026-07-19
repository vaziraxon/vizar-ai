import { AlertOctagon } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Xatolik yuz berdi",
  description = "Ma'lumotlarni yuklab bo'lmadi. Iltimos, qayta urinib ko'ring.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-10 text-center dark:border-red-400/20 dark:bg-red-400/5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-400/20">
        <AlertOctagon size={22} />
      </span>
      <p className="text-body font-semibold text-ink-900 dark:text-white">{title}</p>
      <p className="max-w-sm text-body-sm text-ink-600 dark:text-white/60">
        {description}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-pill bg-brand-gradient px-5 py-2 text-body-sm font-semibold text-white shadow-glow"
        >
          Qayta urinish
        </button>
      )}
    </div>
  );
}
