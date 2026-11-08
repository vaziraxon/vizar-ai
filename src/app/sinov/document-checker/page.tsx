import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { isAdminEmail } from "@/lib/supabase/authz";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DocumentCheckerBench } from "./DocumentCheckerBench";

export const metadata: Metadata = {
  title: "Hujjat tekshiruvi — sinov",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Private test mode for the future document checker: admins only, and never
 * on the production site. It runs entirely in the browser on made-up
 * documents — no upload, no storage, no database, no AI call.
 */
export default async function DocumentCheckerBenchPage() {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (!data.user || !isAdminEmail(data.user.email)) notFound();
  }

  if (process.env.VERCEL_ENV === "production") {
    return (
      <main className="hero-sky grain relative flex min-h-screen items-center justify-center px-4 dark:bg-navy-950">
        <div className="card max-w-md rounded-[28px] p-7 text-center">
          <ShieldAlert aria-hidden="true" className="mx-auto h-10 w-10 text-brand-600" />
          <h1 className="mt-4 font-display text-display-sm font-bold text-ink-950">Sinov rejimi bu yerda yopiq</h1>
          <p className="mt-2 text-body-sm text-ink-600">
            Hujjat tekshiruvi sinovi faqat preview yoki lokal muhitda ochiladi — asosiy saytda emas.
          </p>
          <Link href="/sinov" className="btn-secondary btn-md mt-5">
            Sinov sahifasiga qaytish
          </Link>
        </div>
      </main>
    );
  }

  return <DocumentCheckerBench />;
}
