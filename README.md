# VIZAR AI — Web Platform

AI Visa Assistant — sun'iy intellekt yordamida viza olish jarayonini
raqamlashtiruvchi platforma.

## Stage 1

1. Project setup (Next.js 14, App Router, TypeScript, Tailwind CSS)
2. Global design system (`tailwind.config.ts`, `src/app/globals.css`)
3. Sticky `Header` (logo, nav, language selector, login, CTA)
4. `Hero` section (headline, subtitle, CTAs, phone mockup + floating AI cards)
5. `TrustSection` — four feature cards sourced from the deck
6. Simple `Footer` placeholder

## Stage 2 (this delivery)

Added below Stage 1, without modifying its existing sections:

1. `ProblemSection` — "Viza olish jarayonidagi asosiy muammolar", six cards
   with red / orange / violet warning accents
2. `SolutionSection` — "VIZAR AI — barcha jarayonlar uchun yagona yechim",
   an AI core hub surrounded by 8 solution modules, on a dark navy surface
3. `FeaturesSection` — "Sun'iy intellekt imkoniyatlari", six numbered
   premium feature cards
4. `HowItWorksSection` — "VIZAR AI qanday ishlaydi?", 5 connected steps
   (horizontal timeline on desktop, vertical on mobile)
5. `DisclaimerCard` — elegant safety disclaimer, shown in a new `#about`
   section above the footer
6. `Header` nav updated to scroll to: Bosh sahifa, Muammo, Yechim,
   Imkoniyatlar, Qanday ishlaydi, Biz haqimizda, Aloqa

**Content rules applied:** all unverified achievement claims ("50,000+"
users, "94%" accuracy, "150+" countries) were removed from Stage 1 copy
and replaced with target-labeled or claim-free copy. No guaranteed-approval
language is used anywhere. All content is in Uzbek and uses mock data only.
No backend, login, or payments are implemented.

No other sections (pricing, testimonials, full about page, etc.) are
built yet — those are later stages.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — design tokens in `tailwind.config.ts`
- **Framer Motion** — entrance, floating, and scroll-reveal animations
- **Lucide React** — icon set

## Project structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout, fonts, metadata
│   ├── page.tsx          # Page composition (Stage 1 + Stage 2)
│   └── globals.css       # Design system base styles
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Sticky nav (7 items)
│   │   └── Footer.tsx        # Simple footer
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── TrustSection.tsx
│   │   ├── ProblemSection.tsx      # Stage 2
│   │   ├── SolutionSection.tsx     # Stage 2
│   │   ├── FeaturesSection.tsx     # Stage 2
│   │   └── HowItWorksSection.tsx   # Stage 2
│   ├── hero/
│   │   ├── PhoneMockup.tsx   # Passport, plane, globe, phone, AI cards
│   │   └── FloatingCard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Logo.tsx
│       ├── LanguageSelector.tsx
│       └── DisclaimerCard.tsx      # Stage 2
├── lib/
│   ├── constants.ts       # Nav items, languages, all section copy
│   └── utils.ts           # cn() class-merge helper
└── types/
    └── index.ts
```

## Design tokens (summary)

| Token | Value |
|---|---|
| Primary (brand-600) | `#2E1FD0` |
| Accent (cyan-500) | `#22D3EE` |
| Navy surface | `#0E1A44` |
| Background tint | `#F6F7FD` |
| Warning accents (Stage 2) | Tailwind red / orange / violet defaults |
| Display font | Space Grotesk |
| Body font | Inter |
| Radius scale | 8 / 12 / 16 / 20 / 28 / 36px, pill |
| Shadows | xs, sm, card, card-hover, float, glow, glow-cyan |

## Stage 3 (this delivery)

Added below Stage 2, without modifying any Stage 1 or Stage 2 section:

1. `VisaTypesSection` — "Qo'llab-quvvatlanadigan viza turlari", six visa
   type cards (Tourist, Student, Work, Business, Family, Immigration) each
   with icon, description, and a "Batafsil" (learn more) button
2. `CountriesSection` — eight country cards (USA, Canada, UK, Germany,
   Australia, Japan, South Korea, UAE) with flag, difficulty badge,
   average processing time, and description. Figures are explicitly
   labeled as indicative estimates, not official guarantees
3. `TestimonialsSection` — six demo testimonial cards with avatar
   initials, name, country, review, and star rating (mock data only)
4. `FAQSection` — accordion with 11 questions, animated expand/collapse
   via Framer Motion
5. `FinalCTASection` — large closing CTA ("Bugunoq viza tayyorgarligingizni
   boshlang") with "Bepul boshlash" and "Demo ko'rish" buttons
6. `ContactSection` — email, phone, Telegram, address cards plus a
   front-end-only demo contact form (no backend submission yet)

**Necessary technical fix:** `Footer`'s `id` was changed from `contact`
to `site-footer` (content and design untouched) because the new
`ContactSection` is now the real target for the existing "Aloqa" nav
link and needed the `#contact` anchor — two elements can't share one
id. This is the only change to a Stage 1/2 file in this delivery.

No backend, login, or payments are implemented — the contact form only
shows a local "submitted" state.

## Stage 4 (this delivery)

Turns the marketing site into an interactive demo SaaS platform, for a
grant/investor walkthrough. **Everything is client-side and mock —
no backend, no database, no real auth, no real payments, no real AI.**

### Authentication demo
- `/login`, `/register`, `/forgot-password` — full client-side validation,
  demo-only "success" flow that redirects to `/dashboard`

### Dashboard & tools (all under a shared sidebar + topbar shell)
- `/dashboard` — greeting, current application card, progress tracker,
  stat cards, recent activity, next steps
- `/assessment` — 5-step questionnaire with validation, redirects to
  `/readiness-score` on completion
- `/documents` — drag-and-drop mock upload per document, fake progress →
  fake AI analysis → mock result text
- `/readiness-score` — animated score ring, category progress bars, risk
  level, strengths/weaknesses, missing docs, priority tasks, disclaimer
- `/ai-interview` — mock question flow, timer, per-answer mock AI
  feedback, final readiness result
- `/refusal-analysis` — form + mock AI breakdown (reasons, financial risk,
  purpose risk, recommendations, reapplication waiting period)
- `/recommendations` — task list with cycling status, reminders, country
  tip, interview tip, consultation tip
- `/consultation` — specialist cards → booking modal (date/time picker) →
  confirmation (no payment)
- `/applications` — table (desktop) / cards (mobile) of past & current
  applications
- `/profile` — personal info, contact, passport **placeholder** fields,
  employment, travel history
- `/settings` — language, dark mode, notifications, privacy toggles,
  password change, demo account-delete modal
- `/pricing` — 4 plans (Bepul / Standard / Premium / B2B), buttons open a
  demo modal instead of a real checkout
- `/admin` — separate admin shell + nav, stat cards, mock bar/percentage
  charts, recent users, flagged documents, support requests
- `/not-found` (404)

### Cross-cutting
- **Dark mode** — `ThemeProvider` (`src/lib/theme-context.tsx`) persists
  to `localStorage`, toggle in the marketing header, dashboard topbar,
  and settings page. All Stage 4 pages are dark-mode styled.
- **Language selector** — `LanguageProvider` (`src/lib/language-context.tsx`)
  + `src/lib/translations.ts`. Uzbek carries full content everywhere;
  Russian/English cover common nav/UI labels as a demo of the structure,
  ready to extend.
- **Routing** — marketing site's "Bepul tahlilni boshlash" → `/register`,
  "Kirish" → `/login`, "Demo ko'rish" → `/dashboard`.

### Data & reusable components
- `src/data/mockData.ts` — single source of truth for every mock record
  (user, application, documents, readiness scores, interview questions,
  specialists, application history, pricing, admin stats)
- `src/components/dashboard/` — `DashboardShell`, `Sidebar`, `Topbar`,
  `ScoreRing`, `ProgressBar`, `StatusBadge`, `StatCard`, `DocumentCard`
- `src/components/forms/` — `TextField`, `SelectField`, `Stepper`
- `src/components/auth/AuthCard.tsx`
- `src/components/modals/Modal.tsx`

### Content rules applied
- No claim of guaranteed visa approval anywhere (explicit disclaimers on
  `/readiness-score`, `/documents`, and repeated where relevant)
- No fabricated usage stats (user counts, success rates) introduced
- No real passport/financial data requested — placeholders only, with an
  explicit on-screen warning on `/documents` and `/profile`
- All visible text in Uzbek

### One necessary technical change to a Stage 1 file
`Header.tsx` — "Kirish" and "Bepul tahlilni boshlash" changed from
anchor placeholders to real `next/link` routes (`/login`, `/register`),
and a `ThemeToggle` button was added, per Stage 4's explicit routing and
dark-mode requirements. Visual design/branding unchanged.

## Stage 5 (this delivery)

Polishes the platform into an investor/grant-ready demo. **No Stage 1–4
section was removed or redesigned** — this stage adds analytics, an
agency workspace, richer AI demos, and app-wide UX polish on top.

### New pages
- `/investor-analytics` — KPI cards + 8 charts (Recharts), explicit
  "Demo ma'lumotlar" banner
- `/agency` — B2B agency dashboard (own sidebar via the now-generic
  `Sidebar`/`DashboardShell`), overview stats, client table
- `/agency/clients/[id]` — client detail: profile, score, doc checklist,
  risk factors, interview result, recommendations, notes (add demo
  note), status/specialist change, timeline
- `/agency/white-label` — logo upload preview (local `FileReader`, no
  upload), brand colors, live client-portal preview, demo save
- `/notifications` — 7 notification types, read/unread, filters, mark
  all read, empty state
- `/reports` — 5 report cards, printable HTML preview modal
  (`window.print()`), demo download/share
- `/roadmap` — public, investor-presentation style (Bajarildi /
  Jarayonda / Kelajakda)
- `/trust-center` — public, privacy/security principles, FAQ; explicitly
  states no ISO/SOC 2/GDPR/government certification is held today

### Upgraded existing pages (Stage 1–4 content preserved, extended below/within)
- `/dashboard` — new analytics section: readiness trend, interview
  progress, doc completion & risk donuts, country interest bar, weekly
  summary, activity timeline, recent score changes, notifications
  preview, upcoming tasks, smart recommendations
- `/documents` — each `DocumentCard` gained a collapsible "Demo OCR
  natijasi" panel: detected fields with confidence %, issue markers,
  document quality score, AI summary — clearly labeled as non-real
- `/readiness-score` — score history chart, "what changed" list,
  current-vs-improved scenario comparison, an action-impact simulator
  (checkboxes → live simulated score, explicitly framed as readiness
  points, not approval probability), risk drivers, category weights
- `/ai-interview` — country + difficulty selectors, session history,
  waveform animation on the voice-demo button, sentiment/clarity/
  relevance scores added to feedback, printable report preview

### Cross-cutting additions
- **Charts** (`src/components/charts/`) — `TrendChartCard`,
  `BarChartCard`, `DonutChartCard` (all Recharts), `FunnelChartCard`
  (custom, no extra dependency)
- **Command palette + global search** (`src/components/search/CommandPalette.tsx`)
  — merged into one Cmd/Ctrl+K panel (search across applications,
  documents, recommendations, reports + command actions), since the
  brief's "global search" and "command palette" both specified the same
  shortcut
- **Onboarding wizard** (`src/components/onboarding/OnboardingWizard.tsx`)
  — 6-step modal, shown once via `localStorage`, skippable, reopenable
  from Settings
- **Demo mode badge** (`src/components/dashboard/DemoModeBadge.tsx`) —
  visible in the dashboard topbar, opens an info modal
- **Reusable states** (`src/components/states/`) — `SkeletonCard`,
  `SkeletonTable`, `EmptyState`, `ErrorState`, `LoadingSpinner`,
  `InlineAlert`, `SuccessToast`, `ConfirmationModal` — applied on
  Notifications (empty state), Settings (confirmation + toast), White-
  label & Client detail (toasts)
- **Accessibility** — `Modal` now closes on Escape, has
  `role="dialog"`/`aria-modal`/`aria-labelledby`; notification/task
  toggle buttons have `aria-expanded`/`aria-checked`; reduced-motion
  support was already global in `globals.css`
- **Sidebar/DashboardShell generalized** — both now accept a
  `navItems` prop so `/agency/*` reuses them instead of duplicating

### Necessary technical changes to existing files
- `Footer.tsx` (Stage 1) — added the nav link row required by section 20
  (Narxlar, Roadmap, Trust Center, Aloqa, Yuridik ogohlantirish); logo
  and copyright line unchanged
- `Sidebar.tsx` / `DashboardShell.tsx` (Stage 4) — generalized to accept
  `navItems`/`showOnboarding` props (backward compatible — every Stage 4
  page still works with no prop changes)
- `Topbar.tsx` (Stage 4) — added the search trigger and `DemoModeBadge`;
  the bell icon now links to `/notifications` and reflects unread count
- `Settings.tsx` (Stage 4) — added an "onboarding qayta ko'rish" button
  and swapped the raw delete modal for `ConfirmationModal` + `SuccessToast`
- `LanguageSelector.tsx` (Stage 1) — was already wired to context in
  Stage 4; unchanged this stage

### Content rules re-checked
No new unverified achievement claims; Trust Center explicitly disclaims
ISO/SOC 2/GDPR/government certification (listed only as future goals);
readiness-score action simulator explicitly frames point deltas as
readiness score changes, never approval probability.

### Validation performed (see note on `npm run build`)
This sandbox has no network access, so `npm install`/`npm run build`
cannot run here (same limitation as every prior stage). Instead:
- Cross-checked every local import (`@/data/mockData`, `@/types`,
  `@/lib/*`) against actual exports — all resolve
- Checked every `lucide-react` icon import is used, and verified
  less-common ones (`FileClock`, `GitCompareArrows`, `Scale`,
  `MessageCircleHeart`) against Lucide's live icon list
- `tsc --noEmit` across all 88 `.ts`/`.tsx` files — zero real errors
  (only expected "module not found" from the missing `node_modules`)
- Verified every hook-using file has `"use client"`, and no Server
  Component has an event handler
- Verified all 25 routes have a default export and no duplicate DOM ids

## Stage 6 (this delivery) — Supabase backend

Connects the frontend to a real Supabase backend (Auth, Postgres,
private Storage) as a safe MVP foundation. **No OpenAI/Gemini, no
payment provider, and no real OCR are connected** — AI/analysis
results remain simulated and are clearly labeled as demo throughout.

### What's real now (once you configure Supabase — see `SUPABASE_SETUP.md`)
- **Auth** — `/login`, `/register`, `/forgot-password` use real
  Supabase Auth (email/password), with an `/auth/callback` route for
  email confirmation and password-reset links. Google login is
  disabled with "Tez orada" rather than faked.
- **Middleware** (`src/middleware.ts`) — refreshes the session on
  every request and redirects unauthenticated users away from the 16
  protected routes to `/login`, and logged-in users away from
  `/login`/`/register`.
- **Database** (`supabase/schema.sql`) — 11 tables (profiles,
  visa_applications, assessments, documents, interview_sessions,
  recommendations, consultations, notifications, reports,
  agency_members, agency_clients), all with **RLS enabled** and
  owner-scoped policies only — no `using (true)` anywhere, no
  anonymous access.
- **Storage** (`supabase/storage.sql`) — a **private** `visa-documents`
  bucket, path-scoped RLS (`{user_id}/{application_id}/...`), 6 MB /
  PDF-JPG-PNG limits enforced at the bucket level and again in app code.
- **Pages wired to real data**: `/profile`, `/applications`
  (create/read/update/delete-draft), `/assessment` (persists per-step,
  resumable, computes a simulated score server-side and updates the
  application), `/documents` (real upload to Storage, real metadata
  row, signed-URL preview, delete), `/notifications` (read/mark-read),
  `/consultation` (book/cancel, past-date rejected), `/reports`
  (created after assessment completion, printable preview),
  `/dashboard` (real profile/application/document-count/consultation/
  notifications/recommendations, with empty states for new users —
  investor/demo analytics stay mock and are labeled "Demo
  ko'rsatkichlar").
- **Fallback demo mode** — if `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`
  aren't set, the app never crashes: the landing pages work normally,
  and authenticated pages show a "Supabase sozlanmagan" notice
  (`src/components/dev/SupabaseSetupNotice.tsx`) instead of a broken
  page or a silently-fake success state.

### What's still simulated (by design, per this stage's scope)
- All AI/OCR analysis (`documents.analysis_summary`,
  `assessments.result_summary`, interview feedback) — clearly labeled
  "demo" in the UI and in SQL comments.
- Investor analytics, admin panel, and the agency dashboard's client
  list remain mock data (agency_clients table exists in the schema for
  a future stage, but no page writes to it yet).
- Real account deletion — Settings explains this requires a
  server-side/admin implementation and is not exposed from the browser.
- Recommendations shown on `/recommendations` still use local
  component state (the dashboard's "recent recommendations" does read
  the real `recommendations` table, generated by assessment
  completion).

### Architecture
- `src/lib/supabase/{client,server,middleware,config}.ts` — the only
  places that construct a Supabase client. `client.ts` is
  browser-only, `server.ts` is for Server Components/Actions/Route
  Handlers, both return `null` (never throw) when unconfigured.
- `src/lib/data/*.ts` — the data access layer. Every function starts
  with `getAuthedContext()` (`src/lib/data/_shared.ts`), which reads
  the user id from the session — **never from a client-supplied
  value**. Marked `import "server-only"` so accidentally importing one
  into a Client Component fails the build immediately rather than
  leaking a server-only module into the browser bundle.
  **Recommendations was added here too** (`src/lib/data/recommendations.ts`)
  even though not explicitly listed in the brief's file suggestions,
  since the dashboard's "recent recommendations" needed it.
- `src/lib/actions/*.ts` — thin `"use server"` wrappers around the
  data layer, callable from Client Components (`server-only` modules
  can't be imported directly into client code).
- `src/lib/validation/schemas.ts` — every mutation's Zod schema.
- `src/types/database.ts` — hand-written to mirror `schema.sql`
  (documented command to regenerate once a real project exists).

### Necessary changes to existing (Stage 4/5) files
- `Sidebar.tsx` / `Topbar.tsx` — the "Chiqish" links were previously
  `<Link href="/">` (didn't actually sign out); both now submit
  `logoutAction` via a form.
- `Settings.tsx` — password change now points to the real reset-email
  flow (a from-scratch "current password" field can't safely change a
  password client-side without re-auth); account deletion section now
  explicitly states it requires a server-side implementation.
- `documents/page.tsx` and `DocumentCard.tsx` — replaced with a
  Server Component + `RealDocumentCard.tsx` doing real Storage
  uploads; the old mock-only `DocumentCard.tsx` was deleted since nothing
  else referenced it.
- `dashboard`, `applications`, `assessment`, `profile`, `notifications`,
  `consultation`, `reports` pages — converted from client-only mock
  pages to Server Components that fetch real data (with the original
  mock UI preserved as the fallback when Supabase isn't configured).

### Validation performed (see the honesty note below)
Same offline sandbox limitation as every prior stage — no network
means no `npm install`/`npm run build` here. Instead: cross-checked
every local import (all `@/lib/*`, `@/types/*`, `@/data/*` modules)
against actual exports project-wide, verified every icon import is
used, ran `tsc --noEmit` across all 125 `.ts`/`.tsx` files with zero
real errors, verified every hook-using file has `"use client"`,
verified no Server Component has a raw event handler, verified every
`"use server"` file only exports async functions (caught and fixed one
violation — see delivery notes), and sanity-checked `schema.sql`'s
parens/dollar-quoting balance.

**Authentication was not tested against a real Supabase project** —
no such project exists in this environment. Once you follow
`SUPABASE_SETUP.md`, please test the register → confirm → login →
logout flow yourself before relying on it.
