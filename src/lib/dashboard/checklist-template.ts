import type { DestinationSlug } from "@/lib/site/registry";

/**
 * Sample document checklist, assembled from destination + visa type.
 * Uzbek source strings (translated through the phrase table). This is a
 * general starting list — official requirements must always be checked.
 */
export type VisaKind = "tourist" | "student" | "work" | "business";

export interface ChecklistItem {
  id: string;
  title: string;
  note?: string;
  emoji: string;
  upload?: boolean;
  custom?: boolean;
}
export interface ChecklistGroup {
  title: string;
  emoji: string;
  items: ChecklistItem[];
}

export const VISA_KINDS: { id: VisaKind; label: string; emoji: string }[] = [
  { id: "tourist", label: "Turistik viza", emoji: "🏖️" },
  { id: "student", label: "Talaba vizasi", emoji: "🎓" },
  { id: "work", label: "Ish vizasi", emoji: "💼" },
  { id: "business", label: "Biznes vizasi", emoji: "🤝" },
];

const BASE: ChecklistGroup[] = [
  {
    title: "Asosiy hujjatlar",
    emoji: "🛂",
    items: [
      { id: "passport", emoji: "🛂", title: "Amaldagi pasport", note: "Safar tugaganidan keyin ham amal qilishi kerak", upload: true },
      { id: "photo", emoji: "📸", title: "Fotosurat", note: "Talablarga mos, yaqinda olingan", upload: true },
      { id: "form", emoji: "📝", title: "Ariza shakli", note: "To'liq va imzolangan", upload: true },
    ],
  },
  {
    title: "Moliya",
    emoji: "💰",
    items: [
      { id: "bank", emoji: "🏦", title: "Bank ko'chirmasi", note: "So'nggi oylar harakati bilan", upload: true },
      { id: "employment", emoji: "💼", title: "Ish joyidan ma'lumotnoma", note: "Lavozim va maosh ko'rsatilgan", upload: true },
    ],
  },
  {
    title: "Safar",
    emoji: "✈️",
    items: [
      { id: "insurance", emoji: "🩺", title: "Tibbiy sug'urta", note: "Safar muddatini to'liq qamrab olsin", upload: true },
      { id: "hotel", emoji: "🏨", title: "Mehmonxona broni", note: "Barcha tunlar uchun", upload: true },
      { id: "flight", emoji: "🎫", title: "Aviachipta broni", note: "Borish va qaytish", upload: true },
      { id: "itinerary", emoji: "🗺️", title: "Safar marshruti", note: "Kunlar bo'yicha qisqa reja" },
    ],
  },
];

const BY_VISA: Record<VisaKind, ChecklistItem[]> = {
  tourist: [],
  student: [
    { id: "admission", emoji: "🎓", title: "Qabul xati", note: "O'quv muassasasidan rasmiy xat", upload: true },
    { id: "tuition", emoji: "🧾", title: "O'qish to'lovi to'langanini tasdiqlovchi hujjat", upload: true },
    { id: "diploma", emoji: "📜", title: "Diplom va baholar varaqasi", upload: true },
  ],
  work: [
    { id: "contract", emoji: "📑", title: "Ish taklifi yoki mehnat shartnomasi", upload: true },
    { id: "employer", emoji: "🏢", title: "Ish beruvchi haqida ma'lumot", note: "Kompaniya nomi, manzili, aloqa" },
    { id: "qualification", emoji: "🏅", title: "Malaka hujjatlari", note: "Diplom, sertifikatlar", upload: true },
  ],
  business: [
    { id: "biz-invite", emoji: "✉️", title: "Hamkor kompaniyadan taklifnoma", upload: true },
    { id: "biz-letter", emoji: "🏢", title: "Kompaniyangizdan xizmat safari xati", upload: true },
    { id: "biz-reg", emoji: "📄", title: "Kompaniya ro'yxatdan o'tganligi hujjati", upload: true },
  ],
};

const BY_DESTINATION: Partial<Record<DestinationSlug, ChecklistItem[]>> = {
  schengen: [{ id: "schengen-ins", emoji: "🇪🇺", title: "Shengen sug'urtasi", note: "Kamida 30 000 € qoplama, butun hudud uchun", upload: true }],
  usa: [
    { id: "ds160", emoji: "🖥️", title: "DS-160 tasdiq sahifasi", upload: true },
    { id: "mrv", emoji: "💳", title: "Konsullik yig'imi kvitansiyasi", upload: true },
  ],
  uk: [{ id: "uk-online", emoji: "🖥️", title: "Onlayn ariza va biometrik uchrashuv tasdig'i", upload: true }],
  canada: [{ id: "ca-bio", emoji: "🖐️", title: "Biometrika uchrashuvi tasdig'i", upload: true }],
};

export function buildChecklist(dest: DestinationSlug, visa: VisaKind, custom: ChecklistItem[] = []): ChecklistGroup[] {
  const groups = BASE.map((g) => ({ ...g, items: [...g.items] }));
  const extras = [...(BY_VISA[visa] ?? []), ...(BY_DESTINATION[dest] ?? [])];
  if (extras.length) groups.push({ title: "Viza turi va davlatga oid", emoji: "📌", items: extras });
  if (custom.length) groups.push({ title: "Mening qo'shimchalarim", emoji: "✍️", items: custom });
  return groups;
}

// Storage keys — shared with the overview widget
export const CHECKLIST_SELECTION_KEY = "vizar-checklist-selection";
export const checklistKey = (dest: string, visa: string) => `vizar-checklist:${dest}:${visa}`;
export interface ChecklistSaved {
  done: string[];
  custom: ChecklistItem[];
}
export interface ChecklistSelection {
  dest: DestinationSlug;
  visa: VisaKind;
}
export const DEFAULT_SELECTION: ChecklistSelection = { dest: "schengen", visa: "tourist" };

export function checklistProgress(sel: ChecklistSelection, saved: ChecklistSaved) {
  const all = buildChecklist(sel.dest, sel.visa, saved.custom).flatMap((g) => g.items.map((i) => i.id));
  const done = saved.done.filter((id) => all.includes(id)).length;
  return { done, total: all.length, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
}
