"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Languages, Briefcase, CheckCircle2, Loader2, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { SPECIALISTS } from "@/data/mockData";
import type { Specialist } from "@/types";
import { cn } from "@/lib/utils";
import { parseDemoSlotToIso } from "@/lib/parse-demo-slot";
import { bookConsultationAction, cancelConsultationAction } from "@/lib/actions/consultations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ConsultationRow } from "@/lib/data/consultations";
import { useDateLocale, useL } from "@/components/i18n/L";

export function ConsultationPageClient({
  upcoming,
}: {
  upcoming: ConsultationRow[];
}) {
  const router = useRouter();
  const l = useL();
  const locale = useDateLocale();
  const configured = isSupabaseConfigured();
  const [selected, setSelected] = useState<Specialist | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openBooking(sp: Specialist) {
    setSelected(sp);
    setDate("");
    setSlot("");
    setConfirmed(false);
    setError("");
  }

  async function handleBook() {
    if (!date || !slot || !selected) return;
    setError("");

    if (!configured) {
      setConfirmed(true);
      return;
    }

    const iso = parseDemoSlotToIso(date, slot);
    if (!iso) {
      setError(l("Sana formatini aniqlab bo'lmadi."));
      return;
    }

    setLoading(true);
    const result = await bookConsultationAction({
      specialistName: selected.name,
      scheduledAt: iso,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirmed(true);
    router.refresh();
  }

  async function handleCancel(id: string) {
    await cancelConsultationAction(id);
    router.refresh();
  }

  return (
    <>
      {!configured && (
        <div className="mb-6">
          <InlineAlert variant="warning">
            {l("Supabase sozlanmagan — bandlov faqat demo ko'rinishda ishlaydi va saqlanmaydi.")}
          </InlineAlert>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-body-sm font-semibold text-ink-900 dark:text-white">
            {l("Band qilingan konsultatsiyalar")}
          </p>
          <div className="space-y-3">
            {upcoming.map((c) => (
              <div
                key={c.id}
                className="card flex items-center justify-between rounded-[20px] p-4"
              >
                <div>
                  <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                    {c.specialist_name}
                  </p>
                  <p className="text-caption text-ink-400 dark:text-white/40">
                    {c.scheduled_at
                      ? new Date(c.scheduled_at).toLocaleString(locale, {
                          dateStyle: "long",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCancel(c.id)}
                  className="flex items-center gap-1 text-caption font-semibold text-red-500 hover:text-red-600"
                >
                  <X size={13} /> {l("Bekor qilish")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIALISTS.map((sp) => (
          <div key={sp.id} className="card spotlight flex flex-col gap-4 rounded-[24px] p-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-body font-bold text-white shadow-button">
                {sp.avatarInitials}
                <span aria-hidden="true" className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[13px] shadow-card">
                  🤝
                </span>
              </span>
              <div>
                <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                  {sp.name}
                </p>
                <p className="text-caption text-ink-400 dark:text-white/40">
                  {l(sp.experience)}
                </p>
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-body-sm text-ink-600 dark:text-white/60">
              <Briefcase size={14} /> {l(sp.specialization)}
            </p>
            <p className="flex items-center gap-1.5 text-body-sm text-ink-600 dark:text-white/60">
              <Languages size={14} /> {sp.languages.map((x) => l(x)).join(", ")}
            </p>
            {/* No star ratings: there are no real reviews to base them on. */}
            <p className="text-caption text-ink-500 dark:text-white/40">
              {l("Namunaviy mutaxassis va vaqt oralig'i — demo maqsadida.")}
            </p>

            <Button size="md" className="mt-auto" onClick={() => openBooking(sp)}>
              {l("Konsultatsiya band qilish")}
            </Button>
          </div>
        ))}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={confirmed ? l("Tasdiqlandi") : l("{name} bilan konsultatsiya", { name: selected?.name ?? "" })}
      >
        {confirmed ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={24} />
            </span>
            <p className="text-body-sm text-ink-700 dark:text-white/70">
              {l("Konsultatsiyangiz {date} kuni soat {slot} ga band qilindi (demo).", { date: l(date), slot })}
            </p>
            <p className="text-caption text-ink-400 dark:text-white/40">
              {l("To'lov tizimi ulanmagan — bu faqat namunaviy tasdiqlash.")}
            </p>
            <Button size="sm" onClick={() => setSelected(null)}>
              {l("Yopish")}
            </Button>
          </div>
        ) : (
          selected && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
                  {l("Sanani tanlang")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selected.availableDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDate(d)}
                      className={cn(
                        "rounded-pill border px-3 py-1.5 text-body-sm font-medium transition-colors",
                        date === d
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-600/30 dark:text-brand-300"
                          : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                      )}
                    >
                      {l(d)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
                  {l("Vaqtni tanlang")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selected.availableSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-pill border px-3 py-1.5 text-body-sm font-medium transition-colors",
                        slot === s
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-600/30 dark:text-brand-300"
                          : "border-surface-border text-ink-700 hover:bg-surface-muted dark:border-white/10 dark:text-white/70"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-body-sm font-medium text-red-600">{error}</p>}
              <Button
                size="md"
                className="w-full"
                onClick={handleBook}
                disabled={!date || !slot || loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {l("Bandlovni tasdiqlash")}
              </Button>
            </div>
          )
        )}
      </Modal>
    </>
  );
}
