"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Sparkles,
  Loader2,
  FileWarning,
  Landmark,
  Target,
  ListChecks,
  Clock,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SelectField } from "@/components/forms/SelectField";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { COUNTRY_OPTIONS, VISA_TYPE_OPTIONS } from "@/data/mockData";

export default function RefusalAnalysisPage() {
  const [country, setCountry] = useState("");
  const [visaType, setVisaType] = useState("");
  const [refusalDate, setRefusalDate] = useState("");
  const [reason, setReason] = useState("");
  const [context, setContext] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!country || !visaType || !refusalDate || !reason.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(true);
    }, 1400);
  }

  return (
    <DashboardShell
      title="Rad javobini tahlil qilish"
      subtitle="Oldingi rad javobingiz sabablarini AI yordamida tahlil qiling."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 dark:border-white/10 dark:bg-navy-800">
          <SelectField
            id="country"
            label="Davlat"
            placeholder="Davlatni tanlang"
            options={COUNTRY_OPTIONS}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <SelectField
            id="visaType"
            label="Viza turi"
            placeholder="Viza turini tanlang"
            options={VISA_TYPE_OPTIONS}
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
          />
          <TextField
            id="refusalDate"
            label="Rad etilgan sana"
            type="date"
            value={refusalDate}
            onChange={(e) => setRefusalDate(e.target.value)}
          />
          <TextField
            id="reason"
            label="Rad javobi sababi"
            placeholder="Konsullikdan olingan sabab"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80">
              Rad javobi xatini yuklash (ixtiyoriy)
            </label>
            <div className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-surface-border px-4 py-6 text-center transition-colors hover:border-brand-300 dark:border-white/10">
              <UploadCloud size={20} className="text-brand-500" />
              <span className="text-caption text-ink-400 dark:text-white/40">
                Faylni shu yerga tashlang yoki bosing
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="context"
              className="mb-1.5 block text-body-sm font-medium text-ink-700 dark:text-white/80"
            >
              Qo&apos;shimcha kontekst (ixtiyoriy)
            </label>
            <textarea
              id="context"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Vaziyat haqida qo'shimcha ma'lumot"
              className="w-full resize-none rounded-lg border border-surface-border bg-white px-4 py-2.5 text-body-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>

          <Button type="submit" size="md" className="w-full" disabled={analyzing}>
            {analyzing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Tahlil qilish
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-5 p-6 dark:border-white/10 dark:bg-navy-800"
            >
              <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                AI tahlili natijasi (mock)
              </p>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-red-600">
                  <FileWarning size={14} /> Ehtimoliy rad sabablari
                </p>
                <ul className="space-y-1.5 text-body-sm text-ink-600 dark:text-white/60">
                  <li>Moliyaviy hujjatlarda yetarli isbot bo&apos;lmagan</li>
                  <li>Safar maqsadi yetarlicha asoslanmagan</li>
                </ul>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-warning">
                  <Landmark size={14} /> Moliyaviy xavflar
                </p>
                <p className="text-body-sm text-ink-600 dark:text-white/60">
                  Bank hisobidagi mablag&apos; sarflanish tarixi izchil emas deb
                  baholangan.
                </p>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-brand-600">
                  <Target size={14} /> Safar maqsadi bo&apos;yicha xavflar
                </p>
                <p className="text-body-sm text-ink-600 dark:text-white/60">
                  Taklifnoma va mehmonxona bron hujjatlari o&apos;rtasida
                  bog&apos;liqlik yetarli ko&apos;rsatilmagan.
                </p>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-success">
                  <ListChecks size={14} /> Keyingi ariza uchun tavsiyalar
                </p>
                <ul className="space-y-1.5 text-body-sm text-ink-600 dark:text-white/60">
                  <li>Bank statementni yangilab, izchil tarixni ko&apos;rsating</li>
                  <li>Safar maqsadini tasdiqlovchi qo&apos;shimcha hujjat qo&apos;shing</li>
                  <li>AI Interview simulyatorida mashq qiling</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-surface-tint p-3 dark:bg-white/5">
                <Clock size={15} className="text-ink-400 dark:text-white/40" />
                <p className="text-caption text-ink-600 dark:text-white/60">
                  Tavsiya etilgan kutish muddati: qayta ariza topshirishdan
                  oldin kamida <strong>3 oy</strong>.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center text-ink-400 dark:border-white/10 dark:bg-navy-800 dark:text-white/40">
              <FileWarning size={28} />
              <p className="text-body-sm">
                Natija shu yerda ko&apos;rinadi — formani to&apos;ldirib
                yuboring.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
