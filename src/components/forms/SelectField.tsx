import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, placeholder, id, className, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          defaultValue=""
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors focus:border-brand-400 dark:bg-navy-800 dark:text-white",
            error
              ? "border-red-400"
              : "border-surface-border dark:border-white/10",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-caption font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
