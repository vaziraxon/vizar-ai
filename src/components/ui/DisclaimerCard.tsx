import { ShieldAlert } from "lucide-react";
import { DISCLAIMER_TEXT } from "@/lib/constants";

export function DisclaimerCard() {
  return (
    <div className="mx-auto flex max-w-3xl items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-left">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <ShieldAlert size={20} strokeWidth={2} />
      </span>
      <p className="text-body-sm leading-relaxed text-amber-900">
        {DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
