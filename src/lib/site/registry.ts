import type { LucideIcon } from "lucide-react";
import {
  Gauge,
  ScanSearch,
  ListChecks,
  MessagesSquare,
  Route,
  FileSearch,
  UserCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Product registry — routes, icons and *honest* availability for every tool
// and destination. Copy lives in src/lib/i18n/site/*; this file only holds
// structure so the three languages can't drift apart.
// ---------------------------------------------------------------------------

export type ToolId =
  | "readiness"
  | "documents"
  | "checklist"
  | "interview"
  | "tracker"
  | "rejection"
  | "experts";

/**
 * available — works today with real data
 * beta      — works, but with simplified logic (e.g. rule-based scoring)
 * soon      — UI exists as a prototype; the capability is not live yet
 */
export type ToolStatus = "available" | "beta" | "soon";

export interface ToolMeta {
  id: ToolId;
  /** Public product page */
  href: string;
  /** Page inside the signed-in app */
  appHref: string;
  icon: LucideIcon;
  /** Feature identity mark used across the public site */
  emoji: string;
  status: ToolStatus;
}

export const TOOLS: ToolMeta[] = [
  { id: "readiness", href: "/visa-readiness", appHref: "/dashboard/readiness", icon: Gauge, emoji: "🎯", status: "beta" },
  { id: "documents", href: "/document-checker", appHref: "/dashboard/documents", icon: ScanSearch, emoji: "📄", status: "soon" },
  { id: "checklist", href: "/checklist", appHref: "/dashboard/checklist", icon: ListChecks, emoji: "✅", status: "soon" },
  { id: "interview", href: "/interview", appHref: "/dashboard/interview", icon: MessagesSquare, emoji: "🎤", status: "soon" },
  { id: "tracker", href: "/tracker", appHref: "/dashboard/tracker", icon: Route, emoji: "📍", status: "available" },
  { id: "rejection", href: "/rejection-analysis", appHref: "/dashboard/rejection-analysis", icon: FileSearch, emoji: "🔍", status: "soon" },
  { id: "experts", href: "/experts", appHref: "/dashboard/experts", icon: UserCheck, emoji: "🤝", status: "beta" },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, ToolMeta>;

export type FlagCode = "uz" | "ru" | "eu" | "fr" | "de" | "it" | "us" | "gb" | "ca" | "jp" | "kr" | "ae" | "tr";

export type DestinationSlug =
  | "schengen"
  | "usa"
  | "uk"
  | "canada"
  | "japan"
  | "south-korea"
  | "uae"
  | "turkey";

export interface DestinationMeta {
  slug: DestinationSlug;
  flag: FlagCode;
  /** Local photo in /public/images/destinations — see PHOTO_CREDITS */
  photo: string;
  /** Covered by the readiness questionnaire today */
  available: boolean;
}

export const DESTINATIONS: DestinationMeta[] = [
  { slug: "schengen", flag: "eu", photo: "/images/destinations/schengen.webp", available: true },
  { slug: "usa", flag: "us", photo: "/images/destinations/us.webp", available: true },
  { slug: "uk", flag: "gb", photo: "/images/destinations/gb.webp", available: true },
  { slug: "canada", flag: "ca", photo: "/images/destinations/ca.webp", available: true },
  { slug: "japan", flag: "jp", photo: "/images/destinations/jp.webp", available: true },
  { slug: "south-korea", flag: "kr", photo: "/images/destinations/kr.webp", available: true },
  { slug: "uae", flag: "ae", photo: "/images/destinations/ae.webp", available: true },
  { slug: "turkey", flag: "tr", photo: "/images/destinations/tr.webp", available: false },
];

export const DESTINATION_BY_SLUG = Object.fromEntries(
  DESTINATIONS.map((d) => [d.slug, d])
) as Record<DestinationSlug, DestinationMeta>;

/** Pages in the landing look (glass navbar, short footer): home, the tools and the destinations. */
export function hasLandingLook(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/features" ||
    pathname.startsWith("/destinations") ||
    TOOLS.some((t) => t.href === pathname)
  );
}

/** Homepage "popular destinations" — Schengen countries link to the Schengen page. */
export type PopularCountry = "fr" | "de" | "it" | "us" | "gb" | "ca" | "jp" | "kr";

export const POPULAR: { country: PopularCountry; slug: DestinationSlug; photo: string }[] = [
  { country: "fr", slug: "schengen", photo: "/images/destinations/fr.webp" },
  { country: "de", slug: "schengen", photo: "/images/destinations/de.webp" },
  { country: "it", slug: "schengen", photo: "/images/destinations/it.webp" },
  { country: "us", slug: "usa", photo: "/images/destinations/us.webp" },
  { country: "gb", slug: "uk", photo: "/images/destinations/gb.webp" },
  { country: "ca", slug: "canada", photo: "/images/destinations/ca.webp" },
  { country: "jp", slug: "japan", photo: "/images/destinations/jp.webp" },
  { country: "kr", slug: "south-korea", photo: "/images/destinations/kr.webp" },
];

/**
 * Photo credits. Every image is from Unsplash, free to use under the
 * Unsplash License (https://unsplash.com/license); credited out of courtesy.
 */
export const PHOTO_CREDITS: Record<string, { author: string; url: string }> = {
  "/images/destinations/fr.webp": { author: "Jad Limcaco", url: "https://unsplash.com/photos/NT1mJPgni6A" },
  "/images/destinations/de.webp": { author: "Ansgar Scheffold", url: "https://unsplash.com/photos/mtfTz0FnwBw" },
  "/images/destinations/it.webp": { author: "Cristina Gottardi", url: "https://unsplash.com/photos/VhlLC2eNSuo" },
  "/images/destinations/us.webp": { author: "NIR HIMI", url: "https://unsplash.com/photos/9Av9ibY_naM" },
  "/images/destinations/gb.webp": { author: "Marcin Nowak", url: "https://unsplash.com/photos/iXqTqC-f6jI" },
  "/images/destinations/ca.webp": { author: "Connor Jolley", url: "https://unsplash.com/photos/Y6I4VvyN_sA" },
  "/images/destinations/jp.webp": { author: "Manuel Cosentino", url: "https://unsplash.com/photos/n--CMLApjfI" },
  "/images/destinations/kr.webp": { author: "Trac Vu", url: "https://unsplash.com/photos/DBGb21xevAA" },
  "/images/destinations/ae.webp": { author: "Nejc Soklič", url: "https://unsplash.com/photos/bVblbt3tGxM" },
  "/images/destinations/tr.webp": { author: "Hussein A.Kamal", url: "https://unsplash.com/photos/u_PuOVTTfOg" },
  "/images/destinations/schengen.webp": { author: "William Zhang", url: "https://unsplash.com/photos/6En4WYsNYXM" },
  "/images/travel/passports.webp": { author: "Global Residence Index", url: "https://unsplash.com/photos/addEU6TScGI" },
};
