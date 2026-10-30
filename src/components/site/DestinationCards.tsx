"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, type DestinationSlug, type FlagCode } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

/** A soft violet→lemon stage holding the cards; a touch narrower than the page, so they come out a little smaller. */
export function DestinationStage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto max-w-[1080px] rounded-[36px] bg-gradient-to-br from-violet-100/80 via-surface/70 to-lemon-200/50 p-3 ring-1 ring-violet-200/70 sm:p-5 dark:from-violet-100/60 dark:via-surface/40 dark:to-lemon-300/[0.06] dark:ring-white/10",
        className
      )}
    >
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{children}</ul>
    </div>
  );
}

/** Photo card in a gold-foil frame: a lemon→gold gradient with a bright top edge and a warm shadow. */
export function DestinationCard({
  index,
  href,
  photo,
  flag,
  name,
  region,
  badge,
}: {
  index: number;
  href: string;
  photo: string;
  flag: FlagCode;
  name: string;
  region: string;
  badge?: ReactNode;
}) {
  return (
    <li data-reveal style={{ ["--reveal-delay" as string]: `${(index % 4) * 50}ms` }}>
      <Link
        href={href}
        className="group block rounded-[24px] bg-gradient-to-br from-lemon-200 via-lemon-300 to-gold-400 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_22px_44px_-14px_rgba(222,186,10,0.7),0_6px_16px_-6px_rgba(222,186,10,0.45)] transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_30px_56px_-14px_rgba(222,186,10,0.85),0_8px_20px_-6px_rgba(222,186,10,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_18px_40px_-16px_rgba(247,227,90,0.4)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_26px_52px_-16px_rgba(247,227,90,0.55)]"
      >
        <span className="relative block aspect-[5/6] overflow-hidden rounded-[19px] bg-surface-muted ring-1 ring-black/5">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="(min-width: 1024px) 260px, 50vw"
            className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.06]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/60 via-night-950/5 to-transparent" />
          {/* A light sweep crosses the photo on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-premium group-hover:translate-x-[300%] group-hover:opacity-100 motion-reduce:hidden"
          />
          <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
            <Flag code={flag} size={30} className="shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)] ring-2 ring-white/90" />
          </span>
          {badge}
          {/* Frosted caption plate (the arrow shows from sm up, so phones keep room for the name) */}
          <span className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-[14px] bg-white/[0.14] px-3 py-2 ring-1 ring-inset ring-white/25 backdrop-blur-md sm:inset-x-2.5 sm:bottom-2.5 sm:px-3.5 sm:py-2.5">
            <span className="min-w-0">
              <span className="block break-words font-luxe text-[16px] font-semibold leading-tight text-white sm:text-[21px]">{name}</span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:text-[10.5px]">{region}</span>
            </span>
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lemon-300 text-night shadow-[0_6px_14px_-6px_rgba(222,186,10,0.9)] transition-transform duration-300 ease-premium group-hover:-rotate-45 sm:flex">
              <ArrowRight size={15} strokeWidth={2.4} />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Every destination. Only the ones still in the works carry a label; the page itself states its status. */
export function DestinationGrid({ exclude, limit }: { exclude?: DestinationSlug; limit?: number }) {
  const site = useSite();
  const list = DESTINATIONS.filter((d) => d.slug !== exclude).slice(0, limit);

  return (
    <DestinationStage>
      {list.map((d, i) => {
        const copy = site.destinations[d.slug];
        return (
          <DestinationCard
            key={d.slug}
            index={i}
            href={`/destinations/${d.slug}`}
            photo={d.photo}
            flag={d.flag}
            name={copy.name}
            region={copy.region}
            badge={
              !d.available && (
                <span className="absolute right-2 top-3 rounded-pill bg-surface/90 px-1.5 py-1 text-[10px] font-semibold leading-none text-ink-600 backdrop-blur sm:right-3 sm:top-3.5 sm:px-2 sm:text-[11px]">
                  <span aria-hidden="true" className="hidden sm:inline">
                    ⏳{" "}
                  </span>
                  {site.destinationsPage.statusSoon}
                </span>
              )
            }
          />
        );
      })}
    </DestinationStage>
  );
}
