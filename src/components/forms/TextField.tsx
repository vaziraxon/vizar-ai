import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 dark:bg-navy-800 dark:text-white dark:placeholder:text-white/30",
            error
              ? "border-red-400"
              : "border-surface-border dark:border-white/10",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-caption font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
