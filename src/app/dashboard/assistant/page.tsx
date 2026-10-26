"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AssistantChat } from "@/components/knowledge/AssistantChat";

export default function AssistantPage() {
  return (
    <DashboardShell title="AI viza maslahatchisi" subtitle="Kitob va rasmiy manbalarga tayangan javoblar.">
      <div className="mx-auto max-w-3xl">
        <AssistantChat />
      </div>
    </DashboardShell>
  );
}
