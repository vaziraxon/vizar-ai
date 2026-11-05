"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AssistantChat } from "@/components/knowledge/AssistantChat";

export default function AssistantPage() {
  return (
    <DashboardShell title="Kitobdan javob" subtitle="Savolingizga mos kitob bo‘limlari va rasmiy manbalar.">
      <div className="mx-auto max-w-3xl">
        <AssistantChat />
      </div>
    </DashboardShell>
  );
}
