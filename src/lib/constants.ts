import {
  Zap,
  ShieldCheck,
  Globe2,
  Headset,
  FileCheck2,
  BrainCircuit,
  MessagesSquare,
  Files,
  FileX,
  ShieldAlert,
  MicOff,
  Compass,
  Hourglass,
  Sparkles,
  ScanSearch,
  Gauge,
  UserCog,
  ListChecks,
  UserRound,
  MapPinCheck,
  Lock,
  ClipboardCheck,
  UploadCloud,
  FileSearch,
  BadgeCheck,
  Plane,
  GraduationCap,
  Briefcase,
  Building2,
  Users,
  Landmark,
  Mail,
  Phone,
  Send,
  MapPin,
} from "lucide-react";
import type {
  NavItem,
  Language,
  TrustFeature,
  HeroStat,
  FloatingInsight,
  ProblemCard,
  SolutionModule,
  AIFeature,
  HowItWorksStep,
  VisaType,
  CountryCard,
  Testimonial,
  FAQItem,
} from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Bosh sahifa", href: "#home" },
  { label: "Muammo", href: "#problem" },
  { label: "Yechim", href: "#solution" },
  { label: "Imkoniyatlar", href: "#features" },
  { label: "Qanday ishlaydi", href: "#how-it-works" },
  { label: "Biz haqimizda", href: "#about" },
  { label: "Aloqa", href: "#contact" },
];

export const LANGUAGES: Language[] = [
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export const HERO_STATS: HeroStat[] = [
  { value: "5 daq.", label: "Maqsadli tahlil vaqti" },
  { value: "24/7", label: "AI yordamchi mavjudligi" },
  { value: "0–100", label: "Tayyorgarlik shkalasi" },
];

// Four feature cards — sourced from slide 4 of the VIZAR AI deck
export const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: Zap,
    title: "Tezkor tahlil",
    description:
      "Hujjatlaringizni yuklang — sun'iy intellekt qisqa vaqt ichida tahlil qilib, aniq tavsiyalar beradi.",
    accent: "brand",
  },
  {
    icon: ShieldCheck,
    title: "Ishonchli tahlil",
    description:
      "AI algoritmlari hujjatlaringizni har tomonlama tekshirib, rad etilish xavfini oldindan aniqlaydi.",
    accent: "success",
  },
  {
    icon: Globe2,
    title: "Keng qamrovli ma'lumot",
    description:
      "Turli davlatlar uchun eng so'nggi viza talablari va tartib-qoidalarini bilib oling.",
    accent: "accent",
  },
  {
    icon: Headset,
    title: "24/7 qo'llab-quvvatlash",
    description:
      "AI yordamchi va mutaxassislarimiz kecha-yu kunduz sizga yordam berishga tayyor turadi.",
    accent: "warning",
  },
];

// Floating insight cards around the phone mockup in the hero
export const FLOATING_INSIGHTS: FloatingInsight[] = [
  {
    id: "readiness",
    icon: FileCheck2,
    title: "Viza tayyorligi",
    subtitle: "Namuna: 87%",
  },
  {
    id: "analysis",
    icon: BrainCircuit,
    title: "AI tahlili",
    subtitle: "Real vaqtda",
  },
  {
    id: "interview",
    icon: MessagesSquare,
    title: "Suhbat tayyorgarligi",
    subtitle: "12 ta savol",
  },
];

// --- Stage 2 -------------------------------------------------------------

// Problem section — sourced from slide 3 of the VIZAR AI deck
export const PROBLEM_CARDS: ProblemCard[] = [
  {
    icon: Files,
    title: "Murakkab hujjatlar",
    description:
      "Viza uchun talab qilinadigan hujjatlar ko'p va mamlakatga qarab farq qiladi.",
    accent: "violet",
  },
  {
    icon: FileX,
    title: "Hujjatlardagi xatolar",
    description:
      "Noto'g'ri yoki yetishmayotgan ma'lumotlar arizaning rad etilishiga sabab bo'lishi mumkin.",
    accent: "red",
  },
  {
    icon: ShieldAlert,
    title: "Ishonchsiz vositachilar",
    description:
      "Foydalanuvchilar ba'zan qimmat va sifati kafolatlanmagan xizmatlardan foydalanishga majbur bo'ladi.",
    accent: "orange",
  },
  {
    icon: MicOff,
    title: "Intervyuga tayyorgarlik yetishmasligi",
    description:
      "Konsullik savollariga noto'g'ri yoki ishonchsiz javob berish xavfni oshiradi.",
    accent: "violet",
  },
  {
    icon: Compass,
    title: "Shaffof yo'l-yo'riq yo'qligi",
    description:
      "Foydalanuvchi qaysi bosqichda ekanini va yana nima qilish kerakligini tushunmaydi.",
    accent: "red",
  },
  {
    icon: Hourglass,
    title: "Vaqt va mablag' yo'qotilishi",
    description:
      "Takroriy topshirish, noto'g'ri hujjatlar va rad javoblari ortiqcha xarajatga olib keladi.",
    accent: "orange",
  },
];

// Solution section — AI core surrounded by 8 modules (slide 4 hub layout)
export const SOLUTION_MODULES: SolutionModule[] = [
  { icon: ScanSearch, title: "AI hujjat tahlili", side: "left" },
  { icon: Gauge, title: "Visa Readiness Score", side: "left" },
  { icon: MessagesSquare, title: "AI Interview Simulator", side: "left" },
  { icon: FileSearch, title: "Rad etilgan vizani tahlil qilish", side: "left" },
  { icon: ListChecks, title: "Shaxsiy tavsiyalar", side: "right" },
  { icon: UserCog, title: "Mutaxassis konsultatsiyasi", side: "right" },
  { icon: MapPinCheck, title: "Viza talablari bazasi", side: "right" },
  { icon: Lock, title: "Xavfsiz ma'lumotlar boshqaruvi", side: "right" },
];

export const SOLUTION_SUPPORTING_TEXT =
  "VIZAR AI viza olish jarayonini boshidan oxirigacha raqamlashtirib, foydalanuvchiga aniq, tez va shaxsiylashtirilgan yordam beradi.";

// AI Features section — six premium feature cards
export const AI_FEATURES: AIFeature[] = [
  {
    icon: ScanSearch,
    number: "01",
    title: "AI hujjat tahlili",
    description:
      "Yuklangan hujjatlardagi xatolar, yetishmayotgan ma'lumotlar va muvofiqlik muammolarini aniqlaydi.",
  },
  {
    icon: Gauge,
    number: "02",
    title: "Visa Readiness Score",
    description:
      "Foydalanuvchining viza topshirishga tayyorgarlik darajasini 0 dan 100 gacha baholaydi.",
  },
  {
    icon: MessagesSquare,
    number: "03",
    title: "AI Interview Simulator",
    description:
      "Konsullik intervyusi savollariga javob berishni mashq qilish imkonini beradi.",
  },
  {
    icon: FileSearch,
    number: "04",
    title: "Rad etilgan arizani tahlil qilish",
    description:
      "Oldingi rad javobining ehtimoliy sabablarini aniqlab, keyingi ariza uchun tavsiyalar beradi.",
  },
  {
    icon: UserRound,
    number: "05",
    title: "Shaxsiy AI tavsiyalari",
    description:
      "Foydalanuvchining holati, mamlakati va viza turiga mos vazifalar ro'yxatini yaratadi.",
  },
  {
    icon: BadgeCheck,
    number: "06",
    title: "Mutaxassis bilan konsultatsiya",
    description:
      "Zarur holatlarda professional viza mutaxassisi bilan uchrashuv bron qilish imkonini beradi.",
  },
];

// How it works — five connected steps
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  { step: 1, icon: Compass, title: "Mamlakat va viza turini tanlang" },
  { step: 2, icon: ClipboardCheck, title: "Qisqa savollarga javob bering" },
  { step: 3, icon: UploadCloud, title: "Hujjatlarni yuklang" },
  { step: 4, icon: Gauge, title: "AI tahlili va Visa Readiness Score oling" },
  { step: 5, icon: Sparkles, title: "Tavsiyalar asosida arizani tayyorlang" },
];

export const DISCLAIMER_TEXT =
  "VIZAR AI mustaqil texnologik platforma bo'lib, elchixona yoki konsullik vakolatxonasi emas. Platforma viza tasdiqlanishini kafolatlamaydi.";

// --- Stage 3 -------------------------------------------------------------

// Supported visa types
export const VISA_TYPES: VisaType[] = [
  {
    icon: Plane,
    title: "Turistik viza",
    description:
      "Dam olish, sayohat yoki qarindoshlarni ko'rish maqsadida qisqa muddatli tashrif uchun mo'ljallangan.",
  },
  {
    icon: GraduationCap,
    title: "Talaba vizasi",
    description:
      "Xorijiy ta'lim muassasasida tahsil olish uchun rasmiylashtiriladigan viza turi.",
  },
  {
    icon: Briefcase,
    title: "Ish vizasi",
    description:
      "Chet elda mehnat faoliyatini amalga oshirish uchun ish beruvchi taklifnomasi asosida beriladi.",
  },
  {
    icon: Building2,
    title: "Biznes vizasi",
    description:
      "Uchrashuvlar, ko'rgazmalar yoki hamkorlik muzokaralari uchun ishbilarmonlarga mo'ljallangan.",
  },
  {
    icon: Users,
    title: "Oilaviy viza",
    description:
      "Xorijda yashovchi oila a'zolari huzuriga borish yoki ular bilan birlashish uchun beriladi.",
  },
  {
    icon: Landmark,
    title: "Immigratsiya vizasi",
    description:
      "Doimiy yashash huquqini olish maqsadida boshqa davlatga ko'chib o'tish uchun mo'ljallangan.",
  },
];

// Countries — indicative figures for illustration, not official guarantees
export const COUNTRIES: CountryCard[] = [
  {
    code: "us",
    flag: "🇺🇸",
    name: "AQSH",
    difficulty: "Murakkab",
    processingTime: "3–5 hafta",
    description:
      "Turizm, ish va ta'lim uchun eng ko'p murojaat qilinadigan yo'nalishlardan biri.",
  },
  {
    code: "ca",
    flag: "🇨🇦",
    name: "Kanada",
    difficulty: "O'rtacha",
    processingTime: "4–8 hafta",
    description:
      "Immigratsiya va ta'lim dasturlari bilan mashhur, barqaror va ochiq davlat.",
  },
  {
    code: "gb",
    flag: "🇬🇧",
    name: "Buyuk Britaniya",
    difficulty: "O'rtacha",
    processingTime: "3–6 hafta",
    description:
      "Nufuzli universitetlari va biznes imkoniyatlari bilan tanilgan.",
  },
  {
    code: "de",
    flag: "🇩🇪",
    name: "Germaniya",
    difficulty: "O'rtacha",
    processingTime: "2–4 hafta",
    description:
      "Yevropadagi yetakchi iqtisodiyot, talabalar va mutaxassislar uchun qulay shart-sharoit.",
  },
  {
    code: "au",
    flag: "🇦🇺",
    name: "Avstraliya",
    difficulty: "Murakkab",
    processingTime: "4–12 hafta",
    description:
      "Yuqori turmush darajasi va keng qamrovli ta'lim tizimiga ega davlat.",
  },
  {
    code: "jp",
    flag: "🇯🇵",
    name: "Yaponiya",
    difficulty: "O'rtacha",
    processingTime: "1–3 hafta",
    description:
      "Zamonaviy texnologiyalar va boy madaniyati bilan mashhur davlat.",
  },
  {
    code: "kr",
    flag: "🇰🇷",
    name: "Janubiy Koreya",
    difficulty: "O'rtacha",
    processingTime: "2–4 hafta",
    description:
      "Ta'lim va texnologiya sohasida jadal rivojlanayotgan davlat.",
  },
  {
    code: "ae",
    flag: "🇦🇪",
    name: "BAA",
    difficulty: "Oson",
    processingTime: "3–7 kun",
    description:
      "Biznes va turizm uchun tez va qulay viza tartib-qoidalariga ega.",
  },
];

// Testimonials — demo data only
export const TESTIMONIALS: Testimonial[] = [
  {
    initials: "DR",
    name: "Diyora Rakhimova",
    country: "AQSH",
    review:
      "VIZAR AI yordamida hujjatlarimni tekshirib, qaysi joylarda xato borligini aniq bilib oldim. Bu menga juda katta yordam berdi.",
    rating: 5,
  },
  {
    initials: "JT",
    name: "Javlon Tursunov",
    country: "Kanada",
    review:
      "AI intervyu simulyatori orqali savollarga tayyorlanish menga ishonch berdi. Suhbat paytida o'zimni erkin his qildim.",
    rating: 5,
  },
  {
    initials: "MY",
    name: "Madina Yusupova",
    country: "Germaniya",
    review:
      "Talaba vizasi uchun kerakli hujjatlar ro'yxatini aniq va tushunarli tarzda oldim. Vaqtimni sezilarli tejadim.",
    rating: 4,
  },
  {
    initials: "SA",
    name: "Sherzod Aliyev",
    country: "Buyuk Britaniya",
    review:
      "Oldingi rad javobim sabablarini AI orqali tahlil qilib, keyingi arizamni yaxshiroq tayyorladim.",
    rating: 5,
  },
  {
    initials: "NK",
    name: "Nodira Karimova",
    country: "Avstraliya",
    review:
      "Platforma juda qulay va tushunarli. Har bir bosqichda nima qilish kerakligini aniq ko'rsatib turadi.",
    rating: 4,
  },
  {
    initials: "ON",
    name: "Otabek Nematov",
    country: "BAA",
    review:
      "Biznes vizasi uchun murojaat qilishdan oldin VIZAR AI orqali tayyorgarlik ko'rdim, bu jarayonni ancha osonlashtirdi.",
    rating: 5,
  },
];

// FAQ
export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "VIZAR AI nima?",
    answer:
      "VIZAR AI — sun'iy intellekt yordamida viza olish jarayonini raqamlashtiruvchi platforma bo'lib, hujjatlarni tahlil qilish, tayyorgarlik darajasini baholash va shaxsiy tavsiyalar berish orqali foydalanuvchilarga yordam beradi.",
  },
  {
    question: "Visa Readiness Score nima?",
    answer:
      "Bu — foydalanuvchining hujjatlari va ma'lumotlari asosida hisoblangan, viza topshirishga qanchalik tayyor ekanligini ko'rsatuvchi 0 dan 100 gacha bo'lgan ko'rsatkich.",
  },
  {
    question: "AI qanday ishlaydi?",
    answer:
      "Yuklangan hujjatlar va kiritilgan ma'lumotlar sun'iy intellekt algoritmlari orqali tahlil qilinadi, so'ngra aniqlangan kamchiliklar va tavsiyalar asosida natija taqdim etiladi.",
  },
  {
    question: "Hujjatlarim xavfsizmi?",
    answer:
      "Ha, barcha yuklangan hujjatlar shifrlangan holda saqlanadi va faqat tahlil maqsadida ishlatiladi.",
  },
  {
    question: "Viza kafolatlanadimi?",
    answer:
      "Yo'q. VIZAR AI mustaqil texnologik platforma bo'lib, viza tasdiqlanishini kafolatlamaydi — u faqat tayyorgarlik jarayonida yordam beradi.",
  },
  {
    question: "Qaysi davlatlar uchun xizmat ko'rsatasiz?",
    answer:
      "Platforma turli davlatlar uchun viza talablari bo'yicha ma'lumot va tayyorgarlik yordamini beradi, ro'yxat doimiy kengaytirilmoqda.",
  },
  {
    question: "Xizmatdan foydalanish pullikmi?",
    answer:
      "Boshlang'ich tahlil bepul taqdim etiladi, qo'shimcha xizmatlar (mutaxassis konsultatsiyasi kabi) alohida shartlar asosida taklif qilinadi.",
  },
  {
    question: "AI Interview Simulator qanday ishlaydi?",
    answer:
      "Tizim konsullik intervyusida ko'p uchraydigan savollarni taqdim etadi va foydalanuvchi javoblarini tahlil qilib, tavsiyalar beradi.",
  },
  {
    question: "Rad etilgan arizamni qayta tekshirish mumkinmi?",
    answer:
      "Ha, oldingi rad javobingiz sabablarini AI yordamida tahlil qilib, keyingi ariza uchun aniq tavsiyalar olishingiz mumkin.",
  },
  {
    question: "Mutaxassis bilan qanday bog'lanaman?",
    answer:
      "Sun'iy intellekt tahlilidan so'ng, xohlasangiz, platforma orqali professional viza mutaxassisi bilan konsultatsiya band qilishingiz mumkin.",
  },
  {
    question: "Ma'lumotlarim kim bilan bo'lishiladi?",
    answer:
      "Sizning shaxsiy ma'lumotlaringiz uchinchi shaxslarga uzatilmaydi va faqat platforma ichida tahlil maqsadida ishlatiladi.",
  },
];

// Contact info — demo placeholder details
export const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "info@vizar.ai" },
  { icon: Phone, label: "Telefon", value: "+998 71 200 00 00" },
  { icon: Send, label: "Telegram", value: "@vizar_ai_support" },
  { icon: MapPin, label: "Manzil", value: "Toshkent sh., Yunusobod tumani, IT Park" },
];


