import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { FinalCTA } from "@/components/site/FinalCTA";
import { VIOLET_LEMON_STAGE } from "@/components/site/landing-styles";
import { PageHero } from "@/components/site/PageHero";
import { ROADMAP_ITEMS } from "@/data/mockData";
import type { RoadmapStage } from "@/types";

const STAGE_META: Record<
  RoadmapStage,
  { label: string; icon: typeof CheckCircle2; accent: string }
> = {
  completed: { label: "Bajarildi", icon: CheckCircle2, accent: "border border-success/30 bg-success/5" },
  in_progress: { label: "Jarayonda", icon: Loader2, accent: VIOLET_LEMON_STAGE },
  future: { label: "Kelajakda", icon: Rocket, accent: "border border-surface-border bg-surface-tint" },
};

export default function RoadmapPage() {
  const stages: RoadmapStage[] = ["completed", "in_progress", "future"];

  return (
    <>
      <PageHero
        emoji="🗺️"
        decor={["✅", "🚧", "🚀"]}
        eyebrow="Mahsulot yo'nalishi"
        title="VIZAR AI rivojlanish rejasi"
        subtitle="Bugungi holat va kelgusi qadamlarimiz — shaffof ko'rinish."
      />

      <div className="container-page grid gap-5 pb-12 pt-8 md:pb-14 md:pt-10 lg:grid-cols-3 lg:pb-16">
        {stages.map((stage) => {
          const meta = STAGE_META[stage];
          const items = ROADMAP_ITEMS.filter((i) => i.stage === stage);
          return (
            <div key={stage} className={`rounded-[28px] p-5 ${meta.accent}`}>
              <p className="luxe-firm mb-4 flex items-center gap-2 font-luxe text-[1.4rem] font-semibold leading-tight text-ink-950">
                <meta.icon size={18} className={stage === "completed" ? "text-success" : stage === "in_progress" ? "text-violet-600 dark:text-citron-300" : "text-ink-400"} />
                {meta.label}
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-surface-border bg-surface p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:text-violet-400">
                        <item.icon size={15} />
                      </span>
                      <p className="text-body-sm font-semibold text-ink-900">{item.title}</p>
                    </div>
                    <p className="mt-2 text-caption text-ink-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <FinalCTA />
    </>
  );
}
