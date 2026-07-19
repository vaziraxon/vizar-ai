import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DemoDataBanner } from "@/components/investor/DemoDataBanner";
import { KpiCard } from "@/components/investor/KpiCard";
import { TrendChartCard } from "@/components/charts/TrendChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { FunnelChartCard } from "@/components/charts/FunnelChartCard";
import {
  INVESTOR_KPIS,
  USER_GROWTH_TREND,
  ASSESSMENT_COMPLETION_TREND,
  DESTINATION_COUNTRIES_DATA,
  VISA_TYPE_DISTRIBUTION,
  CONVERSION_FUNNEL,
  RETENTION_TREND,
  REVENUE_TREND,
  ENGAGEMENT_DATA,
} from "@/data/mockData";

export default function InvestorAnalyticsPage() {
  return (
    <DashboardShell
      title="Investor analitikasi"
      subtitle="Grant va investor taqdimotlari uchun platforma ko'rsatkichlari."
      showOnboarding={false}
    >
      <DemoDataBanner />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INVESTOR_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TrendChartCard title="Foydalanuvchilar o'sishi" data={USER_GROWTH_TREND} />
        <TrendChartCard
          title="Tahlillarni yakunlash dinamikasi"
          data={ASSESSMENT_COMPLETION_TREND}
          color="#22D3EE"
        />
        <BarChartCard title="Eng ko'p tanlangan davlatlar" data={DESTINATION_COUNTRIES_DATA} horizontal />
        <DonutChartCard title="Viza turlari bo'yicha taqsimot" data={VISA_TYPE_DISTRIBUTION} />
        <FunnelChartCard title="Konversiya voronkasi" steps={CONVERSION_FUNNEL} />
        <TrendChartCard title="Saqlanish (retention) ko'rsatkichi" data={RETENTION_TREND} color="#16C79A" suffix="%" />
        <TrendChartCard title="Daromad dinamikasi (namuna)" data={REVENUE_TREND} color="#FAA93A" />
        <BarChartCard title="Platforma bo'yicha faollik" data={ENGAGEMENT_DATA} color="#8F97F5" />
      </div>
    </DashboardShell>
  );
}
