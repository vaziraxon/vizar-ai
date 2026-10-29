"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// White, light violet and champagne gold — tuned to read on the pastel wash
const COLORS = ["255, 255, 255", "167, 139, 250", "236, 190, 80"];
const COLOR_WEIGHTS = [0.5, 0.32, 0.18];

type Star = { x: number; y: number; r: number; color: number; alpha: number; phase: number; speed: number; depth: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; age: number; length: number };

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
 * Decorative star field for the hero: twinkling stars drifting slowly
 * down-right, a thin meteor every 2.5–5.5s (now and then two at once), and a
 * faint parallax toward the pointer. Pauses off screen and in background tabs;
 * static (no meteors) for reduced motion; fewer stars on phones.
 */
export function Starfield({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const sprites = COLORS.map(makeSprite);
    const count = phone ? 110 : 230;
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() ** 2.4 * 1.9,
      color: pickColor(),
      alpha: 0.45 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.6,
      depth: 0.25 + Math.random() * 0.75,
    }));
    const meteors: Meteor[] = [];
    let nextMeteor = performance.now() + 1200 + Math.random() * 1800;

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
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.drawImage(sprites[s.color]!, px - size / 2, py - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      if (reduced) return;
      if (now > nextMeteor) {
        // Sometimes a second one follows a moment later from elsewhere
        const burst = Math.random() < 0.3 ? 2 : 1;
        for (let k = 0; k < burst; k++) {
          const fromTop = Math.random() < 0.6;
          meteors.push({
            x: fromTop ? w * (0.2 + Math.random() * 0.75) : w + 20,
            y: fromTop ? -20 : h * Math.random() * 0.5,
            vx: -(520 + Math.random() * 260),
            vy: 300 + Math.random() * 160,
            life: 1.1 + Math.random() * 0.5,
            age: -k * (0.25 + Math.random() * 0.35),
            length: 120 + Math.random() * 90,
          });
        }
        nextMeteor = now + 2500 + Math.random() * 3000;
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
        const trail = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        trail.addColorStop(0, `rgba(255, 255, 255, ${0.95 * fade})`);
        trail.addColorStop(0.25, `rgba(196, 181, 253, ${0.55 * fade})`);
        trail.addColorStop(1, "rgba(236, 190, 80, 0)");
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.drawImage(sprites[0]!, m.x - 5, m.y - 5, 10, 10);
        ctx.globalAlpha = 1;
      }
    };

    let frame = 0;
    let last = performance.now();
    let visible = true;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(now, dt);
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
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
