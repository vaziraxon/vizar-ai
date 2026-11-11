import { Starfield } from "@/components/site/home/Starfield";

/**
 * A quiet star field fixed behind a whole page (landing, dashboard): soft
 * twinkling stars and an occasional meteor in the gaps between sections and
 * cards. The parent needs `isolate` so the layer sits above its background
 * and below everything else.
 */
export function AmbientSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <Starfield ambient />
    </div>
  );
}
