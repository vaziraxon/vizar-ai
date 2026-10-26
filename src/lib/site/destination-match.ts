import { SITE_CONTENT } from "@/lib/i18n/site";
import type { FlagCode } from "@/lib/site/registry";

export interface DestinationVisual {
  flag: FlagCode;
  photo: string;
  /** Main arrival airport, for the boarding-pass chip */
  airport: string;
}

const BY_FLAG: Record<string, DestinationVisual> = {
  eu: { flag: "eu", photo: "/images/destinations/schengen.webp", airport: "CDG" },
  fr: { flag: "fr", photo: "/images/destinations/fr.webp", airport: "CDG" },
  de: { flag: "de", photo: "/images/destinations/de.webp", airport: "FRA" },
  it: { flag: "it", photo: "/images/destinations/it.webp", airport: "FCO" },
  us: { flag: "us", photo: "/images/destinations/us.webp", airport: "JFK" },
  gb: { flag: "gb", photo: "/images/destinations/gb.webp", airport: "LHR" },
  ca: { flag: "ca", photo: "/images/destinations/ca.webp", airport: "YYZ" },
  jp: { flag: "jp", photo: "/images/destinations/jp.webp", airport: "NRT" },
  kr: { flag: "kr", photo: "/images/destinations/kr.webp", airport: "ICN" },
  ae: { flag: "ae", photo: "/images/destinations/ae.webp", airport: "DXB" },
  tr: { flag: "tr", photo: "/images/destinations/tr.webp", airport: "IST" },
};

const SLUG_FLAG: Record<string, keyof typeof BY_FLAG> = {
  schengen: "eu",
  usa: "us",
  uk: "gb",
  canada: "ca",
  japan: "jp",
  "south-korea": "kr",
  uae: "ae",
  turkey: "tr",
};

const key = (s: string) => s.toLowerCase().replace(/[‘’'`ʻʼ]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

// Every destination/country name the site knows, in all three languages,
// plus a few common short forms people type.
const NAMES = new Map<string, keyof typeof BY_FLAG>();
for (const content of Object.values(SITE_CONTENT)) {
  for (const [slug, d] of Object.entries(content.destinations)) NAMES.set(key(d.name), SLUG_FLAG[slug]!);
  for (const [code, name] of Object.entries(content.countries)) NAMES.set(key(name), code as keyof typeof BY_FLAG);
}
for (const [alias, flag] of Object.entries({
  koreya: "kr", korea: "kr", "south korea": "kr", "janubiy koreya": "kr", корея: "kr",
  usa: "us", "united states": "us", amerika: "us", америка: "us",
  uk: "gb", england: "gb", angliya: "gb", англия: "gb",
  schengen: "eu", shengen: "eu", шенген: "eu", europe: "eu", yevropa: "eu",
  uae: "ae", dubai: "ae", dubay: "ae",
} as Record<string, keyof typeof BY_FLAG>)) NAMES.set(key(alias), flag);

/** Visuals for a destination name in any language; null when unknown. */
export function matchDestination(name: string | null | undefined): DestinationVisual | null {
  if (!name) return null;
  const k = key(name);
  const direct = NAMES.get(k);
  if (direct) return BY_FLAG[direct]!;
  for (const [n, flag] of NAMES) if (n.length > 2 && k.includes(n)) return BY_FLAG[flag]!;
  return null;
}
