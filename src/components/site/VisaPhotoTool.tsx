"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Download, ExternalLink, ImagePlus, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Flag } from "@/components/site/Flag";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS } from "@/lib/site/registry";
import {
  PHOTO_DPI,
  PHOTO_SPECS,
  PHOTO_SPEC_BY_ID,
  ROTATE_MAX,
  SHEET,
  SHEET_DPI,
  MIN_DPI,
  START,
  ZOOM_MAX,
  brightness,
  coversFrame,
  drawScale,
  guideLines,
  looksPlainLight,
  mmToPx,
  sheetLayout,
  sourceDpi,
  type Placement,
  type PhotoSpec,
  type PhotoSpecId,
} from "@/lib/site/visa-photo";
import { cn } from "@/lib/utils";

const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [key, value]) => out.split(`{${key}}`).join(String(value)), text);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const card = "rounded-[28px] border border-surface-border bg-surface p-5 shadow-xs sm:p-7";
const label = "mb-1.5 block text-caption font-semibold text-ink-600";

/** Draws the picture on the canvas as placed: white first, so an uncovered corner prints white. */
function paint(canvas: HTMLCanvasElement, img: HTMLImageElement, p: Placement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  const s = drawScale(img.naturalWidth, img.naturalHeight, W, H, p.zoom);
  ctx.save();
  ctx.translate(W / 2 + p.dx * W, H / 2 + p.dy * H);
  ctx.rotate((p.rotateDeg * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

function render(img: HTMLImageElement, p: Placement, W: number, H: number) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  paint(canvas, img, p);
  return canvas;
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

/** The best JPEG quality that stays under the size limit */
async function jpegUnder(canvas: HTMLCanvasElement, maxBytes: number) {
  for (let q = 0.95; q > 0.4; q -= 0.05) {
    const blob = await toJpeg(canvas, q);
    if (blob && blob.size <= maxBytes) return blob;
  }
  return toJpeg(canvas, 0.4);
}

function save(blob: Blob | null, name: string) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The guide lines over the frame, drawn in millimetres */
function Guides({ spec }: { spec: PhotoSpec }) {
  const g = guideLines(spec);
  const w = spec.widthMm;
  const top = (g.topHigh + g.topLow) / 2;
  const line = { vectorEffect: "non-scaling-stroke" as const, strokeWidth: 1.5 };
  return (
    <svg viewBox={`0 0 ${w} ${spec.heightMm}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <rect x={0} y={g.topHigh} width={w} height={g.topLow - g.topHigh} fill="rgba(124,58,237,0.16)" />
      <line x1={0} x2={w} y1={g.topHigh} y2={g.topHigh} stroke="#7c3aed" strokeDasharray="5 4" {...line} />
      <line x1={0} x2={w} y1={g.topLow} y2={g.topLow} stroke="#7c3aed" strokeDasharray="5 4" {...line} />
      {g.eyes && (
        <>
          <rect x={0} y={g.eyes[0]} width={w} height={g.eyes[1] - g.eyes[0]} fill="rgba(14,165,233,0.14)" />
          <line x1={0} x2={w} y1={g.eyes[0]} y2={g.eyes[0]} stroke="#0284c7" strokeDasharray="3 3" {...line} />
          <line x1={0} x2={w} y1={g.eyes[1]} y2={g.eyes[1]} stroke="#0284c7" strokeDasharray="3 3" {...line} />
        </>
      )}
      <line x1={w / 2} x2={w / 2} y1={0} y2={spec.heightMm} stroke="rgba(15,23,42,0.35)" strokeDasharray="2 4" {...line} strokeWidth={1} />
      <ellipse
        cx={w / 2}
        cy={(top + g.chin) / 2}
        rx={((g.chin - top) / 2) * 0.72}
        ry={(g.chin - top) / 2}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeDasharray="4 4"
        {...line}
      />
      <line x1={0} x2={w} y1={g.chin} y2={g.chin} stroke="#059669" {...line} strokeWidth={2} />
    </svg>
  );
}

export function VisaPhotoTool() {
  const site = useSite();
  const c = site.visaPhoto;
  const [specId, setSpecId] = useState<PhotoSpecId>("schengen");
  const spec = PHOTO_SPEC_BY_ID[specId];
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [p, setP] = useState<Placement>(START);
  const [loadError, setLoadError] = useState(false);
  const [boxW, setBoxW] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const fmt = (mm: number) => String(Math.round(mm * 10) / 10).replace(".", c.decimal);
  const boxH = (boxW * spec.heightMm) / spec.widthMm;

  // The frame's on-screen width, for the preview canvas and for dragging.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBoxW(entry!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !boxW) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(boxW * dpr);
    canvas.height = Math.round(boxH * dpr);
    paint(canvas, img, p);
  }, [img, p, boxW, boxH]);

  // Wheel zoom needs a non-passive listener to keep the page from scrolling.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !img) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setP((prev) => ({ ...prev, zoom: clamp(prev.zoom * Math.exp(-e.deltaY * 0.0015), 1, ZOOM_MAX) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [img]);

  useEffect(() => () => void (urlRef.current && URL.revokeObjectURL(urlRef.current)), []);

  function open(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoadError(true);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setImg(image);
      setP(START);
      setLoadError(false);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setLoadError(true);
    };
    image.src = url;
  }

  const move = (dx: number, dy: number) => setP((prev) => ({ ...prev, dx: clamp(prev.dx + dx, -1, 1), dy: clamp(prev.dy + dy, -1, 1) }));

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!img) return;
    const step = e.shiftKey ? 0.02 : 0.005;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      move(...moves[e.key]!);
    } else if (e.key === "+" || e.key === "=" || e.key === "-") {
      e.preventDefault();
      setP((prev) => ({ ...prev, zoom: clamp(prev.zoom * (e.key === "-" ? 1 / 1.05 : 1.05), 1, ZOOM_MAX) }));
    }
  }

  const checks = useMemo(() => {
    if (!img) return null;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const dpi = sourceDpi(spec, iw, ih, p.zoom);
    // The top corners beside the head are background in a correctly placed photo.
    const small = render(img, p, 140, Math.round((140 * spec.heightMm) / spec.widthMm));
    const ctx = small.getContext("2d");
    const pw = Math.round(small.width * 0.18);
    const ph = Math.round(small.height * 0.14);
    const corners = ctx ? [...ctx.getImageData(0, 0, pw, ph).data, ...ctx.getImageData(small.width - pw, 0, pw, ph).data] : [];
    return {
      covered: coversFrame(p, iw, ih, spec.widthMm, spec.heightMm),
      dpi: Math.round(dpi),
      sharp: dpi >= MIN_DPI,
      plain: looksPlainLight(brightness(corners)),
    };
  }, [img, p, spec]);

  const layout = sheetLayout(spec);
  const photoPx = spec.digital
    ? { w: spec.digital.minPx, h: spec.digital.minPx }
    : { w: mmToPx(spec.widthMm, PHOTO_DPI), h: mmToPx(spec.heightMm, PHOTO_DPI) };

  async function downloadPhoto() {
    if (!img) return;
    const canvas = render(img, p, photoPx.w, photoPx.h);
    const blob = spec.digital ? await jpegUnder(canvas, spec.digital.maxKb * 1000) : await toJpeg(canvas, 0.95);
    save(blob, `vizar-visa-photo-${spec.id}-${photoPx.w}x${photoPx.h}.jpg`);
  }

  async function downloadSheet() {
    if (!img) return;
    const sheet = document.createElement("canvas");
    sheet.width = mmToPx(SHEET.widthMm, SHEET_DPI);
    sheet.height = mmToPx(SHEET.heightMm, SHEET_DPI);
    const ctx = sheet.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    const w = mmToPx(spec.widthMm, SHEET_DPI);
    const h = mmToPx(spec.heightMm, SHEET_DPI);
    const one = render(img, p, w, h);
    ctx.strokeStyle = "#c8c8c8";
    ctx.lineWidth = 1;
    for (const pos of layout.positions) {
      const x = mmToPx(pos.xMm, SHEET_DPI);
      const y = mmToPx(pos.yMm, SHEET_DPI);
      ctx.drawImage(one, x, y);
      ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1); // cut line just outside the photo
    }
    save(await toJpeg(sheet, 0.95), `vizar-visa-photo-sheet-10x15-${spec.id}.jpg`);
  }

  const rows: [string, string][] = [
    [
      c.rows.size,
      fill(c.sizeValue, { w: fmt(spec.widthMm), h: fmt(spec.heightMm) }) + (spec.inches ? ` (${fill(c.inchValue, { n: spec.inches })})` : ""),
    ],
    [
      c.rows.head,
      fill(c.headValue, { min: fmt(spec.head.minMm), max: fmt(spec.head.maxMm), to: c.headTo[spec.head.to] }) +
        (spec.head.official ? "" : ` — ${c.approx}`),
    ],
    ...(spec.eyesFromBottomMm ? [[c.rows.eyes, fill(c.eyesValue, { min: fmt(spec.eyesFromBottomMm[0]), max: fmt(spec.eyesFromBottomMm[1]) })] as [string, string]] : []),
    ...(spec.digital
      ? [[c.rows.digital, fill(c.digitalValue, { min: spec.digital.minPx, max: spec.digital.maxPx, kb: spec.digital.maxKb })] as [string, string]]
      : []),
    [c.rows.background, c.background[spec.background]],
    [c.rows.glasses, c.glasses[spec.glasses]],
    [c.rows.recent, spec.recentMonths ? fill(c.recentValue, { n: spec.recentMonths }) : c.notStated],
  ];

  const check = (ok: boolean, text: string) => (
    <li className={cn("flex gap-2 text-body-sm", ok ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>
      <span aria-hidden="true" className="shrink-0">
        {ok ? "✓" : "⚠️"}
      </span>
      <span>{text}</span>
    </li>
  );

  return (
    <>
      <PageHero emoji="📸" decor={["🛂", "🖼️", "✂️"]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

      <section className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-5">
          <div className={cn(card, "lg:col-span-3")}>
            <p className={label}>{c.countryLabel}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={c.countryLabel}>
              {PHOTO_SPECS.map((s) => {
                const flag = DESTINATIONS.find((d) => d.slug === s.id)!.flag;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === specId}
                    onClick={() => setSpecId(s.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-body-sm font-semibold transition-colors",
                      s.id === specId ? "border-brand-400 bg-brand-50 text-brand-800 dark:text-brand-200" : "border-surface-border text-ink-700 hover:bg-surface-tint"
                    )}
                  >
                    <Flag code={flag} size={20} />
                    {site.destinations[s.id].name}
                    <span className="text-caption font-medium text-ink-500">
                      {fmt(s.widthMm)}×{fmt(s.heightMm)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,300px)_1fr] sm:items-start">
              <div>
                <div
                  ref={frameRef}
                  role={img ? "application" : undefined}
                  aria-label={img ? c.editorLabel : undefined}
                  tabIndex={img ? 0 : undefined}
                  onKeyDown={onKey}
                  onPointerDown={(e) => {
                    if (!img) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = { x: e.clientX, y: e.clientY };
                  }}
                  onPointerMove={(e) => {
                    const d = drag.current;
                    if (!d || !boxW) return;
                    move((e.clientX - d.x) / boxW, (e.clientY - d.y) / boxH);
                    drag.current = { x: e.clientX, y: e.clientY };
                  }}
                  onPointerUp={() => (drag.current = null)}
                  onPointerCancel={() => (drag.current = null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    open(e.dataTransfer.files[0]);
                  }}
                  style={{ aspectRatio: `${spec.widthMm} / ${spec.heightMm}` }}
                  className={cn(
                    "relative w-full touch-none overflow-hidden rounded-md bg-white outline-none ring-1 ring-surface-border focus-visible:ring-2 focus-visible:ring-brand-500",
                    img ? "cursor-grab active:cursor-grabbing" : "border-2 border-dashed border-surface-border"
                  )}
                >
                  {img ? (
                    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-body-sm font-semibold text-ink-500 hover:text-brand-700"
                    >
                      <ImagePlus size={28} aria-hidden="true" />
                      {c.upload}
                    </button>
                  )}
                  <Guides spec={spec} />
                </div>

                <ul className="mt-3 space-y-1 text-caption text-ink-600">
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-2.5 w-5 shrink-0 rounded-sm border-y-2 border-dashed border-violet-600 bg-violet-600/15" />
                    {c.legendTop[spec.head.to]}
                  </li>
                  {spec.eyesFromBottomMm && (
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-2.5 w-5 shrink-0 rounded-sm border-y-2 border-dashed border-sky-600 bg-sky-500/15" />
                      {c.legendEyes}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-0.5 w-5 shrink-0 bg-emerald-600" />
                    {c.legendChin}
                  </li>
                </ul>
                {!spec.head.official && <p className="mt-2 text-caption text-amber-700 dark:text-amber-300">{c.approxGuide}</p>}
              </div>

              <div className="min-w-0 space-y-4">
                <label className={buttonClasses({ variant: img ? "secondary" : "primary", size: "md", className: "cursor-pointer" })}>
                  <ImagePlus size={16} aria-hidden="true" /> {img ? c.replace : c.upload}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      open(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="text-caption text-ink-500">{c.uploadHint}</p>
                {loadError && (
                  <p role="alert" className="text-body-sm font-medium text-red-600">
                    {c.loadError}
                  </p>
                )}

                {img && (
                  <>
                    <p className="text-caption text-ink-600">{c.editorHint}</p>
                    <div>
                      <label htmlFor="photo-zoom" className={label}>
                        {c.zoom}
                      </label>
                      <input
                        id="photo-zoom"
                        type="range"
                        min={1}
                        max={ZOOM_MAX}
                        step={0.01}
                        value={p.zoom}
                        onChange={(e) => setP((prev) => ({ ...prev, zoom: Number(e.target.value) }))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="photo-rotate" className={label}>
                        {c.rotate} ({p.rotateDeg > 0 ? "+" : ""}
                        {fmt(p.rotateDeg)}°)
                      </label>
                      <input
                        id="photo-rotate"
                        type="range"
                        min={-ROTATE_MAX}
                        max={ROTATE_MAX}
                        step={0.5}
                        value={p.rotateDeg}
                        onChange={(e) => setP((prev) => ({ ...prev, rotateDeg: Number(e.target.value) }))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setP(START)}>
                      <RotateCcw size={14} aria-hidden="true" /> {c.reset}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className={card} aria-live="polite">
              <h2 className="text-body-sm font-semibold uppercase tracking-[0.08em] text-ink-500">{c.checksTitle}</h2>
              {checks ? (
                <ul className="mt-4 space-y-2">
                  {check(checks.covered, checks.covered ? c.checkCovered : c.checkUncovered)}
                  {check(checks.sharp, fill(checks.sharp ? c.checkSharp : c.checkBlurry, { dpi: checks.dpi }))}
                  {check(checks.plain, checks.plain ? c.checkBackground : c.checkBackgroundWarn)}
                </ul>
              ) : null}
              <p className="mt-4 text-caption text-ink-500">{c.checkManual}</p>

              <div className="mt-5 flex flex-col gap-2 border-t border-surface-border pt-5">
                <Button type="button" disabled={!img} onClick={() => void downloadPhoto()}>
                  <Download size={16} aria-hidden="true" />
                  {spec.digital
                    ? fill(c.downloadDigital, { px: spec.digital.minPx, kb: spec.digital.maxKb })
                    : fill(c.downloadPhoto, { w: photoPx.w, h: photoPx.h })}
                </Button>
                <Button type="button" variant="secondary" disabled={!img} onClick={() => void downloadSheet()}>
                  <Printer size={16} aria-hidden="true" /> {fill(c.downloadSheet, { n: layout.count })}
                </Button>
                <p className="mt-1 text-caption text-ink-500">{c.printHint}</p>
              </div>
            </div>

            <p className="flex gap-2 rounded-[24px] border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              {c.privacy}
            </p>
          </div>

          <div className={cn(card, "lg:col-span-3")}>
            <h2 className="flex items-center gap-2 text-body font-semibold text-ink-950">
              <span aria-hidden="true">📏</span> {c.requirementsTitle} — {site.destinations[spec.id].name}
            </h2>
            <dl className="mt-4 divide-y divide-surface-border">
              {rows.map(([term, value]) => (
                <div key={term} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-caption font-semibold text-ink-600">{term}</dt>
                  <dd className="text-body-sm text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{c.sourcesTitle}</p>
            <ul className="mt-2 space-y-1.5">
              {spec.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    {s.label} <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-body-sm text-ink-600">🇬🇧 {c.ukNote}</p>
          </div>

          <div className={cn(card, "lg:col-span-2")}>
            <h2 className="flex items-center gap-2 text-body font-semibold text-ink-950">
              <span aria-hidden="true">🤳</span> {c.tipsTitle}
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body-sm text-ink-700">
              {c.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-700 dark:border-amber-400/20 dark:bg-amber-400/10 lg:col-span-5">
            ⚠️ {c.disclaimer}
          </p>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
