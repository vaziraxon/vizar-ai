import {
  BookOpen,
  Bot,
  Building2,
  Camera,
  Database,
  FileText,
  FileWarning,
  FolderOpen,
  Gauge,
  Globe2,
  LayoutDashboard,
  ListChecks,
  Lock,
  MessagesSquare,
  Palette,
  Rocket,
  Route,
  ScanSearch,
  Server,
  ShieldAlert,
  Smartphone,
  Sparkles,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";

/**
 * Structure of the /roadmap and /trust-center pages: which item sits in
 * which stage, with which icon. The words are in the site copy
 * (roadmapPage, trustPage), keyed by these ids.
 */
export const ROADMAP_STAGES = ["completed", "in_progress", "future"] as const;
export type RoadmapStage = (typeof ROADMAP_STAGES)[number];

export const ROADMAP = [
  { id: "site", stage: "completed", icon: Globe2 },
  { id: "dashboard", stage: "completed", icon: LayoutDashboard },
  { id: "readiness", stage: "completed", icon: Gauge },
  { id: "documents", stage: "completed", icon: FolderOpen },
  { id: "checklist", stage: "completed", icon: ListChecks },
  { id: "interview", stage: "completed", icon: MessagesSquare },
  { id: "tracker", stage: "completed", icon: Route },
  { id: "rejection", stage: "completed", icon: FileWarning },
  { id: "experts", stage: "completed", icon: UserCog },
  { id: "tools", stage: "completed", icon: Camera },
  { id: "library", stage: "completed", icon: BookOpen },
  { id: "account", stage: "completed", icon: UserCheck },
  { id: "countries", stage: "in_progress", icon: Globe2 },
  { id: "network", stage: "in_progress", icon: Users },
  { id: "ai", stage: "future", icon: Sparkles },
  { id: "ocr", stage: "future", icon: ScanSearch },
  { id: "mobile", stage: "future", icon: Smartphone },
  { id: "gov", stage: "future", icon: Server },
  { id: "crm", stage: "future", icon: Building2 },
  { id: "whiteLabel", stage: "future", icon: Palette },
  { id: "region", stage: "future", icon: Rocket },
] as const satisfies readonly { id: string; stage: RoadmapStage; icon: unknown }[];
export type RoadmapId = (typeof ROADMAP)[number]["id"];

export const TRUST_PRINCIPLES = [
  { id: "privacy", icon: Lock },
  { id: "encryption", icon: Database },
  { id: "minimal", icon: FileText },
  { id: "control", icon: UserCheck },
  { id: "documents", icon: ShieldAlert },
  { id: "ai", icon: Bot },
  { id: "people", icon: Users },
] as const;
export type TrustPrincipleId = (typeof TRUST_PRINCIPLES)[number]["id"];

/** Security measures: what is in place now and what is still planned */
export const SECURITY_ITEMS = [
  { id: "tls", done: true },
  { id: "roles", done: true },
  { id: "rateLimit", done: true },
  { id: "headers", done: true },
  { id: "csp", done: false },
  { id: "audit", done: false },
  { id: "law", done: false },
] as const;
export type SecurityItemId = (typeof SECURITY_ITEMS)[number]["id"];

/** The company behind VIZAR AI (public registry data) — shown on /about and in the footer */
export const COMPANY = {
  name: "VIZAR-TOUR",
  stir: "312 317 579",
  phone: "+998771792575",
  phoneDisplay: "+998 77 179 25 75",
  license: "964533",
} as const;
