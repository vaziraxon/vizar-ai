"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, History } from "lucide-react";
import { Stepper } from "@/components/forms/Stepper";
import { SelectField } from "@/components/forms/SelectField";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { COUNTRY_OPTIONS, VISA_TYPE_OPTIONS } from "@/data/mockData";
import { createApplicationAction } from "@/lib/actions/applications";
import {
  saveAssessmentProgressAction,
  completeAssessmentAction,
} from "@/lib/actions/assessments";
import { upsertReportAction } from "@/lib/actions/reports";

const STEP_LABELS = [
  "Mamlakat va viza",
  "Safar tafsilotlari",
  "Moliyaviy holat",
  "Viza tarixi",
  "Hujjatlar",
];

interface AssessmentForm {
  country: string;
  visaType: string;
  purpose: string;
  duration: string;
  travelDate: string;
  visitedBefore: string;
  employment: string;
  income: string;
  bankBalance: string;
  sponsor: string;
  previouslyRefused: string;
  refusedCountry: string;
  refusalReason: string;
  additionalNote: string;
  docsStatus: Record<string, string>;
}

const DOC_LABELS = [
  "Passport",
  "Bank statement",
  "Ish joyidan ma'lumotnoma",
  "Mehmonxona bron",
  "Aviachipta bron",
  "Sug'urta",
  "Taklifnoma",
];

function buildInitialForm(prefill?: Partial<AssessmentForm>): AssessmentForm {
  return {
    country: "",
    visaType: "",
    purpose: "",
    duration: "",
    travelDate: "",
    visitedBefore: "",
    employment: "",
    income: "",
    bankBalance: "",
    sponsor: "",
    previouslyRefused: "",
    refusedCountry: "",
    refusalReason: "",
    additionalNote: "",
    docsStatus: Object.fromEntries(DOC_LABELS.map((d) => [d, ""])),
    ...prefill,
  };
}

interface AssessmentWizardProps {
  resumeApplicationId: string | null;
  resumeAnswers: Record<string, unknown> | null;
  configured: boolean;
}

export function AssessmentWizard({
  resumeApplicationId,
  resumeAnswers,
  configured,
}: AssessmentWizardProps) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(resumeApplicationId);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AssessmentForm>(
    buildInitialForm((resumeAnswers as Partial<AssessmentForm>) ?? undefined)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [formError, setFormError] = useState("");

  function update<K extends keyof AssessmentForm>(key: K, value: AssessmentForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!form.country) next.country = "Mamlakatni tanlang.";
      if (!form.visaType) next.visaType = "Viza turini tanlang.";
    } else if (step === 1) {
      if (!form.purpose.trim()) next.purpose = "Safar maqsadini kiriting.";
      if (!form.duration.trim()) next.duration = "Safar davomiyligini kiriting.";
      if (!form.travelDate) next.travelDate = "Taxminiy sanani kiriting.";
      if (!form.visitedBefore) next.visitedBefore = "Javobni tanlang.";
    } else if (step === 2) {
      if (!form.employment.trim()) next.employment = "Ish holatini kiriting.";
      if (!form.income.trim()) next.income = "Oylik daromadni kiriting.";
      if (!form.bankBalance.trim()) next.bankBalance = "Bank hisobidagi mablag'ni kiriting.";
      if (!form.sponsor) next.sponsor = "Javobni tanlang.";
    } else if (step === 3) {
      if (!form.previouslyRefused) next.previouslyRefused = "Javobni tanlang.";
      if (form.previouslyRefused === "Ha" && !form.refusedCountry.trim())
        next.refusedCountry = "Davlatni kiriting.";
      if (form.previouslyRefused === "Ha" && !form.refusalReason.trim())
        next.refusalReason = "Rad etilish sababini kiriting.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function persistStep(currentApplicationId: string) {
    if (!configured) return;
    setSavingStep(true);
    await saveAssessmentProgressAction({
      applicationId: currentApplicationId,
      step,
      answers: form as unknown as Record<string, string | number | boolean | null>,
    });
    setSavingStep(false);
  }

  async function handleNext() {
    setFormError("");
    if (!validateStep()) return;

    if (step === 0 && !applicationId) {
      if (!configured) {
        setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
        return;
      }
      const result = await createApplicationAction({
        destinationCountry: form.country,
        visaType: form.visaType,
      });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setApplicationId(result.data.id);
      await persistStep(result.data.id);
    } else if (applicationId) {
      await persistStep(applicationId);
    }

    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    setSubmitting(true);
    setFormError("");

    if (!configured || !applicationId) {
      setTimeout(() => router.push("/readiness-score"), 800);
      return;
    }

    const result = await completeAssessmentAction({
      applicationId,
      answers: form as unknown as Record<string, string | number | boolean | null>,
    });

    if (!result.ok) {
      setSubmitting(false);
      setFormError(result.error);
      return;
    }

    await upsertReportAction({
      applicationId,
      reportType: "readiness",
      title: "Visa Readiness hisoboti",
      reportData: {
        score: result.data.score,
        riskLevel: result.data.riskLevel,
        generatedAt: new Date().toISOString(),
      },
    });

    router.push("/readiness-score");
    router.refresh();
  }

  return (
    <div className="card mx-auto max-w-2xl p-6 dark:border-white/10 dark:bg-navy-800 sm:p-8">
      {resumeApplicationId && step === 0 && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-caption font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
          <History size={14} /> Oldingi tugallanmagan tahlilingiz davom ettirilmoqda.
        </div>
      )}

      <Stepper steps={STEP_LABELS} currentStep={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <SelectField
                id="country"
                label="Mamlakatni tanlash"
                placeholder="Mamlakatni tanlang"
                options={COUNTRY_OPTIONS}
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                error={errors.country}
              />
              <SelectField
                id="visaType"
                label="Viza turini tanlash"
                placeholder="Viza turini tanlang"
                options={VISA_TYPE_OPTIONS}
                value={form.visaType}
                onChange={(e) => update("visaType", e.target.value)}
                error={errors.visaType}
              />
            </>
          )}

          {step === 1 && (
            <>
              <TextField
                id="purpose"
                label="Safar maqsadi"
                placeholder="Masalan: turizm, ta'lim, ish uchrashuvi"
                value={form.purpose}
                onChange={(e) => update("purpose", e.target.value)}
                error={errors.purpose}
              />
              <TextField
                id="duration"
                label="Safar davomiyligi"
                placeholder="Masalan: 14 kun"
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                error={errors.duration}
              />
              <TextField
                id="travelDate"
                label="Taxminiy safar sanasi"
                type="date"
                value={form.travelDate}
                onChange={(e) => update("travelDate", e.target.value)}
                error={errors.travelDate}
              />
              <SelectField
                id="visitedBefore"
                label="Oldin shu davlatga borganmisiz?"
                placeholder="Tanlang"
                options={["Ha", "Yo'q"]}
                value={form.visitedBefore}
                onChange={(e) => update("visitedBefore", e.target.value)}
                error={errors.visitedBefore}
              />
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                id="employment"
                label="Ish holati"
                placeholder="Masalan: rasmiy ishlayman"
                value={form.employment}
                onChange={(e) => update("employment", e.target.value)}
                error={errors.employment}
              />
              <TextField
                id="income"
                label="Oylik daromad"
                placeholder="Masalan: 8 000 000 so'm"
                value={form.income}
                onChange={(e) => update("income", e.target.value)}
                error={errors.income}
              />
              <TextField
                id="bankBalance"
                label="Bank hisobidagi mablag'"
                placeholder="Masalan: 25 000 000 so'm"
                value={form.bankBalance}
                onChange={(e) => update("bankBalance", e.target.value)}
                error={errors.bankBalance}
              />
              <SelectField
                id="sponsor"
                label="Homiy mavjudmi?"
                placeholder="Tanlang"
                options={["Ha", "Yo'q"]}
                value={form.sponsor}
                onChange={(e) => update("sponsor", e.target.value)}
                error={errors.sponsor}
              />
            </>
          )}

          {step === 3 && (
            <>
              <SelectField
                id="previouslyRefused"
                label="Oldin viza rad etilganmi?"
                placeholder="Tanlang"
                options={["Ha", "Yo'q"]}
                value={form.previouslyRefused}
                onChange={(e) => update("previouslyRefused", e.target.value)}
                error={errors.previouslyRefused}
              />
              {form.previouslyRefused === "Ha" && (
                <>
                  <TextField
                    id="refusedCountry"
                    label="Qaysi davlat?"
                    placeholder="Davlat nomi"
                    value={form.refusedCountry}
                    onChange={(e) => update("refusedCountry", e.target.value)}
                    error={errors.refusedCountry}
                  />
                  <TextField
                    id="refusalReason"
                    label="Rad etilish sababi"
                    placeholder="Konsullikdan olingan sabab"
                    value={form.refusalReason}
                    onChange={(e) => update("refusalReason", e.target.value)}
                    error={errors.refusalReason}
                  />
                </>
              )}
              <TextField
                id="additionalNote"
                label="Qo'shimcha izoh (ixtiyoriy)"
                placeholder="Qo'shimcha ma'lumot"
                value={form.additionalNote}
                onChange={(e) => update("additionalNote", e.target.value)}
              />
            </>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-body-sm text-ink-600 dark:text-white/60">
                Har bir hujjat holatini belgilang — bu yakuniy tahlil sifatiga
                ta&apos;sir qiladi.
              </p>
              {DOC_LABELS.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between gap-4 rounded-lg border border-surface-border px-4 py-3 dark:border-white/10"
                >
                  <span className="text-body-sm font-medium text-ink-900 dark:text-white">
                    {doc}
                  </span>
                  <select
                    value={form.docsStatus[doc]}
                    onChange={(e) =>
                      update("docsStatus", {
                        ...form.docsStatus,
                        [doc]: e.target.value,
                      })
                    }
                    className="rounded-lg border border-surface-border bg-white px-3 py-1.5 text-body-sm text-ink-900 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
                  >
                    <option value="">Holatni tanlang</option>
                    <option value="Tayyor">Tayyor</option>
                    <option value="Jarayonda">Jarayonda</option>
                    <option value={"Yo'q"}>{"Yo'q"}</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {formError && (
        <p className="mt-4 text-body-sm font-medium text-red-600">{formError}</p>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-surface-border pt-6 dark:border-white/10">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-pill px-5 py-2.5 text-body-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40 dark:text-white/70 dark:hover:bg-white/5"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>

        {step < STEP_LABELS.length - 1 ? (
          <Button size="md" onClick={handleNext} disabled={savingStep}>
            {savingStep ? <Loader2 size={16} className="animate-spin" /> : null}
            Keyingi <ArrowRight size={16} />
          </Button>
        ) : (
          <Button size="md" onClick={handleFinish} disabled={submitting}>
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Tahlilni boshlash
          </Button>
        )}
      </div>

      <p className="mt-4 text-center text-caption text-ink-400 dark:text-white/40">
        Ushbu baho faqat tayyorgarlik ko&apos;rsatkichi — u viza tasdiqlanish
        ehtimolini bildirmaydi va uni kafolatlamaydi.
      </p>
    </div>
  );
}
