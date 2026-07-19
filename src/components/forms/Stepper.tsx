import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-body-sm font-semibold transition-colors",
                  isDone && "bg-success text-white",
                  isActive && !isDone && "bg-brand-gradient text-white shadow-glow",
                  !isDone && !isActive &&
                    "bg-surface-muted text-ink-400 dark:bg-white/10 dark:text-white/40"
                )}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-caption font-medium sm:block",
                  isActive
                    ? "text-ink-900 dark:text-white"
                    : "text-ink-400 dark:text-white/40"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  isDone ? "bg-success" : "bg-surface-border dark:bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
