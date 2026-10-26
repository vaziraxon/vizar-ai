"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { useL } from "@/components/i18n/L";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, type, ...props }, ref) => {
    const { t } = useLanguage();
    const l = useL();
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";
    const errorId = error && id ? `${id}-error` : undefined;

    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-body-sm font-medium text-ink-900 dark:text-white/80"
        >
          {l(label)}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword && revealed ? "text" : type}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "input",
              isPassword && "pr-12",
              error && "border-red-400 hover:border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]",
              className
            )}
            {...props}
            placeholder={typeof props.placeholder === "string" ? l(props.placeholder) : props.placeholder}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? t("au_hide_password") : t("au_show_password")}
              aria-pressed={revealed}
              disabled={props.disabled}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-surface-tint hover:text-ink-900 disabled:pointer-events-none dark:hover:bg-white/10 dark:hover:text-white"
            >
              {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-caption font-medium text-red-600">
            {l(error)}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
