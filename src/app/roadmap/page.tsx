import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Rocket } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ROADMAP_ITEMS } from "@/data/mockData";
import type { RoadmapStage } from "@/types";

const STAGE_META: Record<
  RoadmapStage,
  { label: string; icon: typeof CheckCircle2; accent: string }
> = {
  completed: { label: "Bajarildi", icon: CheckCircle2, accent: "border-success/30 bg-success/5" },
  in_progress: { label: "Jarayonda", icon: Loader2, accent: "border-brand-300/40 bg-brand-50 dark:bg-brand-900/10" },
  future: { label: "Kelajakda", icon: Rocket, accent: "border-surface-border bg-surface-tint dark:border-white/10 dark:bg-white/5" },
};

export default function RoadmapPage() {
  const stages: RoadmapStage[] = ["completed", "in_progress", "future"];

  return (
    <div className="min-h-screen bg-surface dark:bg-navy-950">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-ink-700 hover:text-ink-900 dark:text-white/70 dark:hover:text-white"
        >
          <ArrowLeft size={15} /> Bosh sahifaga qaytish
        </Link>
      </div>

      <div className="container-page pb-20 pt-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600 dark:border-brand-400/20 dark:bg-brand-900/20">
          Mahsulot yo&apos;nalishi
        </span>
        <h1 className="mt-5 font-display text-display-lg text-ink-900 dark:text-white">
          VIZAR AI rivojlanish rejasi
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-body-lg text-ink-600 dark:text-white/60">
          Bugungi holat va kelgusi qadamlarimiz — grant va investorlar uchun
          shaffof ko&apos;rinish.
        </p>
      </div>

      <div className="container-page grid gap-6 pb-24 lg:grid-cols-3">
        {stages.map((stage) => {
          const meta = STAGE_META[stage];
          const items = ROADMAP_ITEMS.filter((i) => i.stage === stage);
          return (
            <div key={stage} className={`rounded-2xl border p-5 ${meta.accent}`}>
              <p className="mb-4 flex items-center gap-2 font-display text-body font-semibold text-ink-900 dark:text-white">
                <meta.icon size={18} className={stage === "completed" ? "text-success" : stage === "in_progress" ? "text-brand-600" : "text-ink-400"} />
                {meta.label}
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-surface-border bg-white p-4 dark:border-white/10 dark:bg-navy-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white">
                        <item.icon size={15} />
                      </span>
                      <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-2 text-caption text-ink-600 dark:text-white/60">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
