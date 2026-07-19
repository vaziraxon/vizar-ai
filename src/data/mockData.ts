import {
  LayoutDashboard,
  FileSearch2,
  FolderOpen,
  Gauge,
  MessagesSquare,
  FileWarning,
  ListChecks,
  UserCog,
  History,
  UserRound,
  Settings,
  LogOut,
  FileText,
  Landmark,
  Briefcase,
  MailCheck,
  Hotel,
  Plane,
  ShieldCheck,
  FilePlus2,
  Users,
  FileStack,
  FileClock,
  Sparkles,
  TrendingUp,
  Bell,
  CalendarClock,
  BadgeCheck,
  UserPlus,
  Building2,
  ClipboardList,
  Palette,
  BarChart3,
  FileBarChart2,
  Route,
  ShieldAlert,
  Home,
  ScanSearch,
  Rocket,
  Globe2,
  Smartphone,
  Server,
  Moon,
  Globe,
} from "lucide-react";
import type {
  SidebarNavItem,
  DocumentItem,
  ReadinessCategory,
  InterviewQuestion,
  Specialist,
  ApplicationRecord,
  RecommendationTask,
  PricingPlan,
  AdminStat,
  TrendPoint,
  CategoryDatum,
  ActivityTimelineItem,
  KpiCardData,
  FunnelStep,
  AgencyClient,
  DetectedField,
  AppNotification,
  ReportItem,
  RoadmapItem,
  OnboardingStepConfig,
  CommandItem,
  FAQItem,
} from "@/types";

// --- Current demo user & application ------------------------------------

export const CURRENT_USER = {
  firstName: "Vazira",
  lastName: "Zokirova",
  email: "vazira.zokirova@example.com",
  initials: "VZ",
};

export const CURRENT_APPLICATION = {
  destination: "Janubiy Koreya",
  flag: "🇰🇷",
  visaType: "Tourist Visa",
  status: "Tahlil jarayonida",
  readinessScore: 82,
  uploadedDocs: 6,
  missingDocs: 2,
  interviewScore: 76,
  progressSteps: [
    { label: "Ma'lumotlar kiritildi", done: true },
    { label: "Hujjatlar yuklandi", done: true },
    { label: "AI tahlili", done: true },
    { label: "Intervyu tayyorgarligi", done: false },
    { label: "Yakuniy ko'rib chiqish", done: false },
  ],
};

export const UPCOMING_CONSULTATION = {
  specialistName: "Diloram Xasanova",
  date: "24-iyul, 2026",
  time: "14:00",
  topic: "Hujjatlarni yakuniy ko'rib chiqish",
};

export const RECENT_ACTIVITY = [
  { icon: FileSearch2, text: "AI hujjat tahlili yakunlandi", time: "2 soat oldin" },
  { icon: FolderOpen, text: "Bank statement yuklandi", time: "5 soat oldin" },
  { icon: MessagesSquare, text: "AI Interview mashqi boshlandi", time: "1 kun oldin" },
  { icon: Gauge, text: "Visa Readiness Score yangilandi: 82/100", time: "1 kun oldin" },
];

export const NEXT_STEPS = [
  "Bank statementdagi hisob egasi ismini to'g'rilang",
  "Mehmonxona bron hujjatini yuklang",
  "AI Interview mashqini yakunlang",
  "Mutaxassis konsultatsiyasini tasdiqlang",
];

// --- Dashboard sidebar ----------------------------------------------------

export const SIDEBAR_NAV: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: "Umumiy ko'rinish", href: "/dashboard" },
  { icon: FileSearch2, label: "Yangi viza tahlili", href: "/assessment" },
  { icon: FolderOpen, label: "Hujjatlar", href: "/documents" },
  { icon: Gauge, label: "Visa Readiness Score", href: "/readiness-score" },
  { icon: MessagesSquare, label: "AI Interview", href: "/ai-interview" },
  { icon: FileWarning, label: "Rad javobini tahlil qilish", href: "/refusal-analysis" },
  { icon: ListChecks, label: "Tavsiyalar", href: "/recommendations" },
  { icon: FileBarChart2, label: "Hisobotlar", href: "/reports" },
  { icon: Bell, label: "Bildirishnomalar", href: "/notifications" },
  { icon: UserCog, label: "Konsultatsiya", href: "/consultation" },
  { icon: History, label: "Arizalar tarixi", href: "/applications" },
  { icon: UserRound, label: "Profil", href: "/profile" },
  { icon: Settings, label: "Sozlamalar", href: "/settings" },
];

export const SIDEBAR_LOGOUT: SidebarNavItem = {
  icon: LogOut,
  label: "Chiqish",
  href: "/",
};

// --- Documents -------------------------------------------------------------

export const DOCUMENTS: DocumentItem[] = [
  { id: "passport", icon: FileText, title: "Passport", status: "Tasdiqlandi" },
  {
    id: "bank",
    icon: Landmark,
    title: "Bank statement",
    status: "Kamchilik bor",
    note: "Bank ma'lumotnomasida hisob egasining to'liq ismi ko'rsatilmagan.",
  },
  { id: "employment", icon: Briefcase, title: "Ish joyidan ma'lumotnoma", status: "Tasdiqlandi" },
  { id: "invitation", icon: MailCheck, title: "Taklifnoma", status: "Yuklanmagan" },
  { id: "hotel", icon: Hotel, title: "Mehmonxona bron", status: "Yuklanmagan" },
  { id: "flight", icon: Plane, title: "Aviachipta bron", status: "AI tahlil qilmoqda" },
  {
    id: "insurance",
    icon: ShieldCheck,
    title: "Sug'urta",
    status: "Yangilash kerak",
    note: "Sug'urta muddati safar sanasidan oldin tugaydi.",
  },
  { id: "extra", icon: FilePlus2, title: "Qo'shimcha hujjatlar", status: "Yuklanmagan" },
];

// --- Visa Readiness Score --------------------------------------------------

export const READINESS_OVERALL = 82;

export const READINESS_CATEGORIES: ReadinessCategory[] = [
  { label: "Shaxsiy profil", score: 95 },
  { label: "Hujjatlar tayyorligi", score: 78 },
  { label: "Moliyaviy holat", score: 72 },
  { label: "Safar maqsadi", score: 88 },
  { label: "Intervyuga tayyorgarlik", score: 70 },
  { label: "Oldingi viza tarixi", score: 85 },
];

export const READINESS_STRENGTHS = [
  "Safar maqsadi aniq va izchil bayon qilingan",
  "Oldingi viza tarixida muammo qayd etilmagan",
  "Shaxsiy profil ma'lumotlari to'liq",
];

export const READINESS_WEAKNESSES = [
  "Moliyaviy hujjatlarda kamchiliklar mavjud",
  "Intervyuga tayyorgarlik darajasi past",
  "Ba'zi hujjatlar hali yuklanmagan",
];

export const READINESS_MISSING_DOCS = ["Taklifnoma", "Mehmonxona bron"];

export const READINESS_PRIORITY_TASKS = [
  "Bank statementni to'g'rilab qayta yuklang",
  "Mehmonxona bron hujjatini qo'shing",
  "AI Interview simulyatorida kamida 3 ta mashq bajaring",
];

// --- AI Interview ------------------------------------------------------------

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: 1, question: "Safaringizning asosiy maqsadi nima?" },
  { id: 2, question: "Safar xarajatlarini kim qoplaydi?" },
  { id: 3, question: "O'zbekistonga qaytishingizni qanday asoslay olasiz?" },
  { id: 4, question: "Qayerda yashaysiz?" },
  { id: 5, question: "Ushbu davlatda tanishlaringiz bormi?" },
];

// --- Specialists -------------------------------------------------------------

export const SPECIALISTS: Specialist[] = [
  {
    id: "sp-1",
    name: "Diloram Xasanova",
    experience: "7 yillik tajriba",
    languages: ["O'zbek", "Rus", "Ingliz"],
    specialization: "Turistik va talaba vizalari",
    rating: 4.9,
    avatarInitials: "DX",
    availableDates: ["24-iyul", "25-iyul", "27-iyul"],
    availableSlots: ["10:00", "13:00", "16:00"],
  },
  {
    id: "sp-2",
    name: "Sardor Egamov",
    experience: "5 yillik tajriba",
    languages: ["O'zbek", "Ingliz"],
    specialization: "Ish va biznes vizalari",
    rating: 4.8,
    avatarInitials: "SE",
    availableDates: ["24-iyul", "26-iyul"],
    availableSlots: ["11:00", "14:30", "17:00"],
  },
  {
    id: "sp-3",
    name: "Nilufar Qodirova",
    experience: "9 yillik tajriba",
    languages: ["O'zbek", "Rus"],
    specialization: "Rad etilgan arizalar bo'yicha tahlil",
    rating: 5.0,
    avatarInitials: "NQ",
    availableDates: ["25-iyul", "28-iyul"],
    availableSlots: ["09:30", "12:00", "15:30"],
  },
];

// --- Application history -----------------------------------------------------

export const APPLICATIONS: ApplicationRecord[] = [
  {
    id: "app-1",
    country: "Janubiy Koreya",
    flag: "🇰🇷",
    visaType: "Tourist Visa",
    createdDate: "01-iyul, 2026",
    readinessScore: 82,
    status: "Tahlil qilinmoqda",
    lastUpdate: "2 soat oldin",
  },
  {
    id: "app-2",
    country: "Germaniya",
    flag: "🇩🇪",
    visaType: "Student Visa",
    createdDate: "12-may, 2026",
    readinessScore: 91,
    status: "Tayyor",
    lastUpdate: "3 kun oldin",
  },
  {
    id: "app-3",
    country: "AQSH",
    flag: "🇺🇸",
    visaType: "Business Visa",
    createdDate: "03-fevral, 2026",
    readinessScore: 64,
    status: "Konsultatsiya kerak",
    lastUpdate: "2 hafta oldin",
  },
  {
    id: "app-4",
    country: "Kanada",
    flag: "🇨🇦",
    visaType: "Work Visa",
    createdDate: "18-noyabr, 2025",
    readinessScore: 100,
    status: "Yakunlangan",
    lastUpdate: "2 oy oldin",
  },
];

// --- Recommendations ----------------------------------------------------------

export const RECOMMENDATION_TASKS: RecommendationTask[] = [
  { id: "t1", title: "Bank statementni to'g'rilab qayta yuklang", status: "Muhim", dueLabel: "Bugun" },
  { id: "t2", title: "Mehmonxona bron hujjatini yuklang", status: "Jarayonda", dueLabel: "2 kun ichida" },
  { id: "t3", title: "AI Interview mashqini yakunlang", status: "Boshlanmagan", dueLabel: "5 kun ichida" },
  { id: "t4", title: "Shaxsiy profil ma'lumotlarini tasdiqlang", status: "Bajarildi", dueLabel: "Bajarildi" },
  { id: "t5", title: "Mutaxassis konsultatsiyasini band qiling", status: "Boshlanmagan", dueLabel: "1 hafta ichida" },
];

// --- Pricing --------------------------------------------------------------

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Bepul",
    price: "0",
    period: "so'm / oy",
    features: [
      "Boshlang'ich hujjatlar checklisti",
      "Cheklangan Visa Readiness Score",
      "1 marta AI Interview mashqi",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "290 000",
    period: "so'm / oy",
    features: [
      "To'liq Visa Readiness Score",
      "AI hujjat tahlili",
      "AI Interview Simulator",
      "Shaxsiy tavsiyalar",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "590 000",
    period: "so'm / oy",
    features: [
      "Standard rejadagi barcha imkoniyatlar",
      "Rad etilgan ariza tahlili",
      "Mutaxassis konsultatsiyasi",
      "Ustuvor qo'llab-quvvatlash",
    ],
  },
  {
    id: "b2b",
    name: "B2B",
    price: "Individual",
    period: "shartnoma asosida",
    features: [
      "Agentlik uchun boshqaruv paneli",
      "Bir nechta mijoz profili",
      "API kirish imkoniyati",
      "Oq etiketka (white-label) varianti",
    ],
  },
];

// --- Admin panel ------------------------------------------------------------

export const ADMIN_STATS: AdminStat[] = [
  { icon: Users, label: "Jami foydalanuvchilar", value: "1 248" },
  { icon: FileSearch2, label: "Faol tahlillar", value: "312" },
  { icon: FolderOpen, label: "Yuklangan hujjatlar", value: "4 906" },
  { icon: UserCog, label: "Konsultatsiyalar", value: "187" },
  { icon: Landmark, label: "Daromad (namuna)", value: "—" },
];

export const ADMIN_NAV: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Foydalanuvchilar", href: "/admin" },
  { icon: FileSearch2, label: "Arizalar", href: "/admin" },
  { icon: FolderOpen, label: "Hujjatlar", href: "/admin" },
  { icon: UserCog, label: "Mutaxassislar", href: "/admin" },
  { icon: FileStack, label: "Kontent", href: "/admin" },
  { icon: BarChart3, label: "Investor analitika", href: "/investor-analytics" },
  { icon: Route, label: "Roadmap", href: "/roadmap" },
  { icon: ShieldAlert, label: "Trust Center", href: "/trust-center" },
  { icon: Settings, label: "Sozlamalar", href: "/admin" },
];

export const ADMIN_RECENT_USERS = [
  { name: "Diyora Rakhimova", email: "diyora@example.com", joined: "2 soat oldin" },
  { name: "Javlon Tursunov", email: "javlon@example.com", joined: "5 soat oldin" },
  { name: "Madina Yusupova", email: "madina@example.com", joined: "1 kun oldin" },
];

export const ADMIN_FLAGGED_DOCS = [
  { user: "Sherzod Aliyev", doc: "Bank statement", reason: "Sifat past, matn aniq ko'rinmayapti" },
  { user: "Nodira Karimova", doc: "Taklifnoma", reason: "Sana maydoni bo'sh" },
];

export const ADMIN_SUPPORT_REQUESTS = [
  { user: "Otabek Nematov", subject: "To'lov bo'yicha savol", status: "Ochiq" },
  { user: "Kamola Yoldosheva", subject: "Hujjat yuklashda xatolik", status: "Jarayonda" },
];

// --- Assessment form options --------------------------------------------------

export const COUNTRY_OPTIONS = [
  "AQSH",
  "Kanada",
  "Buyuk Britaniya",
  "Germaniya",
  "Avstraliya",
  "Yaponiya",
  "Janubiy Koreya",
  "BAA",
];

export const VISA_TYPE_OPTIONS = [
  "Turistik viza",
  "Talaba vizasi",
  "Ish vizasi",
  "Biznes vizasi",
  "Oilaviy viza",
  "Immigratsiya vizasi",
];

// ==========================================================================
// Stage 5 — investor-grade analytics, agency, documents AI, notifications,
// reports, roadmap, trust center, onboarding, command palette
// ==========================================================================

// --- Dashboard analytics (Recharts data) ----------------------------------

export const READINESS_TREND: TrendPoint[] = [
  { label: "1-hafta", value: 48 },
  { label: "2-hafta", value: 55 },
  { label: "3-hafta", value: 61 },
  { label: "4-hafta", value: 68 },
  { label: "5-hafta", value: 74 },
  { label: "6-hafta", value: 82 },
];

export const DOC_COMPLETION_DATA: CategoryDatum[] = [
  { label: "Yuklangan", value: 6 },
  { label: "Yetishmayotgan", value: 2 },
];

export const INTERVIEW_PROGRESS_TREND: TrendPoint[] = [
  { label: "1-mashq", value: 52 },
  { label: "2-mashq", value: 61 },
  { label: "3-mashq", value: 68 },
  { label: "4-mashq", value: 76 },
];

export const ACTIVITY_TIMELINE: ActivityTimelineItem[] = [
  { icon: FileSearch2, title: "AI hujjat tahlili yakunlandi", time: "Bugun, 14:20" },
  { icon: FolderOpen, title: "Bank statement yuklandi", time: "Bugun, 09:10" },
  { icon: MessagesSquare, title: "AI Interview mashqi #4 bajarildi", time: "Kecha, 18:40" },
  { icon: Gauge, title: "Visa Readiness Score 74 → 82", time: "Kecha, 18:45" },
  { icon: UserCog, title: "Konsultatsiya band qilindi", time: "2 kun oldin" },
];

export const RISK_DISTRIBUTION: CategoryDatum[] = [
  { label: "Past", value: 58 },
  { label: "O'rta", value: 30 },
  { label: "Yuqori", value: 12 },
];

export const COUNTRY_INTEREST: CategoryDatum[] = [
  { label: "Janubiy Koreya", value: 32 },
  { label: "AQSH", value: 24 },
  { label: "Germaniya", value: 18 },
  { label: "Kanada", value: 15 },
  { label: "BAA", value: 11 },
];

export const RECENT_SCORE_CHANGES = [
  { label: "Moliyaviy holat", delta: "+8", date: "Bugun" },
  { label: "Hujjatlar tayyorligi", delta: "+5", date: "Kecha" },
  { label: "Intervyuga tayyorgarlik", delta: "+12", date: "3 kun oldin" },
];

export const WEEKLY_SUMMARY = {
  tasksCompleted: 4,
  docsUploaded: 2,
  interviewSessions: 3,
  scoreChange: "+8",
};

export const SMART_RECOMMENDATIONS = [
  "Bank statementni yangilab qayta yuklang — bu tayyorgarlik bahosini oshiradi",
  "AI Interview simulyatorida yana 2 ta mashq bajarish tavsiya etiladi",
  "Mehmonxona bron hujjatini qo'shing — hozircha yetishmayapti",
];

// --- Investor analytics -----------------------------------------------------

export const INVESTOR_KPIS: KpiCardData[] = [
  { icon: Users, label: "Ro'yxatdan o'tgan foydalanuvchilar", value: "1 248", change: "+12%" },
  { icon: TrendingUp, label: "Oylik faol foydalanuvchilar", value: "612", change: "+9%" },
  { icon: FileSearch2, label: "Yakunlangan tahlillar", value: "934", change: "+15%" },
  { icon: FolderOpen, label: "Tahlil qilingan hujjatlar", value: "4 906", change: "+18%" },
  { icon: MessagesSquare, label: "Intervyu mashqlari", value: "2 310", change: "+21%" },
  { icon: UserCog, label: "Konsultatsiya bandlari", value: "187", change: "+6%" },
  { icon: BadgeCheck, label: "Bepuldan pullikka o'tish", value: "8.4%", change: "+1.2%" },
  { icon: Landmark, label: "Oylik takrorlanuvchi daromad (namuna)", value: "—" },
];

export const USER_GROWTH_TREND: TrendPoint[] = [
  { label: "Yan", value: 210 },
  { label: "Fev", value: 340 },
  { label: "Mar", value: 480 },
  { label: "Apr", value: 620 },
  { label: "May", value: 810 },
  { label: "Iyun", value: 1020 },
  { label: "Iyul", value: 1248 },
];

export const ASSESSMENT_COMPLETION_TREND: TrendPoint[] = [
  { label: "Yan", value: 120 },
  { label: "Fev", value: 210 },
  { label: "Mar", value: 340 },
  { label: "Apr", value: 460 },
  { label: "May", value: 610 },
  { label: "Iyun", value: 780 },
  { label: "Iyul", value: 934 },
];

export const DESTINATION_COUNTRIES_DATA: CategoryDatum[] = [
  { label: "Janubiy Koreya", value: 286 },
  { label: "AQSH", value: 214 },
  { label: "Germaniya", value: 168 },
  { label: "Kanada", value: 142 },
  { label: "BAA", value: 98 },
  { label: "Boshqalar", value: 340 },
];

export const VISA_TYPE_DISTRIBUTION: CategoryDatum[] = [
  { label: "Turistik", value: 38 },
  { label: "Talaba", value: 27 },
  { label: "Ish", value: 18 },
  { label: "Biznes", value: 11 },
  { label: "Boshqa", value: 6 },
];

export const CONVERSION_FUNNEL: FunnelStep[] = [
  { label: "Ro'yxatdan o'tganlar", value: 1248 },
  { label: "Birinchi tahlilni boshlaganlar", value: 934 },
  { label: "Hujjat yuklaganlar", value: 701 },
  { label: "AI Interview bajarganlar", value: 412 },
  { label: "Pullik rejaga o'tganlar", value: 105 },
];

export const RETENTION_TREND: TrendPoint[] = [
  { label: "1-hafta", value: 100 },
  { label: "2-hafta", value: 78 },
  { label: "3-hafta", value: 64 },
  { label: "4-hafta", value: 55 },
  { label: "8-hafta", value: 41 },
];

export const REVENUE_TREND: TrendPoint[] = [
  { label: "Yan", value: 4 },
  { label: "Fev", value: 7 },
  { label: "Mar", value: 11 },
  { label: "Apr", value: 16 },
  { label: "May", value: 22 },
  { label: "Iyun", value: 29 },
  { label: "Iyul", value: 38 },
];

export const ENGAGEMENT_DATA: CategoryDatum[] = [
  { label: "Dashboard", value: 100 },
  { label: "Hujjatlar", value: 82 },
  { label: "Readiness Score", value: 76 },
  { label: "AI Interview", value: 58 },
  { label: "Konsultatsiya", value: 24 },
];

// --- Agency ------------------------------------------------------------------

export const AGENCY_NAV: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: "Umumiy ko'rinish", href: "/agency" },
  { icon: Users, label: "Mijozlar", href: "/agency" },
  { icon: UserPlus, label: "Yangi mijoz", href: "/agency" },
  { icon: FileSearch2, label: "Arizalar", href: "/agency" },
  { icon: FolderOpen, label: "Hujjatlar", href: "/agency" },
  { icon: Building2, label: "Jamoa", href: "/agency" },
  { icon: ClipboardList, label: "Hisobotlar", href: "/reports" },
  { icon: Landmark, label: "Tarif va billing", href: "/pricing" },
  { icon: Palette, label: "Agentlik sozlamalari", href: "/agency/white-label" },
];

export const AGENCY_OVERVIEW = {
  totalClients: 46,
  activeApplications: 31,
  highRiskCases: 5,
  consultations: 12,
  teamMembers: 4,
  monthlyUsage: "78%",
};

export const AGENCY_CLIENTS: AgencyClient[] = [
  {
    id: "cl-1",
    name: "Diyora Rakhimova",
    initials: "DR",
    country: "AQSH",
    flag: "🇺🇸",
    visaType: "Business Visa",
    readinessScore: 88,
    status: "Tayyor",
    assignedSpecialist: "Diloram Xasanova",
    lastUpdate: "2 soat oldin",
    documents: [
      { label: "Passport", status: "Tasdiqlandi" },
      { label: "Bank statement", status: "Tasdiqlandi" },
      { label: "Taklifnoma", status: "Tasdiqlandi" },
    ],
    riskFactors: ["Oldingi safarlar soni kam"],
    interviewScore: 81,
    recommendations: ["Safar maqsadini yanada aniqroq bayon qilish tavsiya etiladi"],
    notes: [
      { id: "n1", author: "Diloram Xasanova", text: "Mijoz barcha hujjatlarni taqdim etdi.", date: "2 kun oldin" },
    ],
    timeline: [
      { label: "Ariza yaratildi", date: "01-iyun" },
      { label: "Hujjatlar yuklandi", date: "05-iyun" },
      { label: "AI tahlili yakunlandi", date: "07-iyun" },
    ],
  },
  {
    id: "cl-2",
    name: "Javlon Tursunov",
    initials: "JT",
    country: "Kanada",
    flag: "🇨🇦",
    visaType: "Work Visa",
    readinessScore: 64,
    status: "Konsultatsiya kerak",
    assignedSpecialist: "Sardor Egamov",
    lastUpdate: "5 soat oldin",
    documents: [
      { label: "Passport", status: "Tasdiqlandi" },
      { label: "Bank statement", status: "Kamchilik bor" },
      { label: "Ish joyidan ma'lumotnoma", status: "Yuklanmagan" },
    ],
    riskFactors: ["Moliyaviy hujjatlarda kamchilik", "Ish tajribasi tasdiqlanmagan"],
    interviewScore: 58,
    recommendations: ["Bank statementni to'g'rilash", "Ish joyidan yangi ma'lumotnoma olish"],
    notes: [],
    timeline: [
      { label: "Ariza yaratildi", date: "10-iyun" },
      { label: "Hujjatlar qisman yuklandi", date: "14-iyun" },
    ],
  },
  {
    id: "cl-3",
    name: "Madina Yusupova",
    initials: "MY",
    country: "Germaniya",
    flag: "🇩🇪",
    visaType: "Student Visa",
    readinessScore: 91,
    status: "Yakunlangan",
    assignedSpecialist: "Diloram Xasanova",
    lastUpdate: "3 kun oldin",
    documents: [
      { label: "Passport", status: "Tasdiqlandi" },
      { label: "Taklifnoma", status: "Tasdiqlandi" },
      { label: "Sug'urta", status: "Tasdiqlandi" },
    ],
    riskFactors: [],
    interviewScore: 89,
    recommendations: ["Qo'shimcha tavsiya yo'q — ariza yakunlangan"],
    notes: [
      { id: "n2", author: "Diloram Xasanova", text: "Ariza muvaffaqiyatli yakunlandi.", date: "3 kun oldin" },
    ],
    timeline: [
      { label: "Ariza yaratildi", date: "02-may" },
      { label: "Hujjatlar yuklandi", date: "06-may" },
      { label: "Konsultatsiya o'tkazildi", date: "12-may" },
      { label: "Ariza yakunlandi", date: "20-may" },
    ],
  },
  {
    id: "cl-4",
    name: "Sherzod Aliyev",
    initials: "SA",
    country: "Buyuk Britaniya",
    flag: "🇬🇧",
    visaType: "Tourist Visa",
    readinessScore: 47,
    status: "Jarayonda",
    assignedSpecialist: "Nilufar Qodirova",
    lastUpdate: "1 kun oldin",
    documents: [
      { label: "Passport", status: "Tasdiqlandi" },
      { label: "Bank statement", status: "Yuklanmagan" },
      { label: "Aviachipta bron", status: "Yuklanmagan" },
    ],
    riskFactors: ["Oldingi rad javobi mavjud", "Moliyaviy hujjatlar to'liq emas"],
    interviewScore: 44,
    recommendations: ["Rad javobini tahlil qilish moduli orqali sabablarni aniqlash", "AI Interview mashqini boshlash"],
    notes: [],
    timeline: [{ label: "Ariza yaratildi", date: "16-iyul" }],
  },
];

// --- Documents — AI insight demo -----------------------------------------

export const DOC_DETECTED_FIELDS: Record<string, DetectedField[]> = {
  passport: [
    { label: "To'liq ism", value: "Vazira Zokirova", confidence: 97 },
    { label: "Passport raqami", value: "AA1234567", confidence: 95 },
    { label: "Berilgan sana", value: "14-mart, 2022", confidence: 92 },
    { label: "Amal qilish muddati", value: "14-mart, 2032", confidence: 94 },
  ],
  bank: [
    { label: "Hisob egasi", value: "V. ZOKIROVA", confidence: 61, issue: "To'liq ism ko'rsatilmagan" },
    { label: "Bank hisobidagi mablag'", value: "42 500 000 so'm", confidence: 88 },
    { label: "Hisob raqami", value: "•••• 4821", confidence: 90 },
  ],
  employment: [
    { label: "Ish beruvchi", value: "IT Solutions MChJ", confidence: 93 },
    { label: "Lavozim", value: "Loyiha menejeri", confidence: 90 },
    { label: "Oylik daromad", value: "9 200 000 so'm", confidence: 85 },
  ],
  insurance: [
    { label: "Sug'urta turi", value: "Sayohat sug'urtasi", confidence: 89 },
    { label: "Amal qilish muddati", value: "01-iyul — 10-iyul, 2026", confidence: 76, issue: "Muddat safar sanasidan oldin tugaydi" },
  ],
};

export const DOC_QUALITY_SCORES: Record<string, number> = {
  passport: 96,
  bank: 68,
  employment: 91,
  invitation: 0,
  hotel: 0,
  flight: 84,
  insurance: 72,
  extra: 0,
};

export const DOC_AI_SUMMARY: Record<string, string> = {
  passport: "Hujjat sifati yuqori, barcha maydonlar aniq o'qildi.",
  bank: "Hisob egasining to'liq ismi aniq ko'rinmayapti — hujjatni qayta yuklashni tavsiya qilamiz.",
  employment: "Hujjat talablarga mos, qo'shimcha tuzatish shart emas.",
  insurance: "Sug'urta muddati safar sanasi bilan mos emas — yangilangan sug'urta yuklang.",
};

// --- Readiness score advanced ------------------------------------------------

export const SCORE_HISTORY: TrendPoint[] = READINESS_TREND;

export const WHAT_CHANGED_SINCE_LAST = [
  "Bank statement yuklandi (+5 ball)",
  "AI Interview mashqi yakunlandi (+8 ball)",
  "Taklifnoma hali yuklanmagan (o'zgarishsiz)",
];

export const IMPROVED_PROFILE_CATEGORIES: ReadinessCategory[] = [
  { label: "Shaxsiy profil", score: 97 },
  { label: "Hujjatlar tayyorligi", score: 92 },
  { label: "Moliyaviy holat", score: 88 },
  { label: "Safar maqsadi", score: 90 },
  { label: "Intervyuga tayyorgarlik", score: 85 },
  { label: "Oldingi viza tarixi", score: 85 },
];

export const ACTION_IMPACTS = [
  { id: "a1", label: "Bank mablag'ini tasdiqlovchi hujjat qo'shish", points: 6 },
  { id: "a2", label: "Mehmonxona bron hujjatini yuklash", points: 4 },
  { id: "a3", label: "AI Interview simulyatorida 2 ta qo'shimcha mashq", points: 5 },
  { id: "a4", label: "Taklifnoma qo'shish", points: 3 },
];

export const RISK_DRIVERS = [
  "Moliyaviy hujjatlarda kamchilik",
  "Ba'zi hujjatlar hali yuklanmagan",
  "Intervyuga tayyorgarlik darajasi past",
];

export const CATEGORY_WEIGHTS = [
  { label: "Hujjatlar tayyorligi", weight: "30%" },
  { label: "Moliyaviy holat", weight: "25%" },
  { label: "Safar maqsadi", weight: "20%" },
  { label: "Intervyuga tayyorgarlik", weight: "15%" },
  { label: "Oldingi viza tarixi", weight: "10%" },
];

// --- AI Interview enhancement -----------------------------------------------

export const INTERVIEW_DIFFICULTIES = ["Oson", "O'rtacha", "Qiyin"];

export const INTERVIEW_COUNTRY_QUESTION_SETS: Record<string, InterviewQuestion[]> = {
  "Janubiy Koreya": INTERVIEW_QUESTIONS,
  AQSH: [
    { id: 1, question: "Nima uchun aynan AQSHga sayohat qilmoqchisiz?" },
    { id: 2, question: "AQSHda qarindoshlaringiz yoki tanishlaringiz bormi?" },
    { id: 3, question: "O'zbekistonda sizni bog'lab turadigan narsalar nima?" },
    { id: 4, question: "Safar uchun mablag'ni qanday jamg'ardingiz?" },
    { id: 5, question: "Safaringiz necha kun davom etadi?" },
  ],
  Germaniya: [
    { id: 1, question: "Nima uchun Germaniyani tanladingiz?" },
    { id: 2, question: "O'qish/ish rejalaringiz qanday?" },
    { id: 3, question: "Nemis tilini bilasizmi?" },
    { id: 4, question: "Germaniyada turar joyingiz bormi?" },
    { id: 5, question: "Safar tugagach qaytish rejangiz qanday?" },
  ],
};

export const INTERVIEW_SESSION_HISTORY = [
  { date: "3 hafta oldin", score: 52 },
  { date: "2 hafta oldin", score: 61 },
  { date: "1 hafta oldin", score: 68 },
  { date: "Bugun", score: 76 },
];

// --- Notifications ------------------------------------------------------------

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "document_expiring",
    icon: FileClock,
    title: "Sug'urta muddati tugamoqda",
    description: "Sug'urta hujjatingiz safar sanasidan oldin tugaydi.",
    time: "1 soat oldin",
    read: false,
  },
  {
    id: "n2",
    type: "score_changed",
    icon: Gauge,
    title: "Visa Readiness Score yangilandi",
    description: "Tayyorgarlik darajangiz 74 dan 82 ga oshdi.",
    time: "Bugun, 09:00",
    read: false,
  },
  {
    id: "n3",
    type: "missing_document",
    icon: FileWarning,
    title: "Hujjat yetishmayapti",
    description: "Mehmonxona bron hujjati hali yuklanmagan.",
    time: "Kecha",
    read: false,
  },
  {
    id: "n4",
    type: "consultation_reminder",
    icon: CalendarClock,
    title: "Konsultatsiya eslatmasi",
    description: "Diloram Xasanova bilan konsultatsiyangiz ertaga soat 14:00 da.",
    time: "Kecha",
    read: true,
  },
  {
    id: "n5",
    type: "recommendation",
    icon: Sparkles,
    title: "Yangi tavsiya",
    description: "AI Interview simulyatorida qo'shimcha mashq tavsiya etiladi.",
    time: "2 kun oldin",
    read: true,
  },
  {
    id: "n6",
    type: "interview_reminder",
    icon: MessagesSquare,
    title: "Intervyu mashqi eslatmasi",
    description: "Oxirgi mashqingizdan 5 kun o'tdi — davom eting.",
    time: "3 kun oldin",
    read: true,
  },
  {
    id: "n7",
    type: "status_update",
    icon: BadgeCheck,
    title: "Ariza holati yangilandi",
    description: "Janubiy Koreya arizangiz \"Tahlil jarayonida\" holatiga o'tdi.",
    time: "4 kun oldin",
    read: true,
  },
];

// --- Reports --------------------------------------------------------------

export const REPORTS: ReportItem[] = [
  {
    id: "r1",
    icon: Gauge,
    title: "Visa Readiness hisobot",
    description: "To'liq tayyorgarlik bahosi va kategoriyalar bo'yicha taqsimot.",
    date: "Bugun",
    status: "Tayyor",
  },
  {
    id: "r2",
    icon: FolderOpen,
    title: "Hujjatlar tahlili hisoboti",
    description: "Barcha yuklangan hujjatlar bo'yicha AI tahlili xulosasi.",
    date: "Kecha",
    status: "Tayyor",
  },
  {
    id: "r3",
    icon: MessagesSquare,
    title: "Intervyuga tayyorgarlik hisoboti",
    description: "AI Interview mashqlari natijalari va tavsiyalar.",
    date: "2 kun oldin",
    status: "Tayyor",
  },
  {
    id: "r4",
    icon: FileWarning,
    title: "Rad etilish tahlili hisoboti",
    description: "Oldingi rad javobi tahlili va keyingi qadamlar.",
    date: "—",
    status: "Yaratilmoqda",
  },
  {
    id: "r5",
    icon: FileBarChart2,
    title: "To'liq ariza xulosasi",
    description: "Barcha bosqichlarni birlashtirgan umumiy hisobot.",
    date: "Bugun",
    status: "Tayyor",
  },
];

// --- Roadmap -----------------------------------------------------------------

export const ROADMAP_ITEMS: RoadmapItem[] = [
  { stage: "completed", icon: Home, title: "Landing page", description: "Marketing sayti va brend identifikatsiyasi." },
  { stage: "completed", icon: LayoutDashboard, title: "Foydalanuvchi dashboardi", description: "Shaxsiy kabinet va umumiy ko'rinish." },
  { stage: "completed", icon: FileSearch2, title: "Assessment oqimi", description: "Ko'p bosqichli viza so'rovnomasi." },
  { stage: "completed", icon: ScanSearch, title: "Hujjatlar tahlili demo", description: "Hujjat yuklash va demo AI tahlili." },
  { stage: "completed", icon: Gauge, title: "Readiness Score", description: "Tayyorgarlik darajasini baholash tizimi." },
  { stage: "completed", icon: MessagesSquare, title: "Interview simulyatori", description: "Mock intervyu savollari va fikr-mulohaza." },
  { stage: "completed", icon: FileWarning, title: "Rad javobi tahlili", description: "Oldingi rad sabablarini tahlil qilish demo." },
  { stage: "completed", icon: UserCog, title: "Konsultatsiya bandlash", description: "Mutaxassislar bilan uchrashuv rejalashtirish." },
  { stage: "in_progress", icon: Sparkles, title: "Haqiqiy AI integratsiyasi", description: "Demo tahlillarni ishlab chiqarish darajasidagi AI modellariga almashtirish." },
  { stage: "in_progress", icon: ScanSearch, title: "OCR pipeline", description: "Haqiqiy hujjatlarni avtomatik o'qish tizimi." },
  { stage: "in_progress", icon: Globe2, title: "Davlat qoidalari dvijoki", description: "Har bir davlat uchun rasmiy talablar bazasi." },
  { stage: "in_progress", icon: UserCog, title: "Mutaxassislar bozori", description: "Ko'plab mustaqil mutaxassislarni platformaga qo'shish." },
  { stage: "future", icon: Smartphone, title: "Mobil ilova", description: "iOS va Android uchun native ilovalar." },
  { stage: "future", icon: Server, title: "Davlat API integratsiyalari", description: "Rasmiy konsullik tizimlari bilan integratsiya." },
  { stage: "future", icon: Building2, title: "Agentlik CRM", description: "To'liq huquqli agentlik boshqaruv tizimi." },
  { stage: "future", icon: Palette, title: "White-label platforma", description: "Boshqa kompaniyalar uchun oq etiketkali yechim." },
  { stage: "future", icon: Rocket, title: "Mintaqaviy kengayish", description: "Markaziy Osiyo va undan tashqarida faoliyatni kengaytirish." },
];

// --- Onboarding ------------------------------------------------------------

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  { id: "welcome", title: "VIZAR AI'ga xush kelibsiz", description: "Viza olish jarayonini sun'iy intellekt bilan osonlashtiramiz." },
  { id: "country", title: "Davlatni tanlang", description: "Qaysi davlatga sayohat qilmoqchisiz?" },
  { id: "visa-type", title: "Viza turini tanlang", description: "Sizga mos viza turini belgilang." },
  { id: "goal", title: "Maqsadingizni tanlang", description: "Platformadan nima uchun foydalanmoqchisiz?" },
  { id: "profile", title: "Profil ma'lumotlari", description: "Asosiy ma'lumotlaringizni kiriting." },
  { id: "start", title: "Birinchi tahlilni boshlang", description: "Hammasi tayyor — endi tahlilni boshlashingiz mumkin." },
];

export const ONBOARDING_GOALS = [
  "Vizaga tayyorgarlikni baholash",
  "Hujjatlarni tekshirish",
  "Intervyuga tayyorlanish",
  "Oldingi rad javobini tushunish",
];

// --- Command palette ---------------------------------------------------------

export const COMMAND_ITEMS: CommandItem[] = [
  { id: "c1", icon: LayoutDashboard, label: "Dashboardni ochish", group: "Sahifalar", action: "navigate", href: "/dashboard" },
  { id: "c2", icon: FileSearch2, label: "Yangi tahlilni boshlash", group: "Amallar", action: "navigate", href: "/assessment" },
  { id: "c3", icon: FolderOpen, label: "Hujjat yuklash", group: "Amallar", action: "navigate", href: "/documents" },
  { id: "c4", icon: MessagesSquare, label: "Intervyu mashq qilish", group: "Amallar", action: "navigate", href: "/ai-interview" },
  { id: "c5", icon: ListChecks, label: "Tavsiyalarni ko'rish", group: "Sahifalar", action: "navigate", href: "/recommendations" },
  { id: "c6", icon: UserCog, label: "Konsultatsiya band qilish", group: "Amallar", action: "navigate", href: "/consultation" },
  { id: "c7", icon: Bell, label: "Bildirishnomalarni ochish", group: "Sahifalar", action: "navigate", href: "/notifications" },
  { id: "c8", icon: FileBarChart2, label: "Hisobotlarni ochish", group: "Sahifalar", action: "navigate", href: "/reports" },
  { id: "c9", icon: Moon, label: "Rejimni almashtirish", group: "Amallar", action: "theme" },
  { id: "c10", icon: Globe, label: "Tilni almashtirish", group: "Amallar", action: "language" },
];

// --- Trust center FAQ --------------------------------------------------------

export const TRUST_FAQ: FAQItem[] = [
  {
    question: "Mening ma'lumotlarim qayerda saqlanadi?",
    answer: "Demo versiyada barcha ma'lumotlar faqat brauzeringizda (local state) saqlanadi va hech qanday serverga yuborilmaydi.",
  },
  {
    question: "VIZAR AI qanday shifrlash ishlatadi?",
    answer: "Ishlab chiqarish versiyasida sanoat standarti shifrlash qo'llanilishi rejalashtirilgan. Demo versiyada bu funksiya faol emas.",
  },
  {
    question: "Sun'iy intellekt qarorlarini odam tekshiradimi?",
    answer: "Ha, muhim qarorlar (masalan, konsultatsiya tavsiyalari) uchun inson tomonidan ko'rib chiqish jarayoni rejalashtirilgan.",
  },
  {
    question: "Kompaniya ISO yoki GDPR sertifikatiga egami?",
    answer: "Yo'q, hozircha bunday sertifikatlarga ega emasmiz. Bular kelajakdagi maqsadlarimiz sifatida belgilangan.",
  },
];
