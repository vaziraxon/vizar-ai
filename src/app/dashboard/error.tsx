"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";
import { L } from "@/components/i18n/L";

/** A dashboard page failed to load: say so, offer a retry and a way back. */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="landing-lime dashboard-lime flex min-h-screen items-center justify-center bg-surface-canvas px-4 dark:bg-navy-950">
      <div className="w-full max-w-md space-y-4 text-center">
        <ErrorState
          title="Sahifani yuklab bo'lmadi"
          description="Internet aloqasini tekshirib, qayta urinib ko'ring. Ma'lumotlaringiz saqlangan."
          onRetry={reset}
        />
        <Link href="/dashboard" className="inline-block text-body-sm font-semibold text-brand-600 hover:text-brand-deep dark:text-brand-300">
          <L>{"Umumiy ko'rinishga qaytish"}</L>
        </Link>
      </div>
    </div>
  );
}
