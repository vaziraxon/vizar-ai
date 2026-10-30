import type { Ref } from "react";
import { Starfield } from "@/components/site/home/Starfield";

/**
 * The landing sky, for a section with `lime-wash grain relative overflow-hidden`:
 * violet, periwinkle and lime aurora blobs drifting slowly, the star field with
 * its meteors and planes, and a fade into the canvas at the bottom. Pass
 * `glowRef` to add the soft glow that follows the pointer; `calm` thins the planes.
 */
export function HeroSky({ glowRef, calm }: { glowRef?: Ref<HTMLSpanElement>; calm?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="absolute -left-32 top-24 h-[420px] w-[420px] animate-drift rounded-full bg-[#b3a4fc]/55 blur-[100px] dark:bg-violet-600/25 motion-reduce:animate-none" />
      <span className="absolute -right-24 -top-10 h-[480px] w-[480px] animate-drift rounded-full bg-[#bcd2f8]/60 blur-[110px] dark:bg-brand-600/20 [animation-delay:-6s] motion-reduce:animate-none" />
      <span className="absolute bottom-0 left-1/3 h-[340px] w-[560px] animate-drift rounded-full bg-[#e4f59a]/60 blur-[100px] dark:bg-citron-300/[0.06] [animation-delay:-12s] motion-reduce:animate-none" />
      {glowRef && (
        <span
          ref={glowRef}
          className="absolute left-0 top-0 h-[600px] w-[600px] translate-x-[55vw] translate-y-[10vh] rounded-full bg-white/40 blur-[110px] transition-transform duration-[1800ms] ease-premium dark:bg-violet-500/15"
        />
      )}
      <Starfield calm={calm} />
      <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-surface-canvas/0 to-surface-canvas" />
    </div>
  );
}
