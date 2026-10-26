"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { useL } from "@/components/i18n/L";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, placeholder, id, className, ...props }, ref) => {
    const l = useL();
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
          <select
            ref={ref}
            id={id}
            // Uncontrolled selects start on the placeholder; controlled ones
            // (value passed in) must not also receive a defaultValue.
            {...(props.value === undefined ? { defaultValue: "" } : {})}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "input cursor-pointer appearance-none pr-10",
              error && "border-red-400 hover:border-red-400 focus:border-red-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {l(placeholder)}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {l(opt)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
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

SelectField.displayName = "SelectField";
