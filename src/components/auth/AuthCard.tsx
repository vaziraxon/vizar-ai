import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow px-4 py-12 dark:bg-navy-950">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="card p-6 dark:border-white/10 dark:bg-navy-900 sm:p-8">
          <h1 className="font-display text-display-sm text-ink-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-600 dark:text-white/60">
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
