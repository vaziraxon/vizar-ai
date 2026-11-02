/**
 * Visa photo sizes from official pages, and the geometry the free photo tool
 * needs: where the guide lines go, how photos fit on a 10×15 print, whether
 * the picture covers the frame and is sharp enough, and a rough background
 * check. No AI and no upload: the tool crops in the visitor's browser.
 *
 * Dependency-free so it can be unit-tested with plain Node.
 */

/** The same slugs as the site's destination pages */
export type PhotoSpecId = "schengen" | "usa" | "canada" | "japan" | "south-korea";

/** What a head-size rule is measured to, as each official page words it */
export type HeadTop = "hairline" | "crown" | "hair";
export type PhotoBackground = "white" | "whiteOffWhite" | "whiteOrLight" | "notStated";
export type PhotoGlasses = "no" | "untinted" | "notStated";

export interface PhotoSpec {
  id: PhotoSpecId;
  widthMm: number;
  heightMm: number;
  /** The size in inches, shown next to the mm (2 → 2×2 in) */
  inches?: number;
  /** Chin to `to`, in mm. official: false → the official page gives no head size and the guide is approximate. */
  head: { minMm: number; maxMm: number; to: HeadTop; official: boolean };
  /** Eye height above the bottom edge, in mm */
  eyesFromBottomMm?: [number, number];
  /** Rules for the uploaded file */
  digital?: { minPx: number; maxPx: number; maxKb: number };
  background: PhotoBackground;
  glasses: PhotoGlasses;
  /** Taken within this many months */
  recentMonths?: number;
  sources: { label: string; url: string }[];
}

const inch = (n: number) => n * 25.4;

/** Checked 2026-11-02. A rule an official page doesn't state is left out or marked notStated. */
export const PHOTO_SPECS: PhotoSpec[] = [
  {
    // Embassy in Tashkent: "biometrik, oq rangli fonda, hajmi 3,5 cm x 4,5 cm".
    // Federal Foreign Office: face 32–36 mm from the chin to the hairline, untinted glasses allowed.
    id: "schengen",
    widthMm: 35,
    heightMm: 45,
    head: { minMm: 32, maxMm: 36, to: "hairline", official: true },
    background: "white",
    glasses: "untinted",
    sources: [
      { label: "Germaniya elchixonasi, Toshkent", url: "https://taschkent.diplo.de/uz-uz/service/05-visaeinreise/2435518-2435518" },
      {
        label: "Auswärtiges Amt — biometric photos (2022)",
        url: "https://hongkong.diplo.de/resource/blob/2572988/11fbf86d05a1668f0488a650e7d50aa6/biometric-passport-photos-d-e-data.pdf",
      },
    ],
  },
  {
    id: "usa",
    widthMm: inch(2),
    heightMm: inch(2),
    inches: 2,
    head: { minMm: inch(1), maxMm: inch(1.375), to: "hair", official: true },
    eyesFromBottomMm: [inch(1.125), inch(1.375)],
    digital: { minPx: 600, maxPx: 1200, maxKb: 240 },
    background: "whiteOffWhite",
    glasses: "no",
    recentMonths: 6,
    sources: [
      { label: "U.S. Department of State — Photo Requirements", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html" },
      {
        label: "U.S. Department of State — Digital Image Requirements",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html",
      },
      { label: "9 FAM 303.6 — eye level", url: "https://fam.state.gov/fam/09FAM/09FAM030306.html" },
    ],
  },
  {
    id: "canada",
    widthMm: 35,
    heightMm: 45,
    head: { minMm: 31, maxMm: 36, to: "crown", official: true },
    background: "whiteOrLight",
    glasses: "untinted",
    recentMonths: 6,
    sources: [
      {
        label: "IRCC — Temporary resident visa photo specifications",
        url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/temporary-resident-visa-application-photograph-specifications.html",
      },
    ],
  },
  {
    // The embassy's form: "45mm × 45mm or 2in × 2in". No head size, so the guide uses the US proportions.
    id: "japan",
    widthMm: 45,
    heightMm: 45,
    head: { minMm: 22.5, maxMm: 31, to: "hair", official: false },
    background: "notStated",
    glasses: "notStated",
    sources: [{ label: "Yaponiya elchixonasi, Toshkent — viza anketasi", url: "https://www.uz.emb-japan.go.jp/files/100609488.pdf" }],
  },
  {
    // "3.5cm x 4.5cm … on white background, taken within the past six months". No head size.
    id: "south-korea",
    widthMm: 35,
    heightMm: 45,
    head: { minMm: 32, maxMm: 36, to: "crown", official: false },
    background: "white",
    glasses: "notStated",
    recentMonths: 6,
    sources: [{ label: "Korea Respublikasi elchixonasi — C-3-9 viza", url: "https://overseas.mofa.go.kr/se-en/brd/m_27867/view.do?seq=12" }],
  },
];

export const PHOTO_SPEC_BY_ID = Object.fromEntries(PHOTO_SPECS.map((s) => [s.id, s])) as Record<PhotoSpecId, PhotoSpec>;

export const MM_PER_INCH = 25.4;
export const mmToPx = (mm: number, dpi: number) => Math.round((mm / MM_PER_INCH) * dpi);

/** Print quality floor: below this many source pixels per inch the photo looks soft. */
export const MIN_DPI = 300;
/** Resolution of the downloaded single photo and of the print sheet */
export const PHOTO_DPI = 600;
export const SHEET_DPI = 300;

/** Guide lines, in mm from the top edge: the chin line, the band for the top of the face or head, the eye band. */
export function guideLines(spec: PhotoSpec) {
  const { minMm, maxMm, to } = spec.head;
  const mid = (minMm + maxMm) / 2;
  // A face measured to the hairline is centred (the German rule); a head
  // measured to the crown or the hair sits higher, leaving room for the shoulders.
  const above = (spec.heightMm - mid) * (to === "hairline" ? 1 / 2 : 1 / 3);
  const chin = above + mid;
  return {
    chin,
    /** The top line for the largest allowed head … */
    topHigh: chin - maxMm,
    /** … and for the smallest */
    topLow: chin - minMm,
    eyes: spec.eyesFromBottomMm
      ? ([spec.heightMm - spec.eyesFromBottomMm[1], spec.heightMm - spec.eyesFromBottomMm[0]] as [number, number])
      : null,
  };
}

/** A 10×15 cm photo print (4×6 in), landscape */
export const SHEET = { widthMm: 152.4, heightMm: 101.6 };

/** As many copies as fit on the print, centred, with room to cut between them. */
export function sheetLayout(spec: PhotoSpec, marginMm = 2, gapMm = 2) {
  const fit = (room: number, size: number) => Math.max(0, Math.floor((room - 2 * marginMm + gapMm) / (size + gapMm)));
  const cols = fit(SHEET.widthMm, spec.widthMm);
  const rows = fit(SHEET.heightMm, spec.heightMm);
  const x0 = (SHEET.widthMm - (cols * spec.widthMm + (cols - 1) * gapMm)) / 2;
  const y0 = (SHEET.heightMm - (rows * spec.heightMm + (rows - 1) * gapMm)) / 2;
  const positions: { xMm: number; yMm: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) positions.push({ xMm: x0 + c * (spec.widthMm + gapMm), yMm: y0 + r * (spec.heightMm + gapMm) });
  }
  return { cols, rows, count: cols * rows, positions };
}

/** How the picture sits in the frame. dx, dy move its centre, as a share of the frame's width and height. */
export interface Placement {
  zoom: number;
  dx: number;
  dy: number;
  rotateDeg: number;
}

export const START: Placement = { zoom: 1, dx: 0, dy: 0, rotateDeg: 0 };
export const ZOOM_MAX = 6;
export const ROTATE_MAX = 15;

/** Scale of an iw×ih picture drawn on a W×H canvas: zoom 1 just covers the frame. */
export const drawScale = (iw: number, ih: number, W: number, H: number, zoom: number) => Math.max(W / iw, H / ih) * zoom;

/**
 * Whether the picture covers the whole W×H frame, with no empty corner.
 * Drawing: translate to the centre, rotate, scale, draw the picture centred.
 */
export function coversFrame(p: Placement, iw: number, ih: number, W: number, H: number) {
  const s = drawScale(iw, ih, W, H, p.zoom);
  const cx = W / 2 + p.dx * W;
  const cy = H / 2 + p.dy * H;
  const a = (p.rotateDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const slack = 0.5; // half a source pixel
  return [
    [0, 0],
    [W, 0],
    [0, H],
    [W, H],
  ].every(([x, y]) => {
    const rx = x! - cx;
    const ry = y! - cy;
    const u = (rx * cos + ry * sin) / s + iw / 2;
    const v = (-rx * sin + ry * cos) / s + ih / 2;
    return u >= -slack && u <= iw + slack && v >= -slack && v <= ih + slack;
  });
}

/** Source pixels per inch of the printed photo at this zoom */
export function sourceDpi(spec: PhotoSpec, iw: number, ih: number, zoom: number) {
  const pxAcross = spec.widthMm / drawScale(iw, ih, spec.widthMm, spec.heightMm, zoom);
  return pxAcross / (spec.widthMm / MM_PER_INCH);
}

/** Mean and spread of brightness (0–255) over RGBA pixels */
export function brightness(rgba: ArrayLike<number>) {
  let n = 0;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const y = 0.2126 * rgba[i]! + 0.7152 * rgba[i + 1]! + 0.0722 * rgba[i + 2]!;
    n++;
    sum += y;
    sumSq += y * y;
  }
  if (!n) return { mean: 0, spread: 0 };
  const mean = sum / n;
  return { mean, spread: Math.sqrt(Math.max(0, sumSq / n - mean * mean)) };
}

/** Rough check of the corners beside the head: light and even. Not a compliance check. */
export const looksPlainLight = ({ mean, spread }: { mean: number; spread: number }) => mean >= 185 && spread <= 30;
