import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export interface Language {
  code: string;
  label: string;
}

export interface TrustFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "brand" | "success" | "accent" | "warning";
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface FloatingInsight {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

// --- Stage 2 -----------------------------------------------------------

export interface ProblemCard {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "red" | "orange" | "violet";
}

export interface SolutionModule {
  icon: LucideIcon;
  title: string;
  side: "left" | "right";
}

export interface AIFeature {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  icon: LucideIcon;
  title: string;
}

// --- Stage 3 -----------------------------------------------------------

export interface VisaType {
  icon: LucideIcon;
  title: string;
  description: string;
}

export type VisaDifficulty = "Oson" | "O'rtacha" | "Murakkab";

export interface CountryCard {
  code: string;
  flag: string;
  name: string;
  difficulty: VisaDifficulty;
  processingTime: string;
  description: string;
}

export interface Testimonial {
  initials: string;
  name: string;
  country: string;
  review: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// --- Stage 4 -------------------------------------------------------------

export interface SidebarNavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export type DocStatus =
  | "Tasdiqlandi"
  | "Kamchilik bor"
  | "Yangilash kerak"
  | "Yuklanmagan"
  | "AI tahlil qilmoqda";

export interface DocumentItem {
  id: string;
  icon: LucideIcon;
  title: string;
  status: DocStatus;
  note?: string;
}

export interface ReadinessCategory {
  label: string;
  score: number;
}

export type RiskLevel = "Past" | "O'rta" | "Yuqori";

export interface InterviewQuestion {
  id: number;
  question: string;
}

export interface InterviewFeedback {
  accuracy: number;
  confidence: number;
  consistency: number;
  riskyPhrases: string[];
  improvedExample: string;
}

export interface Specialist {
  id: string;
  name: string;
  experience: string;
  languages: string[];
  specialization: string;
  rating: number;
  avatarInitials: string;
  availableDates: string[];
  availableSlots: string[];
}

export type ApplicationStatus =
  | "Draft"
  | "Tahlil qilinmoqda"
  | "Tayyor"
  | "Konsultatsiya kerak"
  | "Yakunlangan";

export interface ApplicationRecord {
  id: string;
  country: string;
  flag: string;
  visaType: string;
  createdDate: string;
  readinessScore: number;
  status: ApplicationStatus;
  lastUpdate: string;
}

export type TaskStatus = "Bajarildi" | "Jarayonda" | "Boshlanmagan" | "Muhim";

export interface RecommendationTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueLabel: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

export interface AdminStat {
  icon: LucideIcon;
  label: string;
  value: string;
}

// --- Stage 5 -------------------------------------------------------------

export interface TrendPoint {
  label: string;
  value: number;
}

export interface CategoryDatum {
  label: string;
  value: number;
}

export interface ActivityTimelineItem {
  icon: LucideIcon;
  title: string;
  time: string;
}

export interface KpiCardData {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
}

export interface FunnelStep {
  label: string;
  value: number;
}

export type ClientStatus =
  | "Yangi"
  | "Jarayonda"
  | "Konsultatsiya kerak"
  | "Tayyor"
  | "Yakunlangan";

export interface AgencyClient {
  id: string;
  name: string;
  initials: string;
  country: string;
  flag: string;
  visaType: string;
  readinessScore: number;
  status: ClientStatus;
  assignedSpecialist: string;
  lastUpdate: string;
  documents: { label: string; status: DocStatus }[];
  riskFactors: string[];
  interviewScore: number;
  recommendations: string[];
  notes: { id: string; author: string; text: string; date: string }[];
  timeline: { label: string; date: string }[];
}

export interface DetectedField {
  label: string;
  value: string;
  confidence: number;
  issue?: string;
}

export type NotificationType =
  | "missing_document"
  | "document_expiring"
  | "recommendation"
  | "consultation_reminder"
  | "score_changed"
  | "interview_reminder"
  | "status_update";

export interface AppNotification {
  id: string;
  type: NotificationType;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export type ReportStatus = "Tayyor" | "Yaratilmoqda";

export interface ReportItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  date: string;
  status: ReportStatus;
}

export type RoadmapStage = "completed" | "in_progress" | "future";

export interface RoadmapItem {
  stage: RoadmapStage;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface OnboardingStepConfig {
  id: string;
  title: string;
  description: string;
}

export interface CommandItem {
  id: string;
  icon: LucideIcon;
  label: string;
  group: "Sahifalar" | "Amallar";
  action: "navigate" | "theme" | "language";
  href?: string;
}

