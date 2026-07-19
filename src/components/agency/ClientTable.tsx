import Link from "next/link";
import { Eye } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { AgencyClient } from "@/types";

export function ClientTable({ clients }: { clients: AgencyClient[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-surface-border dark:border-white/10 lg:block">
        <table className="w-full min-w-[720px] text-left text-body-sm">
          <thead className="bg-surface-tint text-caption font-semibold uppercase tracking-wide text-ink-400 dark:bg-white/5 dark:text-white/40">
            <tr>
              <th className="px-5 py-3">Mijoz</th>
              <th className="px-5 py-3">Davlat</th>
              <th className="px-5 py-3">Viza turi</th>
              <th className="px-5 py-3">Tayyorgarlik</th>
              <th className="px-5 py-3">Holat</th>
              <th className="px-5 py-3">Mas'ul mutaxassis</th>
              <th className="px-5 py-3">Yangilangan</th>
              <th className="px-5 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border dark:divide-white/10">
            {clients.map((client) => (
              <tr key={client.id} className="bg-white dark:bg-navy-800">
                <td className="flex items-center gap-2.5 px-5 py-3.5 font-medium text-ink-900 dark:text-white">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-caption font-semibold text-white">
                    {client.initials}
                  </span>
                  {client.name}
                </td>
                <td className="px-5 py-3.5 text-ink-600 dark:text-white/60">
                  <span className="mr-1.5">{client.flag}</span>
                  {client.country}
                </td>
                <td className="px-5 py-3.5 text-ink-600 dark:text-white/60">{client.visaType}</td>
                <td className="px-5 py-3.5 font-semibold text-ink-900 dark:text-white">
                  {client.readinessScore}/100
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-5 py-3.5 text-ink-600 dark:text-white/60">
                  {client.assignedSpecialist}
                </td>
                <td className="px-5 py-3.5 text-ink-400 dark:text-white/40">{client.lastUpdate}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/agency/clients/${client.id}`}
                    className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <Eye size={14} /> Ko&apos;rish
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 lg:hidden">
        {clients.map((client) => (
          <div key={client.id} className="card p-5 dark:border-white/10 dark:bg-navy-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-caption font-semibold text-white">
                {client.initials}
              </span>
              <div>
                <p className="font-semibold text-ink-900 dark:text-white">{client.name}</p>
                <p className="text-caption text-ink-400 dark:text-white/40">
                  {client.flag} {client.country} · {client.visaType}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink-900 dark:text-white">
                {client.readinessScore}/100
              </span>
              <StatusBadge status={client.status} />
            </div>
            <p className="mt-2 text-caption text-ink-400 dark:text-white/40">
              {client.assignedSpecialist} · {client.lastUpdate}
            </p>
            <Link
              href={`/agency/clients/${client.id}`}
              className="mt-3 inline-flex items-center gap-1 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Eye size={14} /> Ko&apos;rish
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
