"use client";

import { useState, type FormEvent } from "react";
import { Save, Loader2 } from "lucide-react";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";
import { SuccessToast } from "@/components/states/SuccessToast";
import { updateMyProfileAction } from "@/lib/actions/profiles";
import type { Profile } from "@/lib/data/profiles";
import { useL } from "@/components/i18n/L";

const sectionTitle = "mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-950";

const LANGUAGE_OPTIONS = ["uz", "ru", "en"];
const ACCOUNT_TYPE_OPTIONS = ["individual", "agency"];

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const l = useL();
  const initials = `${(profile.first_name ?? "").charAt(0)}${(profile.last_name ?? "").charAt(0)}`.toUpperCase() || "🙂";
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [language, setLanguage] = useState(profile.preferred_language);
  const [accountType, setAccountType] = useState(profile.account_type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await updateMyProfileAction({
      firstName,
      lastName,
      phone,
      preferredLanguage: language as "uz" | "ru" | "en",
      accountType: accountType as "individual" | "agency",
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="hero-sky-soft grain relative flex items-center gap-4 overflow-hidden rounded-[28px] border border-white p-6 shadow-xs dark:border-white/10">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-500 to-violet-600 font-display text-xl font-bold text-white shadow-button">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-body-lg font-bold text-ink-950">{[firstName, lastName].filter(Boolean).join(" ") || "—"}</p>
          <p className="truncate text-body-sm text-ink-600">✉️ {email || "—"}</p>
        </div>
      </div>

      <div className="card rounded-[24px] p-6">
        <p className={sectionTitle}>
          <span aria-hidden="true">👤</span> {l("Shaxsiy ma'lumotlar")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="Ism"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            id="lastName"
            label="Familiya"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="card rounded-[24px] p-6">
        <p className={sectionTitle}>
          <span aria-hidden="true">📞</span> {l("Aloqa ma'lumotlari")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="email" label="Email" type="email" value={email} disabled />
          <TextField
            id="phone"
            label="Telefon raqami"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <p className="mt-2 text-caption text-ink-400 dark:text-white/40">
          {l("Email manzilni o'zgartirish hozircha qo'llab-quvvatlanmaydi.")}
        </p>
      </div>

      <div className="card rounded-[24px] p-6">
        <p className={sectionTitle}>
          <span aria-hidden="true">🌐</span> {l("Hisob turi va til")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="accountType"
            label="Hisob turi"
            options={ACCOUNT_TYPE_OPTIONS}
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          />
          <SelectField
            id="language"
            label="Til"
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
      </div>

      <div className="card rounded-[24px] p-6">
        <p className={sectionTitle}>
          <span aria-hidden="true">🛂</span> {l("Passport ma'lumotlari (namuna)")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="passportNo" label="Passport raqami" placeholder="AA1234567" />
          <TextField id="passportExpiry" label="Amal qilish muddati" type="date" />
        </div>
        <p className="mt-2 text-caption text-ink-400 dark:text-white/40">
          {l("Bu maydonlar hech qayerda saqlanmaydi — demo ko'rinish uchun qo'yilgan. Haqiqiy passport ma'lumotlarini kiritmang.")}
        </p>
      </div>

      {error && <p className="text-body-sm font-medium text-red-600">{l(error)}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="md" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {l("O'zgarishlarni saqlash")}
        </Button>
      </div>

      <SuccessToast open={saved} message="Profil saqlandi" onClose={() => setSaved(false)} />
    </form>
  );
}
