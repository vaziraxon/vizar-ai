"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useL } from "@/components/i18n/L";
import type { AssessmentFinding } from "@/lib/dashboard/assessment-review";
import { cn } from "@/lib/utils";

/** The assessment's next steps: shown after finishing it and in its saved report. */
export function AssessmentFindings({ findings, className }: { findings: AssessmentFinding[]; className?: string }) {
  const l = useL();

  return (
    <ul className={cn("space-y-3", className)}>
      {findings.map((finding) => {
        // Country names and the like are phrases too; the user's own text passes through unchanged.
        const vars = finding.vars && Object.fromEntries(Object.entries(finding.vars).map(([k, v]) => [k, typeof v === "string" ? l(v) : v]));
        return (
          <li
            key={finding.id}
            className={cn(
              "rounded-2xl border p-4",
              finding.tone === "todo"
                ? "border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/10"
                : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-400/10"
            )}
          >
            <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900">
              
              {l(finding.title, vars)}
            </p>
            <p className="mt-1 text-body-sm text-ink-700">{l(finding.text, vars)}</p>
            {finding.items?.length ? (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {finding.items.map((item) => (
                  <li key={item} className="rounded-pill bg-surface px-2.5 py-1 text-caption font-medium text-ink-700 ring-1 ring-surface-border">
                    {l(item)}
                  </li>
                ))}
              </ul>
            ) : null}
            {finding.href && finding.link ? (
              <Link href={finding.href} className="mt-2.5 inline-flex items-center gap-1 text-body-sm font-semibold text-brand-600 hover:text-brand-deep dark:text-brand-300 dark:hover:text-white">
                {l(finding.link)} <ArrowRight size={14} />
              </Link>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
