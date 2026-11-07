"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/forms/SelectField";
import { TextField } from "@/components/forms/TextField";
import { InlineAlert } from "@/components/states/InlineAlert";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { requestConsultationAction, cancelConsultationAction } from "@/lib/actions/consultations";
import { CONSULTATION_TOPICS, REQUEST_STATUS_LABEL, readRequest } from "@/lib/dashboard/consultation-request";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { focusFirstInvalid } from "@/lib/utils";
import type { ConsultationRow } from "@/lib/data/consultations";
import { useFormatDate, useL } from "@/components/i18n/L";

const EMPTY = { topic: "", contact: "", preferredTime: "", message: "" };

export function ConsultationPageClient({ requests }: { requests: ConsultationRow[] }) {
  const router = useRouter();
  const l = useL();
  const fmt = useFormatDate();
  const configured = isSupabaseConfigured();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const update = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: typeof errors = {};
    if (!form.topic) next.topic = "Mavzuni tanlang.";
    if (form.contact.trim().length < 5) next.contact = "Telegram yoki telefon raqamingizni yozing.";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstInvalid();

    if (!configured) {
      setSent(true);
      setForm(EMPTY);
      return;
    }

    setSending(true);
    const result = await requestConsultationAction(form);
    setSending(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
    setForm(EMPTY);
    router.refresh();
  }

  async function handleCancel(id: string) {
    setCancelError("");
    try {
      const result = await cancelConsultationAction(id);
      if (!result.ok) {
        setCancelError(result.error);
        return;
      }
    } catch {
      setCancelError("Amalni bajarib bo'lmadi. Qayta urinib ko'ring.");
      return;
    }
    router.refresh();
  }

  return (
    <>
      {!configured && (
        <div className="mb-6">
          <InlineAlert variant="warning">{l("Supabase sozlanmagan — so'rov saqlanmaydi.")}</InlineAlert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="card space-y-4 rounded-[28px] p-6 sm:p-7 lg:col-span-2">
          <p className="flex items-center gap-2 font-display text-body-lg font-bold text-ink-950">
            <span aria-hidden="true">🤝</span> {l("Mutaxassisga so'rov")}
          </p>

          {sent && (
            <p role="status" className="flex items-start gap-2 rounded-2xl bg-success/10 px-4 py-3 text-body-sm text-ink-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
              {l("So'rovingiz yuborildi. Siz yozgan aloqa orqali bog'lanamiz.")}
            </p>
          )}

          <SelectField
            id="topic"
            label="Mavzu"
            placeholder="Mavzuni tanlang"
            options={[...CONSULTATION_TOPICS]}
            value={form.topic}
            onChange={(e) => update("topic", e.target.value)}
            error={errors.topic && l(errors.topic)}
          />
          <TextField
            id="contact"
            label="Aloqa uchun Telegram yoki telefon"
            placeholder="Masalan: @username yoki +998 90 123 45 67"
            value={form.contact}
            maxLength={100}
            onChange={(e) => update("contact", e.target.value)}
            error={errors.contact && l(errors.contact)}
          />
          <TextField
            id="preferredTime"
            label="Qulay vaqt (ixtiyoriy)"
            placeholder="Masalan: ish kunlari 18:00 dan keyin"
            value={form.preferredTime}
            maxLength={100}
            onChange={(e) => update("preferredTime", e.target.value)}
          />
          <div>
            <label htmlFor="message" className="mb-2 block text-body-sm font-medium text-ink-900 dark:text-white/80">
              {l("Savolingiz (ixtiyoriy)")}
            </label>
            <textarea
              id="message"
              rows={4}
              maxLength={1000}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder={l("Qaysi davlat, qanday viza va nima bo'yicha yordam kerak?")}
              className="input min-h-[110px] py-3"
            />
          </div>

          {formError && <p role="alert" className="text-body-sm font-medium text-red-600 dark:text-red-300">{l(formError)}</p>}

          <Button type="submit" size="md" disabled={sending}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : null}
            {l("So'rov yuborish")}
          </Button>
          <p className="text-caption text-ink-500">
            {l("Aloqa ma'lumotingizni faqat siz bilan bog'lanish uchun ishlatamiz.")}
          </p>
        </form>

        <div className="card h-fit rounded-[24px] p-6">
          <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
            <span aria-hidden="true">🧭</span> {l("Qanday ishlaydi")}
          </p>
          <ol className="space-y-2 text-body-sm text-ink-600">
            <li>1. {l("Mavzu va aloqa usulini yozasiz.")}</li>
            <li>2. {l("Mutaxassis siz yozgan aloqa orqali bog'lanadi.")}</li>
            <li>3. {l("So'rov holati shu sahifada ko'rinadi.")}</li>
          </ol>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-body-sm font-semibold text-ink-900 dark:text-white">{l("Mening so'rovlarim")}</p>
          {cancelError && <p role="alert" className="mb-3 text-body-sm font-medium text-red-600 dark:text-red-300">{l(cancelError)}</p>}
          <ul className="space-y-3">
            {requests.map((c) => {
              const request = readRequest(c.notes, c.specialist_name);
              return (
                <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 rounded-[20px] p-4">
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-ink-900 dark:text-white">{l(request.topic)}</p>
                    <p className="text-caption text-ink-500">
                      {fmt(c.created_at, "medium")}
                      {request.preferredTime ? ` · ${request.preferredTime}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={REQUEST_STATUS_LABEL[c.status] ?? c.status} />
                    {c.status === "booked" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(c.id)}
                        className="flex items-center gap-1 text-caption font-semibold text-red-500 hover:text-red-600"
                      >
                        <X size={13} /> {l("Bekor qilish")}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
