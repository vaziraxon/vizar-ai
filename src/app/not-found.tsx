import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-glow px-4 text-center dark:bg-navy-950">
      <Link href="/" className="mb-10">
        <Logo />
      </Link>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
        <Compass size={28} />
      </span>
      <h1 className="mt-6 font-display text-display-lg text-ink-900 dark:text-white">
        404 — Sahifa topilmadi
      </h1>
      <p className="mt-3 max-w-md text-body-lg text-ink-600 dark:text-white/60">
        Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi
        mumkin.
      </p>
      <Link href="/" className="mt-8">
        <Button size="md">
          <ArrowLeft size={16} />
          Bosh sahifaga qaytish
        </Button>
      </Link>
    </div>
  );
}
