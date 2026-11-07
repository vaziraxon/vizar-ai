"use client";

import { LocalLink as Link } from "@/components/site/LocalLink";
import { ArrowRight } from "lucide-react";
import { Eyebrow, StatusPill } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { useL } from "@/components/i18n/L";
import { TOOL_PROMOS, type ToolKey } from "@/lib/dashboard/tool-promos";
import { TOOL_BY_ID, type ToolId, type ToolStatus } from "@/lib/site/registry";
import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/site/EmojiIcon";

/** A tool from the registry, or one of the four promoted dashboard tools */
type IndexItem = { tool: ToolId } | { promo: ToolKey };

const GROUPS: { key: "toolsGroupPrepare" | "toolsGroupApply"; items: IndexItem[] }[] = [
  {
    key: "toolsGroupPrepare",
    items: [{ tool: "readiness" }, { tool: "documents" }, { tool: "checklist" }, { tool: "interview" }, { promo: "visaPhoto" }, { promo: "visaLetters" }],
  },
  { key: "toolsGroupApply", items: [{ promo: "visaTiming" }, { promo: "schengenCalc" }, { tool: "tracker" }, { tool: "rejection" }, { tool: "experts" }] },
];

/** One list card: tinted emoji tile, name + status, short description, arrow. */
function ToolIndexCard({ href, emoji, name, status, desc }: { href: string; emoji: string; name: string; status: ToolStatus; desc: string }) {
  return (
    <li>
      <Link
        href={href}
        className="spotlight group flex h-full items-center gap-5 rounded-[24px] border border-surface-border bg-surface p-5 transition-[transform,box-shadow,border-color] duration-200 ease-premium hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-card-hover sm:p-6"
      >
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-[26px] leading-none ring-1 ring-brand-100"
        >
          <EmojiIcon emoji={emoji} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-body-lg font-bold tracking-[-0.01em] text-ink-950">{name}</span>
            <StatusPill status={status} />
          </span>
          <span className="mt-1 line-clamp-2 block text-body-sm text-ink-600">{desc}</span>
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
  const l = useL();
  const card = (item: IndexItem) => {
    if ("tool" in item) {
      const tool = TOOL_BY_ID[item.tool];
      return <ToolIndexCard key={item.tool} href={tool.href} emoji={tool.emoji} name={site.tools[item.tool].name} status={tool.status} desc={site.tools[item.tool].desc} />;
    }
    const promo = TOOL_PROMOS.find((p) => p.key === item.promo)!;
    return <ToolIndexCard key={item.promo} href={promo.publicHref} emoji={promo.emoji} name={site[item.promo].title} status="available" desc={l(promo.tagline)} />;
  };
  return (
    <div className="space-y-14">
      {GROUPS.map((group) => (
        <div key={group.key} data-reveal>
          <Eyebrow emoji={group.key === "toolsGroupPrepare" ? "🧳" : "🛫"}>{site.nav[group.key]}</Eyebrow>
          <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{group.items.map(card)}</ul>
        </div>
      ))}
    </div>
  );
}

/** Every tool as a small link card, in /features order */
function useToolEntries() {
  const site = useSite();
  return GROUPS.flatMap((g) => g.items).map((item) => {
    if ("tool" in item) {
      const tool = TOOL_BY_ID[item.tool];
      return { href: tool.href, emoji: tool.emoji, name: site.tools[item.tool].name, sub: site.tools[item.tool].menu };
    }
    const promo = TOOL_PROMOS.find((p) => p.key === item.promo)!;
    return { href: promo.publicHref, emoji: promo.emoji, name: site[item.promo].title, sub: site[item.promo].menu };
  });
}

type ToolEntry = ReturnType<typeof useToolEntries>[number];

function ToolEntryList({ entries, className }: { entries: ToolEntry[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4", className)}>
      {entries.map((t) => (
        <li key={t.href}>
          <Link
            href={t.href}
            className="spotlight group flex items-center gap-4 rounded-[20px] border border-surface-border bg-surface p-4 transition-[box-shadow,border-color] duration-200 hover:border-brand-100 hover:shadow-card-hover"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50/60 text-[18px] leading-none"
            >
              <EmojiIcon emoji={t.emoji} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm font-semibold text-ink-900">{t.name}</span>
              <span className="block truncate text-caption text-ink-500">{t.sub}</span>
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-ink-300 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Three other tools for the foot of a tool page: the next ones after it, in /features order. */
export function RelatedTools({ currentHref, className }: { currentHref: string; className?: string }) {
  const all = useToolEntries();
  const at = all.findIndex((t) => t.href === currentHref);
  return <ToolEntryList entries={[1, 2, 3].map((n) => all[(at + n + all.length) % all.length]!)} className={className} />;
}
