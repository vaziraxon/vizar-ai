"use client";

import { useState, type FormEvent } from "react";
import { Save, Loader2 } from "lucide-react";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";
import { SuccessToast } from "@/components/states/SuccessToast";
import { updateMyProfileAction } from "@/lib/actions/profiles";
import type { Profile } from "@/lib/data/profiles";

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
      <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
        <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
          Shaxsiy ma&apos;lumotlar
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

      <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
        <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
          Aloqa ma&apos;lumotlari
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
          Email manzilni o&apos;zgartirish hozircha qo&apos;llab-quvvatlanmaydi.
        </p>
      </div>

      <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
        <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
          Hisob turi va til
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

      <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
        <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
          Passport ma&apos;lumotlari (namuna)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="passportNo" label="Passport raqami" placeholder="AA1234567" />
          <TextField id="passportExpiry" label="Amal qilish muddati" type="date" />
        </div>
        <p className="mt-2 text-caption text-ink-400 dark:text-white/40">
          Bu maydonlar hech qayerda saqlanmaydi — demo ko&apos;rinish uchun
          qo&apos;yilgan. Haqiqiy passport ma&apos;lumotlarini kiritmang.
        </p>
      </div>

      {error && <p className="text-body-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="md" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          O&apos;zgarishlarni saqlash
        </Button>
      </div>

      <SuccessToast open={saved} message="Profil saqlandi" onClose={() => setSaved(false)} />
    </form>
  );
}
