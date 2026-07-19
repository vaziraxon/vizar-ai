import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const FOOTER_LINKS = [
  { label: "Narxlar", href: "/pricing" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Trust Center", href: "/trust-center" },
  { label: "Aloqa", href: "/#contact" },
  { label: "Yuridik ogohlantirish", href: "/trust-center#legal-disclaimer" },
];

export function Footer() {
  return (
    <footer id="site-footer" className="border-t border-surface-border bg-white">
      <div className="container-page flex flex-col items-center gap-6 py-10">
        <div className="flex flex-col items-center gap-6 sm:w-full sm:flex-row sm:justify-between">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-sm font-medium text-ink-600 transition-colors hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-body-sm text-ink-400">
          © {new Date().getFullYear()} VIZAR AI. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
