import { Check } from "lucide-react";
import { L, useL } from "@/components/i18n/L";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const l = useL();
  return (
    <div className="mb-8">
      <ol className="flex items-center">
        {steps.map((label, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <li
              key={label}
              aria-current={isActive ? "step" : undefined}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-body-sm font-semibold transition-colors",
                    isDone && "bg-success text-white",
                    isActive &&
                      !isDone &&
                      "bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-button",
                    !isDone &&
                      !isActive &&
                      "bg-surface-muted text-ink-600 dark:bg-white/10 dark:text-white/60",
                  )}
                >
                  {isDone ? <Check size={16} /> : i + 1}
                </div>
                {/* Names show from sm up; on phones only screen readers get them (the caption below shows the current one) */}
                <span
                  className={cn(
                    "sr-only text-caption font-medium sm:not-sr-only sm:block",
                    isActive
                      ? "text-ink-900 dark:text-white"
                      : "text-ink-500 dark:text-white/60",
                  )}
                >
                  <L>{label}</L>
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    isDone
                      ? "bg-success"
                      : "bg-surface-border dark:bg-white/10",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p
        aria-hidden="true"
        className="mt-3 text-center text-caption font-medium text-ink-600 sm:hidden dark:text-white/60"
      >
        {currentStep + 1}/{steps.length} · {l(steps[currentStep] ?? "")}
      </p>
    </div>
  );
}
