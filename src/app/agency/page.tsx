import { Users, FileSearch2, ShieldAlert, UserCog, Building2, Gauge } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ClientTable } from "@/components/agency/ClientTable";
import { AGENCY_NAV, AGENCY_OVERVIEW, AGENCY_CLIENTS } from "@/data/mockData";

export default function AgencyPage() {
  const priorityCases = AGENCY_CLIENTS.filter(
    (c) => c.riskFactors.length > 0 || c.status === "Konsultatsiya kerak"
  );

  return (
    <DashboardShell
      title="Agentlik boshqaruv paneli"
      subtitle="Barcha mijozlaringiz va arizalar bo'yicha umumiy ko'rinish."
      navItems={AGENCY_NAV}
      showOnboarding={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Jami mijozlar" value={String(AGENCY_OVERVIEW.totalClients)} />
        <StatCard icon={FileSearch2} label="Faol arizalar" value={String(AGENCY_OVERVIEW.activeApplications)} />
        <StatCard icon={ShieldAlert} label="Yuqori xavfli holatlar" value={String(AGENCY_OVERVIEW.highRiskCases)} />
        <StatCard icon={UserCog} label="Konsultatsiyalar" value={String(AGENCY_OVERVIEW.consultations)} />
        <StatCard icon={Building2} label="Jamoa a'zolari" value={String(AGENCY_OVERVIEW.teamMembers)} />
        <StatCard icon={Gauge} label="Oylik foydalanish" value={AGENCY_OVERVIEW.monthlyUsage} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 dark:border-white/10 dark:bg-navy-800 lg:col-span-2">
          <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
            So&apos;nggi mijoz faoliyati
          </p>
          <ul className="space-y-3">
            {AGENCY_CLIENTS.slice(0, 4).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-body-sm">
                <span className="text-ink-700 dark:text-white/70">
                  {c.name} — {c.lastUpdate}
                </span>
                <span className="font-semibold text-ink-900 dark:text-white">
                  {c.readinessScore}/100
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
          <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
            Ustuvor holatlar
          </p>
          <ul className="space-y-3">
            {priorityCases.map((c) => (
              <li key={c.id} className="text-body-sm">
                <p className="font-medium text-ink-900 dark:text-white">{c.name}</p>
                <p className="text-caption text-ink-400 dark:text-white/40">
                  {c.riskFactors[0] ?? "Konsultatsiya kerak"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
          Barcha mijozlar
        </p>
        <ClientTable clients={AGENCY_CLIENTS} />
      </div>
    </DashboardShell>
  );
}
