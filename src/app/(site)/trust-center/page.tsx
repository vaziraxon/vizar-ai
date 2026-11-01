import { Lock, Database, UserCheck, FileText, Bot, Users, ScrollText, Route, ShieldAlert } from "lucide-react";
import { Accordion } from "@/components/site/Accordion";
import { FinalCTA } from "@/components/site/FinalCTA";
import { PageHero } from "@/components/site/PageHero";
import { TRUST_FAQ } from "@/data/mockData";

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Ma'lumotlar maxfiyligi",
    description:
      "Ma'lumotlar himoyalangan bazada saqlanadi: qatorlar darajasidagi qoidalar har bir foydalanuvchiga faqat o'z ma'lumotlarini ko'rish imkonini beradi, hujjatlar esa yopiq omborda turadi.",
  },
  {
    icon: Database,
    title: "Shifrlash (rejalashtirilgan)",
    description:
      "Ishlab chiqarish versiyasida ma'lumotlarni uzatish va saqlashda shifrlash qo'llanilishi rejalashtirilgan.",
  },
  {
    icon: FileText,
    title: "Ma'lumotlarni minimallashtirish",
    description:
      "Faqat tahlil uchun zarur bo'lgan ma'lumotlar so'raladi — ortiqcha ma'lumot talab qilinmaydi.",
  },
  {
    icon: UserCheck,
    title: "Foydalanuvchi nazorati",
    description:
      "Foydalanuvchilar o'z ma'lumotlarini ko'rish, tahrirlash va o'chirishni so'rash huquqiga ega bo'ladi.",
  },
  {
    icon: ShieldAlert,
    title: "Demo ma'lumotlar siyosati",
    description:
      "Ushbu platforma demo rejimida ishlaydi — haqiqiy passport yoki moliyaviy hujjatlarni yuklamang.",
  },
  {
    icon: Bot,
    title: "Mas'uliyatli sun'iy intellekt",
    description:
      "AI tahlili faqat tavsiya beruvchi vosita sifatida ishlatiladi, yakuniy qarorlar uchun asos emas.",
  },
  {
    icon: Users,
    title: "Inson tomonidan ko'rib chiqish",
    description:
      "Muhim tavsiyalar va konsultatsiyalar uchun inson mutaxassisi ishtirokini rejalashtirmoqdamiz.",
  },
];

const SECURITY_ROADMAP = [
  "Ma'lumotlarni shifrlash (transit va saqlashda)",
  "Rolga asoslangan kirish nazorati",
  "Muntazam xavfsizlik auditi",
  "GDPR va mahalliy qonunchilikka moslashtirish (kelajakdagi maqsad)",
];

export default function TrustCenterPage() {
  return (
    <>
      <PageHero
        emoji="🛡️"
        decor={["🔒", "🤖", "📜"]}
        eyebrow="Trust Center"
        title="Xavfsizlik va ishonch markazi"
        subtitle="Ma'lumotlaringizga qanday munosabatda bo'lishimiz haqida shaffof ma'lumot."
      />

      <div className="container-page space-y-5 pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-[24px] border border-surface-border bg-surface p-6 shadow-card sm:last:col-span-2 lg:last:col-span-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:text-violet-400">
                <p.icon size={19} />
              </span>
              <p className="luxe-firm font-luxe text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] mt-4 text-ink-950">{p.title}</p>
              <p className="mt-1.5 text-body-sm text-ink-600">{p.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-surface-border bg-surface p-6 shadow-card">
          <p className="luxe-firm font-luxe text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] mb-4 flex items-center gap-2 text-ink-950">
            <Route size={18} className="text-violet-600 dark:text-citron-300" /> Xavfsizlik yo&apos;l xaritasi
          </p>
          <ul className="space-y-2.5">
            {SECURITY_ROADMAP.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-ink-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-ink-500">
            Eslatma: kompaniyamiz hozircha ISO, SOC 2, GDPR yoki davlat
            tomonidan tasdiqlangan sertifikatlarga ega emas. Yuqoridagilar
            kelajakdagi maqsadlar sifatida belgilangan.
          </p>
        </div>

        <div id="legal-disclaimer" className="scroll-mt-24 rounded-[24px] border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-400/20 dark:bg-amber-400/10">
          <p className="luxe-firm font-luxe text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <ScrollText size={18} /> Huquqiy ogohlantirish
          </p>
          <p className="mt-2 text-body-sm text-amber-900 dark:text-amber-200">
            VIZAR AI mustaqil texnologik platforma bo&apos;lib, elchixona
            yoki konsullik vakolatxonasi emas. Platforma viza
            tasdiqlanishini kafolatlamaydi va yuridik maslahat sifatida
            talqin qilinmasligi kerak.
          </p>
        </div>

        <div className="pt-7">
          <h2 className="luxe-firm mb-6 text-center font-display text-ink-950">Ko&apos;p so&apos;raladigan savollar</h2>
          <Accordion items={TRUST_FAQ.map((item) => ({ q: item.question, a: item.answer }))} className="mx-auto max-w-2xl" />
        </div>
      </div>

      <FinalCTA />
    </>
  );
}
