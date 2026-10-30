"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow, StatusPill } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { TOOL_BY_ID, type ToolId } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

const GROUPS: { key: "toolsGroupPrepare" | "toolsGroupApply"; ids: ToolId[] }[] = [
  { key: "toolsGroupPrepare", ids: ["readiness", "documents", "checklist", "interview"] },
  { key: "toolsGroupApply", ids: ["tracker", "rejection", "experts"] },
];

/** One list card: tinted emoji tile, name + status, short description, arrow. */
function ToolIndexCard({ id }: { id: ToolId }) {
  const site = useSite();
  const tool = TOOL_BY_ID[id];
  const copy = site.tools[id];
  return (
    <li>
      <Link
        href={tool.href}
        className="spotlight group flex h-full items-center gap-5 rounded-[24px] border border-surface-border bg-surface p-5 transition-[transform,box-shadow,border-color] duration-200 ease-premium hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-card-hover sm:p-6"
      >
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-[26px] leading-none ring-1 ring-brand-100"
        >
          {tool.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-body-lg font-bold tracking-[-0.01em] text-ink-950">{copy.name}</span>
            <StatusPill status={tool.status} />
          </span>
          <span className="mt-1 line-clamp-2 block text-body-sm text-ink-600">{copy.desc}</span>
        </span>
        <ArrowRight
          size={20}
          className="shrink-0 text-ink-400 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400"
        />
      </Link>
    </li>
  );
}

/** Grouped directory of every tool — used on /features. */
export function ToolIndex() {
  const site = useSite();
  return (
    <div className="space-y-14">
      {GROUPS.map((group) => (
        <div key={group.key} data-reveal>
          <Eyebrow emoji={group.key === "toolsGroupPrepare" ? "🧳" : "🛫"}>{site.nav[group.key]}</Eyebrow>
          <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {group.ids.map((id) => (
              <ToolIndexCard key={id} id={id} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Compact related-tools cards for tool pages. */
export function ToolLinkList({ ids, className }: { ids: ToolId[]; className?: string }) {
  const site = useSite();
  return (
    <ul className={cn("grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4", className)}>
      {ids.map((id) => {
        const tool = TOOL_BY_ID[id];
        return (
          <li key={id}>
            <Link
              href={tool.href}
              className="spotlight group flex items-center gap-4 rounded-[20px] border border-surface-border bg-surface p-4 transition-[box-shadow,border-color] duration-200 hover:border-brand-100 hover:shadow-card-hover"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50/60 text-[18px] leading-none"
              >
                {tool.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-semibold text-ink-900">{site.tools[id].name}</span>
                <span className="block truncate text-caption text-ink-500">{site.tools[id].menu}</span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-ink-300 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
