"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// White, light violet and champagne gold — tuned to read on the pastel wash
const COLORS = ["255, 255, 255", "167, 139, 250", "236, 190, 80"];
const COLOR_WEIGHTS = [0.5, 0.32, 0.18];

type Star = { x: number; y: number; r: number; color: number; alpha: number; phase: number; speed: number; depth: number; glint: boolean };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; age: number; length: number; bright: boolean };

function pickColor() {
  const roll = Math.random();
  let acc = 0;
  for (let i = 0; i < COLOR_WEIGHTS.length; i++) {
    acc += COLOR_WEIGHTS[i]!;
    if (roll < acc) return i;
  }
  return 0;
}

/** Soft round sprite per colour, drawn once and scaled per star. */
function makeSprite(rgb: string) {
  const size = 32;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(0.25, `rgba(${rgb}, 0.85)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * Decorative sky for the hero: twinkling stars drifting slowly down-right (the
 * brightest with a four-point glint), a meteor every 0.7–2s (often two or three
 * at once, now and then a bright one with a long tail) and a faint parallax
 * toward the pointer. Pauses off screen and in background tabs; static (no
 * meteors) for reduced motion; fewer stars on phones. `ambient` is the quiet
 * page-wide version (AmbientSky): fewer, softer stars, an occasional meteor,
 * drawn at 30fps. `calm` is kept for existing callers and changes nothing now
 * that the planes are gone.
 */
export function Starfield({ className, calm = false, ambient = false }: { className?: string; calm?: boolean; ambient?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const sprites = COLORS.map(makeSprite);
    const count = ambient ? (phone ? 70 : 150) : phone ? 240 : 480;
    // Pause between meteor showers, in ms
    const [gapMin, gapMax] = ambient ? [2600, 6200] : [700, 2000];
    const stars: Star[] = Array.from({ length: count }, () => {
      const r = 0.5 + Math.random() ** 2.4 * 1.9;
      return {
        x: Math.random(),
        y: Math.random(),
        r,
        color: pickColor(),
        alpha: (0.45 + Math.random() * 0.5) * (ambient ? 0.8 : 1),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.6,
        depth: 0.25 + Math.random() * 0.75,
        glint: r > 1.3 && Math.random() < 0.5,
      };
    });
    const meteors: Meteor[] = [];
    let nextMeteor = performance.now() + 400 + Math.random() * (ambient ? 2400 : 700);

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(performance.now(), 0);
    };

    // Pointer parallax, eased so the field never jumps
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const draw = (now: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.classList.contains("dark");
      // White doesn't show on the light canvas, so the quiet sky trades it for violet there
      const tone = (c: number) => (ambient && !dark && c === 0 ? 1 : c);
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 2);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 2);
      const t = now / 1000;

      for (const s of stars) {
        if (!reduced) {
          // A few minutes to cross the hero — barely-there motion
          s.x += 0.0035 * s.depth * dt;
          s.y += 0.006 * s.depth * dt;
          if (s.x > 1.02) s.x -= 1.04;
          if (s.y > 1.02) s.y -= 1.04;
        }
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        const px = s.x * w - pointer.x * 10 * s.depth;
        const py = s.y * h - pointer.y * 8 * s.depth;
        const size = s.r * 3.2;
        const c = tone(s.color);
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.drawImage(sprites[c]!, px - size / 2, py - size / 2, size, size);
        if (s.glint) {
          // Four-point glint that breathes with the twinkle
          const ray = size * (1.4 + 1.4 * twinkle);
          ctx.globalAlpha = s.alpha * twinkle * 0.75;
          ctx.strokeStyle = `rgb(${COLORS[c]})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(px - ray, py);
          ctx.lineTo(px + ray, py);
          ctx.moveTo(px, py - ray);
          ctx.lineTo(px, py + ray);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      if (reduced) return;
      if (now > nextMeteor) {
        // Often one or two more follow a moment later from elsewhere
        const roll = Math.random();
        const burst = ambient ? 1 : roll < 0.18 ? 3 : roll < 0.55 ? 2 : 1;
        for (let k = 0; k < burst; k++) {
          const fromTop = Math.random() < 0.6;
          const bright = Math.random() < (ambient ? 0.15 : 0.22);
          meteors.push({
            x: fromTop ? w * (0.2 + Math.random() * 0.75) : w + 20,
            y: fromTop ? -20 : h * Math.random() * 0.5,
            vx: -(520 + Math.random() * 260),
            vy: 300 + Math.random() * 160,
            life: (bright ? 1.4 : 1.1) + Math.random() * 0.5,
            age: -k * (0.25 + Math.random() * 0.35),
            length: bright ? 220 + Math.random() * 120 : 120 + Math.random() * 90,
            bright,
          });
        }
        nextMeteor = now + gapMin + Math.random() * (gapMax - gapMin);
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]!;
        m.age += dt;
        if (m.age < 0) continue;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const fade = Math.sin(Math.min(1, m.age / m.life) * Math.PI);
        if (m.age > m.life) {
          meteors.splice(i, 1);
          continue;
        }
        const speed = Math.hypot(m.vx, m.vy);
        const tailX = m.x - (m.vx / speed) * m.length;
        const tailY = m.y - (m.vy / speed) * m.length;
        const head = tone(0);
        const trail = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        trail.addColorStop(0, `rgba(${COLORS[head]}, ${0.95 * fade})`);
        trail.addColorStop(0.25, `rgba(167, 139, 250, ${0.8 * fade})`);
        trail.addColorStop(1, "rgba(236, 190, 80, 0)");
        ctx.strokeStyle = trail;
        ctx.lineWidth = m.bright ? 2.6 : 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        if (m.bright) {
          // Soft halo around the head of a bright one
          ctx.globalAlpha = 0.45 * fade;
          ctx.drawImage(sprites[head]!, m.x - 14, m.y - 14, 28, 28);
        }
        ctx.globalAlpha = fade;
        ctx.drawImage(sprites[head]!, m.x - 5, m.y - 5, 10, 10);
        ctx.globalAlpha = 1;
      }
    };

    let frame = 0;
    let last = performance.now();
    let visible = true;
    // The quiet sky sits behind whole pages, so it draws every other frame
    const minFrame = ambient ? 32 : 0;
    const loop = (now: number) => {
      if (now - last >= minFrame) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        draw(now, dt);
      }
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [ambient]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
