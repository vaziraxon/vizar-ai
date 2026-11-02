"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Save, Loader2, Camera, Trash2 } from "lucide-react";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";
import { SuccessToast } from "@/components/states/SuccessToast";
import { updateMyProfileAction } from "@/lib/actions/profiles";
import type { Profile } from "@/lib/data/profiles";
import { removeAvatar, uploadAvatar } from "@/lib/profile/avatar";
import { useLanguage } from "@/lib/language-context";
import { useL } from "@/components/i18n/L";

const sectionTitle = "mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-950";

const LANGUAGE_OPTIONS = ["uz", "ru", "en"];
const LANGUAGE_LABELS: Record<string, string> = { uz: "O‘zbekcha", ru: "Русский", en: "English" };
const ACCOUNT_TYPE_OPTIONS = ["individual", "agency"];
const ACCOUNT_TYPE_LABELS: Record<string, string> = { individual: "Shaxsiy", agency: "Agentlik" };

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const l = useL();
  const { setLanguage: setSiteLanguage } = useLanguage();
  const initials = `${(profile.first_name ?? "").charAt(0)}${(profile.last_name ?? "").charAt(0)}`.toUpperCase() || "🙂";
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [language, setLanguage] = useState(profile.preferred_language);
  const [accountType, setAccountType] = useState(profile.account_type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
    // The saved language is also the one the site should speak from now on.
    setSiteLanguage(language as "uz" | "ru" | "en");
    setSaved(true);
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError("");
    setPhotoBusy(true);
    const result = await uploadAvatar(file);
    setPhotoBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!result.ok) {
      setPhotoError(result.error);
      return;
    }
    setAvatarUrl(result.url);
  }

  async function handleRemovePhoto() {
    setPhotoError("");
    setPhotoBusy(true);
    const result = await removeAvatar();
    setPhotoBusy(false);
    if (!result.ok) {
      setPhotoError(result.error);
      return;
    }
    setAvatarUrl(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="hero-sky-soft grain relative flex flex-wrap items-center gap-4 overflow-hidden rounded-[28px] border border-white p-6 shadow-xs dark:border-white/10">
        <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-500 to-violet-600 font-display text-xl font-bold text-white shadow-button">
          {avatarUrl ? <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" /> : initials}
          {photoBusy && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink-950/40">
              <Loader2 size={20} className="animate-spin" />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-body-lg font-bold text-ink-950">{[firstName, lastName].filter(Boolean).join(" ") || "—"}</p>
          <p className="truncate text-body-sm text-ink-600">✉️ {email || "—"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={photoBusy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-3.5 py-1.5 text-caption font-semibold text-ink-800 shadow-xs ring-1 ring-surface-border transition-colors hover:bg-surface-tint disabled:opacity-60"
            >
              <Camera size={14} /> {avatarUrl ? l("Rasmni almashtirish") : l("Rasm yuklash")}
            </button>
            {avatarUrl && (
              <button
                type="button"
                disabled={photoBusy}
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-caption font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-400/10"
              >
                <Trash2 size={14} /> {l("Olib tashlash")}
              </button>
            )}
          </div>
          {photoError ? (
            <p role="alert" className="mt-2 text-caption font-medium text-red-600">{l(photoError)}</p>
          ) : (
            <p className="mt-2 text-caption text-ink-500">{l("JPG, PNG yoki WEBP. Rasm kvadrat qilib qirqiladi.")}</p>
          )}
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
            maxLength={100}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            id="lastName"
            label="Familiya"
            value={lastName}
            maxLength={100}
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
            type="tel"
            placeholder="+998901234567"
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
            optionLabels={ACCOUNT_TYPE_LABELS}
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          />
          <SelectField
            id="language"
            label="Til"
            options={LANGUAGE_OPTIONS}
            optionLabels={LANGUAGE_LABELS}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
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
