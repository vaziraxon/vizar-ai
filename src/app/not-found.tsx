import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white px-4 dark:bg-navy-950">
      <div className="container-page flex h-16 items-center px-0 sm:px-0 lg:px-0">
        <Link href="/" className="rounded-lg">
          <Logo />
        </Link>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
        <p className="font-display text-[120px] font-bold leading-none tracking-[-0.06em] text-surface-muted sm:text-[160px] dark:text-white/10">
          404
        </p>
        <h1 className="mt-2 font-display text-display-md text-ink-900 dark:text-white">
          Sahifa topilmadi
        </h1>
        <p className="mt-3 max-w-md text-body-lg text-ink-600 dark:text-white/60">
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
        </p>
        <ButtonLink href="/" size="lg" variant="dark" className="mt-8">
          <ArrowLeft size={17} />
          Bosh sahifaga qaytish
        </ButtonLink>
      </main>
    </div>
  );
}
