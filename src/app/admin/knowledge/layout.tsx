import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEditorContext } from "@/lib/knowledge/admin";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin/knowledge", label: "Kitob va boblar" },
  { href: "/admin/knowledge/rules", label: "Mamlakat qoidalari" },
  { href: "/admin/knowledge/sources", label: "Rasmiy manbalar" },
];

export default async function KnowledgeAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getEditorContext();
  return (
    <div className="min-h-screen bg-surface-tint dark:bg-navy-950">
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center gap-1 text-body-sm font-medium text-ink-600 hover:text-ink-900">
              <ArrowLeft size={16} /> Admin
            </Link>
            <span className="text-ink-300">/</span>
            <h1 className="font-display text-[20px] font-bold text-ink-950">AI bilimlar bazasi</h1>
          </div>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} className="rounded-pill px-3 py-1.5 text-body-sm font-medium text-ink-700 hover:bg-surface-muted">
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!ctx.supabase ? (
          <p className="card p-5 text-body text-ink-700">Supabase sozlanmagan.</p>
        ) : !ctx.isEditor ? (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-800 dark:border-amber-400/20 dark:bg-amber-400/10">
            Siz faqat ko‘rish rejimidasiz. Tahrirlash uchun hisobingiz emaili Supabase SQL Editor orqali{" "}
            <code>kb_editors</code> jadvaliga qo‘shilishi kerak (SUPABASE_SETUP.md, “AI bilimlar bazasi” bo‘limi).
          </p>
        ) : null}
        {ctx.supabase ? children : null}
      </main>
    </div>
  );
}
