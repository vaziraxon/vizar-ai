"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

/** Destination photo cards: real photography, flag, name, region and status. */
export function DestinationGrid({ exclude }: { exclude?: DestinationSlug }) {
  const site = useSite();
  const list = DESTINATIONS.filter((d) => d.slug !== exclude);

  return (
    <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
      {list.map((d, i) => {
        const copy = site.destinations[d.slug];
        return (
          <li key={d.slug} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 50}ms` }}>
            <Link
              href={`/destinations/${d.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface transition-[box-shadow,border-color] duration-200 hover:border-violet-200 hover:shadow-card-hover"
            >
              <span className="relative block aspect-[16/11] overflow-hidden bg-surface-muted">
                <Image
                  src={d.photo}
                  alt={copy.name}
                  fill
                  sizes="(min-width: 1024px) 280px, (min-width: 480px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
                />
                <span className="absolute left-3 top-3">
                  <Flag code={d.flag} size={28} className="ring-2 ring-white/90" />
                </span>
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-pill px-2 py-1 text-[11px] font-semibold leading-none backdrop-blur",
                    d.available ? "bg-surface/90 text-emerald-700 dark:text-emerald-300" : "bg-surface/90 text-ink-600"
                  )}
                >
                  {d.available ? `✅ ${site.destinationsPage.statusAvailable}` : `⏳ ${site.destinationsPage.statusSoon}`}
                </span>
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-body-lg font-bold tracking-[-0.01em] text-ink-900">{copy.name}</span>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-ink-300 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-violet-600"
                  />
                </span>
                <span className="text-caption font-medium text-ink-500">{copy.region}</span>
                <span className="mt-2 line-clamp-2 text-body-sm text-ink-600">{d.available ? copy.menu : copy.intro}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
