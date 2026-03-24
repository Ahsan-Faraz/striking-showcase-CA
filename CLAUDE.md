# STRIKING SHOWCASE — COMPLETE PROJECT MEMORY
# Auto-loaded by VS Code Copilot, Claude Code, and all AI tools every session.
# Source: requirements.pdf + striking_showcase_role_spec.pdf + architecture diagram
# Version 1.1 · March 2026 · Confidential

---

## 🎯 WHAT THIS PROJECT IS

Striking Showcase is a **bowling athlete recruiting platform** — the first purpose-built platform
for competitive bowlers. High school athletes build recruiting profiles; college coaches discover
and contact them directly.

**Every feature decision must answer: "Does this serve the bowling recruiting use case?"**

This is NOT a general sports platform. Every stat field, UI decision, and feature must be
evaluated against the bowling recruiting use case specifically.

---

## 🏗️ TECH STACK (FINAL — DO NOT SUGGEST ALTERNATIVES)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router + React Server Components |
| Styling | Tailwind CSS — mobile-first, utility-first |
| Auth | Supabase Auth — JWT, Google OAuth, email/password |
| Database | PostgreSQL via Supabase — RLS policies + Realtime |
| ORM | Prisma (existing codebase uses this) |
| Media | Cloudinary — photos/videos, transformations, CDN |
| Payments | Stripe — Free / Pro / Family subscription plans |
| Email | Resend — transactional + broadcast |
| Hosting | Vercel (frontend) + Supabase (backend) |

---

## 👥 THREE USER ROLES — ARCHITECTURALLY CRITICAL

### 1. ATHLETE
- Builds and manages recruiting profile
- Receives coach messages and replies (cannot initiate)
- Manages media, stats, arsenal, tournaments, college targets
- Invites up to 4 family members (Pro/Family plan only)
- Cannot read the `recruiting_board` table — ever

### 2. COACH
- Must be **verified by admin** before sending messages
- Unverified coaches can browse profiles but CANNOT send messages
- Discovers athletes via search/filter engine
- Manages Kanban recruiting board (shared with team via Realtime)
- Initiates message threads ONLY — athletes cannot initiate contact
- Can invite assistant/volunteer coaches to share board
- Requires `.edu` email for verification submission

### 3. ADMIN
- Lives on `admin.strikingshowcase.com` — separate subdomain
- Requires Supabase Auth + **TOTP 2FA (mandatory, no bypass)**
- **8-hour session timeout, no "remember me"**
- Every admin action logged to **immutable audit_log** (timestamp + admin user ID + action detail)
- Currently: UI prototype only — needs full backend wiring (CRITICAL gap)
- No self-register flow — admin accounts created manually

---

## 🚨 CRITICAL ARCHITECTURAL RULE

> The public profile `/[slug]` must **NEVER** render any editor components.
> Editor UI, color pickers, save buttons, dashboard nav must ONLY load when a valid JWT session is present AND user is on a dashboard route.
> **This is the #1 bug on the current live site — fix this before anything else.**

---

## 🗺️ COMPLETE ROUTE ARCHITECTURE

### Public / Marketing Routes
```
/                          → Landing page (no auth required)
/pricing                   → Subscription plans
/coaches                   → Coach landing page — drives coach signups
/about                     → About page
```

### Athlete Public + Dashboard Routes
```
/[slug]                    → Public profile (SSR, SEO critical, ZERO editor UI)
/dashboard                 → Overview: completion %, recent views, inquiries, quick stats
/dashboard/profile         → Profile editor: all fields, sections, reordering
/dashboard/media           → Media manager: Cloudinary upload, set highlight, reorder
/dashboard/stats           → Bowling stats editor, ball arsenal, tournament results
/dashboard/targets         → College target tracker (PRIVATE — never shown publicly unless opted in)
/dashboard/inquiries       → Coach message inbox and threads
/dashboard/analytics       → Profile view analytics (Pro only)
/dashboard/theme           → Profile theme studio (Pro only)
/dashboard/family          → Family access management
/dashboard/settings        → Account settings, subscription management, privacy controls
```

### Family Routes
```
/family/[athlete-slug]     → Read-only view of full athlete profile + messages (family members only)
```

### Coach Routes
```
/coaches                   → Public landing page
/coaches/signup            → Coach registration form
/coaches/verify            → Pending verification page (post-signup)
/portal                    → Coach dashboard: activity feed, recent views, board summary
/portal/search             → Athlete search and filter engine
/portal/board              → Recruiting board (Kanban pipeline)
/portal/messages           → Message inbox — all threads with athletes
/portal/profile            → Coach profile editor
/portal/team               → Team management — invite staff
/portal/settings           → Account settings, notification preferences
```

### Admin Routes (admin.strikingshowcase.com — separate subdomain)
```
/                          → KPI dashboard: total athletes, coaches, active subs, MRR,
                             new signups (7d/30d), recent activity feed
/athletes                  → Full athlete table: search/filter, view, suspend, delete, impersonate (read-only)
/coaches                   → Full coach table: view, suspend, delete, verification status
/verification-queue        → Pending coach applications: review, approve, reject with reason
/moderation                → Flagged profiles and media: review, approve, remove, flag source
/subscriptions             → All subscriptions + status, manual plan override, Stripe customer link
/email                     → Broadcast email: all users / athletes / coaches / specific plan. Preview before send.
/feature-flags             → Toggle platform features on/off without deploy, per-user override capability
/audit-log                 → Immutable log: filterable by admin user, action type, date range
```

---

## 🗃️ COMPLETE DATABASE SCHEMA

### Supabase Tables (from spec)
```sql
profiles
  id, user_id (FK → auth.users), slug (unique), display_name, bio,
  location, grad_year, school, gpa, division_interest,
  theme_json (JSON), visibility, created_at, updated_at

bowling_stats
  id, profile_id (FK), avg_score, high_game, high_series,
  rev_rate, ball_speed, pap_x, pap_y, axis_tilt, axis_rotation, updated_at

media_items
  id, profile_id (FK), type (video|photo), url, cloudinary_id,
  caption, is_highlight, display_order, created_at

ball_arsenal
  id, profile_id (FK), ball_name, brand, weight, coverstock,
  core, surface, layout, notes

tournament_results
  id, profile_id (FK), tournament_name, date, location,
  placement, format, prize

college_targets
  id, profile_id (FK), school_name, division, conference,
  status (interested|applied|visited|offered|committed), notes

coach_inquiries
  id, athlete_id (FK), coach_id (FK), thread_id (FK → message_threads),
  created_at, status

message_threads
  id, athlete_id (FK), coach_id (FK), created_at, updated_at, last_message_at

messages
  id, thread_id (FK), sender_id (FK), content, created_at, read_at

family_access
  id, profile_id (FK), email, name, relationship, invite_token,
  accepted_at, permissions (JSON)

subscriptions
  id, user_id (FK), stripe_customer_id, stripe_subscription_id,
  plan (free|pro|family), status, current_period_end

profile_views
  id, profile_id (FK), viewer_type (coach|public|direct),
  viewer_id, viewed_at, source

coach_profiles
  id, user_id (FK), school, division, conference, sport, title,
  verified, verified_at, created_at

recruiting_board
  id, coach_id (FK), athlete_id (FK),
  status (tracking|contacted|visited|offered|committed|passed),
  notes, added_at, updated_at

```

### Prisma Models (existing codebase)
```
User, AthleteProfile, CoachProfile, MessageThread, Message,
Watchlist, Tournament, BallArsenal, Media, Subscription,
Notification, Report, AuditLog, CollegeTarget
```

### AthleteProfile Fields (Prisma)
```
Personal:     firstName, lastName, classYear, state, school, gender
Bowling:      seasonAverage, highGame, highSeries, revRate, ballSpeed, dominantHand, style
Academic:     gpa, act, sat, intendedMajor
Recruiting:   profileVisibility, isActivelyRecruiting, preferredRegions, preferredDivisions
Presentation: portfolioLayout, colorScheme, profilePhotoUrl, bio
Relations:    tournaments, media, arsenal, messageThreads, watchlistReferences
```

---

## 🔒 RLS POLICIES (Required on Every Table)

**Migration file:** `supabase/migrations/001_rls_policies.sql`

```
profiles (AthleteProfile):               ✅ RLS ENABLED
  Athletes → read/write own row
  Coaches → SELECT all public profiles
  Public → SELECT where visibility = public

bowling_stats:                            ⏳ PENDING (no dedicated table yet)
  Athletes → read/write own row
  Coaches → SELECT stats for athletes on their recruiting board

media_items (Media):                      ✅ RLS ENABLED
  Athletes → read/write own
  Public → SELECT where isPublic = true
  Coaches → SELECT all media

messages (Message):                       ✅ RLS ENABLED
  Sender → INSERT only
  Both thread participants → SELECT
  NO ONE → UPDATE or DELETE (messages are immutable forever)

message_threads (MessageThread):          ✅ RLS ENABLED
  Both participants → SELECT
  Only coaches → INSERT (coaches initiate only)

family_access (FamilyAccess):             ✅ RLS ENABLED
  Athlete → INSERT/DELETE
  Family members → SELECT own row
  Family members → read access to athlete profile data via separate policy

recruiting_board (Watchlist):             ✅ RLS ENABLED
  Coach → read/write own rows ONLY
  Athletes → CANNOT READ THIS TABLE (enforce strictly)
  Admin → read all

subscriptions (Subscription):             ✅ RLS ENABLED
  User → read own ONLY
  Admin → read all
  NEVER writable from client — only via Stripe webhook

coach_profiles (CoachProfile):            ✅ RLS ENABLED
  Coach → manage own row
  Public → SELECT all

profile_views (ProfileView):              ✅ RLS ENABLED
  Anyone → INSERT
  Athlete → SELECT own views

tournaments (Tournament):                 ✅ RLS ENABLED
  Athlete → manage own
  Public → SELECT all

ball_arsenal (BallArsenal):               ✅ RLS ENABLED
  Athlete → manage own
  Public → SELECT all
```

---

## 💳 SUBSCRIPTION PLANS + FEATURE GATING

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Basic profile, 1 highlight video, limited stats, NO coach messaging |
| Pro | $15/mo | Full profile, unlimited media, all stats, coach messaging, analytics, theme studio |
| Family | $25/mo | Pro features + family portal for up to 4 family members |

### Feature Gates (check server-side via subscriptions table — never trust client)
```
analytics route      → Pro only
theme studio route   → Pro only
Coach messaging      → Verified coaches + Pro athletes only
Media uploads        → Free: 3 photos + 1 video / Pro: unlimited
Family portal        → Family plan only
```

---

## 📊 PROFILE COMPLETION SYSTEM

Calculated and displayed prominently on dashboard. Drives athletes to fill more data.

```
Photo uploaded:                    15%
Bio written (min 50 chars):        10%
All bowling stats filled:          20%
At least 1 highlight video:        15%
At least 3 ball arsenal entries:   10%
At least 3 tournament results:     10%
At least 1 college target:         10%
USBC ID linked:                    10%
                          Total:  100%
```

**Current status:** UI implemented, backend integration pending for real calculation.

---

## 🖼️ PUBLIC PROFILE `/[slug]` — COMPLETE SPEC

### SEO Requirements (Critical — coaches Google athlete names)
- Fully Server-Side Rendered
- `generateMetadata()` must return:
  - `title`: `"[Name] — Bowling Recruit | Striking Showcase"`
  - `description`: `"{Name} is a {grad_year} bowling recruit from {location} with a {avg} average and {rev_rate} rev rate."`
- `og:image`: dynamically generated via Next.js `ImageResponse`
- Canonical URL must be set — no duplicate content
- Schema.org `Person` JSON-LD markup for Google rich results

### Profile Sections (in order)
```
1. Hero
   → Display name, location, grad year, school, division interest, profile photo
   → "Contact Athlete" CTA — verified coach only
   → ZERO editor UI here

2. Bowling Stats
   → avg_score, high_game, high_series, rev_rate, ball_speed, PAP, axis_tilt, axis_rotation
   → Display as STAT CARDS — not a table

3. Highlight Reel
   → First video autoplays (muted, with controls)
   → Additional videos in carousel
   → YouTube/Vimeo embed via oEmbed API

4. Photo Gallery
   → Cloudinary-hosted, lightbox on click, max 20 photos on public profile

5. Ball Arsenal
   → Card per ball: name, brand, weight, coverstock, layout
   → Coaches care about this section specifically

6. Tournament Results
   → Table: event name, date, placement, format — most recent first

7. College Targets
   → Only shown if athlete opts in
   → Shows schools and status ONLY — never shows notes

8. About / Bio
   → Free-text bio, max 500 characters, plain text only
```

### Strict Rules
- ZERO editor UI on public profile — no edit buttons, color pickers, save states, dashboard nav
- If logged-in athlete visits own public profile → they see exactly what a coach sees
- "View as Coach" toggle in dashboard links to public URL — does NOT change dashboard view

---

## 📱 ATHLETE DASHBOARD — COMPLETE SPEC

### Media Manager `/dashboard/media`
- Cloudinary upload widget integrated directly (NOT a custom uploader)
- Photo: JPG/PNG, max 10MB, auto-compressed to max 2000px wide
- Video: YouTube or Vimeo URL ONLY — no direct video upload (bandwidth cost)
- Video metadata fetched via oEmbed API on URL paste: title, thumbnail, duration
- Drag-to-reorder for both photos and videos
- Highlight flag: first highlighted video appears in public profile Highlight Reel
- Free plan: 3 photos + 1 video / Pro plan: unlimited

### Current Implementation Status
```
/dashboard             → KPI cards + completion banner. Real data from DAL. Server Component. LIVE.
/dashboard/profile     → Multi-tab editor: personal, bowling, academics, bio, privacy.
                         Server Actions per tab with Zod validation. ProfileEditor client component.
                         AI bio via /api/ai/bio. Photo upload via /api/media/upload. LIVE.
/dashboard/media       → Lists/uploads via /api/media/upload. Functional when Supabase env configured.
/dashboard/tournaments → CRUD via /api/tournaments. Largely functional.
/dashboard/arsenal     → CRUD via /api/arsenal. Largely functional.
/dashboard/messages    → Lists threads, sends replies. ⚠️ Uses PLACEHOLDER currentUserId — must fix.
/dashboard/settings    → Color/layout persists via /api/athletes/me.
                         Notification toggles → UI-ONLY (not persisted).
                         Family access section → UI-ONLY (no backend).
```

---

## 🎨 PROFILE THEME STUDIO (Pro Only)

### Options
```
Layouts (5):      Classic, Modern (two column hero), Minimal (text-forward), Bold (large stats), Media-first
Colors:           10 preset color schemes + custom primary/accent color picker
Fonts (4):        Default (Inter), Athletic (Bebas Neue + Inter), Classic (Georgia), Modern (DM Sans)
Header Style (3): Solid color, Gradient, Photo banner (profile photo as background)
```

### Implementation
```json
{
  "layout": "classic|modern|minimal|bold|media-first",
  "colorScheme": "preset-name",
  "primaryColor": "#hex",
  "accentColor": "#hex",
  "fontFamily": "default|athletic|classic|modern",
  "headerStyle": "solid|gradient|photo-banner"
}
```
- Stored as JSON column on `profiles` table
- Applied as CSS custom properties at root element level
- **No inline styles** — all theming via CSS variables in `<style>` tag in page head

---

## 👨‍👩‍👧 FAMILY ACCESS PORTAL — COMPLETE SPEC

### Permissions
```
View full profile (incl. private notes + stats):      ✅ YES
View coach messages (all threads, all messages):      ✅ YES
Reply in coach threads (labeled name + relationship): ✅ YES
View analytics:                                       ✅ YES (Pro plan only)
Edit profile:                                         ❌ NO
Manage media:                                         ❌ NO
Invite other family members:                          ❌ NO — athlete only
```

### Invite Flow
```
1. Athlete → /dashboard/family
2. Enters: email + name + relationship (Parent/Guardian/Sibling/Other)
3. Resend sends tokenized invite link (expires 7 days)
4. Family member clicks → creates account or logs into existing
5. family_access row created with accepted_at timestamp
6. Family member lands on /family/[athlete-slug] — read-only view
```

**Current status:** Family invite flow is UI-only — no backend implemented yet.

---

## 💬 MESSAGING SYSTEM — COMPLETE SPEC

### Non-Negotiable Rules
- Coaches initiate ONLY — athletes CANNOT create threads
- One thread per coach/athlete pair — no duplicate threads ever
- Messages are **immutable** — no edit, no delete, no exceptions
- Thread visible to: athlete + coach + family members with access + admin
- Coaches CANNOT see other coaches' threads with same athlete
- Unverified coaches → browse only, CANNOT send messages

### Flow
```
1. Coach views athlete public profile
2. Clicks "Contact Athlete" (verified Pro coaches only)
3. System creates message_thread (coach_id + athlete_id)
4. Coach sends first message
5. Athlete gets email via Resend: "Coach [Name] from [School] sent you a message"
6. Athlete (+ family with access) reads/replies in /dashboard/inquiries
7. All subsequent messages in same thread — no new threads for same pair
8. Daily email digest for athletes who haven't logged in
```

**Current status:** Backend functional. Messages UI uses placeholder `currentUserId`.
File to fix: `src/app/(dashboard)/messages/page.tsx`

---

## 🔍 ATHLETE SEARCH FILTERS (Coach Portal)

```
Graduation Year:     Multi-select: 2025, 2026, 2027, 2028, 2029
State / Region:      Single or multi-select US state + region groupings
Division Interest:   Multi-select: D1, D2, D3, NAIA, JUCO
Bowling Average:     Range slider: min/max (e.g., 180–220+)
Rev Rate:            Range slider: low / medium / high / elite
Handed:              Left / Right / Both
Gender:              Male / Female
GPA:                 Range slider: 2.0–4.0
Has Highlight Video: Toggle
Verified USBC ID:    Toggle
Last Active:         Updated in last 30/60/90 days
```

### Results Features
- Card view + list view (compact table)
- Sort: by average, rev rate, grad year, last active, recently added
- Board status badge on cards for athletes already on board
- **Saved searches** → coaches save filter config + get email alerts on new matches

---

## 📋 RECRUITING BOARD (KANBAN)

### Columns
`Tracking → Contacted → Visited → Offered → Committed → Passed`

### Features
- Drag-and-drop, Supabase Realtime syncs to all team members instantly
- Athlete card: photo, name, avg, grad year, last message date, days since last activity
- Click card → detail panel: full stats, notes, message thread, activity log
- Notes: team-only, rich text, versioned
- Activity log: auto-logged, shows which team member acted
- Filters: by column, staff member, grad year
- **CSV export** of all board athletes with status
- Staff CANNOT delete athletes or change program settings — head coach only

---

## 📈 PROFILE ANALYTICS (Pro Only)

```
Profile views:          Total + by day, broken down by coach/public/direct link
View sources:           Search (organic), direct link, coach portal, social share
Unique viewers:         Unique IPs/sessions in last 30 days
Coach views:            Count of verified coaches viewed (NO names unless they messaged)
Highlight plays:        Via Cloudinary / YouTube analytics API
Top section:            Most scroll time via Intersection Observer
```

**Privacy rule:** Coach names NEVER revealed unless they sent a message.
Athletes see `"3 college coaches viewed your profile"` — NOT which coaches.
This is intentional — drives Pro upgrade.

---

## 🔐 AUTH ARCHITECTURE

### Current Implementation
- JWT at login/register, stored in cookie named `token`
- `getCurrentUser` resolves from `authorization` header OR cookie

### Target
- DAL pattern (`lib/dal.ts`) — all DB queries here, session verified first
- `supabase.auth.getUser()` server-side only — never trust client-passed user IDs
- Middleware = UX redirects only, NOT a security boundary (CVE-2025-29927)
- Demo mode must be feature-flagged and disabled in production

---

## 📡 COMPLETE API CONTRACTS

### Athlete
```
GET    /api/profile/[slug]              → Public. No auth. Server-side only.
GET    /api/dashboard/profile           → Own profile. Auth required.
PUT    /api/dashboard/profile           → Update. Auth + Zod required.
POST   /api/dashboard/media             → Upload. Auth required.
DELETE /api/dashboard/media/[id]        → Delete + Cloudinary remove. Auth required.
GET    /api/dashboard/analytics         → Auth + Pro plan required.
POST   /api/dashboard/family/invite     → Auth required.
DELETE /api/dashboard/family/[id]       → Auth required.
```

### Coach
```
POST   /api/coaches/signup              → Creates account + pending email.
GET    /api/portal/search               → Auth + coach role required.
POST   /api/portal/board                → Auth required.
PUT    /api/portal/board/[id]           → Auth required.
DELETE /api/portal/board/[id]           → Auth required.
POST   /api/portal/messages             → Auth + verified coach only.
GET    /api/portal/messages             → Auth required.
```

### Admin
```
GET    /api/admin/users                            → Admin role required.
PUT    /api/admin/users/[id]/suspend               → Admin required.
GET    /api/admin/verification-queue               → Admin required.
POST   /api/admin/verification-queue/[id]/approve  → Approve coach. Sends email.
POST   /api/admin/verification-queue/[id]/reject   → Reject with reason. Sends email.
POST   /api/admin/broadcast                        → Admin required.
GET    /api/admin/audit-log                        → Admin required.
```

### Existing Live (current codebase)
```
POST   /api/auth/register                 → Live
POST   /api/auth/login                    → Live
POST   /api/auth/sync                     → ✅ NEW — Prisma sync for Supabase users
GET|PUT /api/athletes/me                  → Live ⚠️ DEMO FALLBACK — remove in prod
GET    /api/athletes                      → Live
GET|POST|PUT|DELETE /api/tournaments      → Live
GET|POST|PUT|DELETE /api/arsenal          → Live
GET|POST /api/media/upload                → Live (env-dependent)
GET|POST /api/messages                    → Live
GET|POST /api/messages/[threadId]         → Live
GET|POST|DELETE /api/watchlist            → Live ⚠️ ROLE HARDENING NEEDED
POST   /api/ai/bio                        → Live — requires ANTHROPIC_API_KEY
POST   /api/stripe/checkout               → Live (env-dependent)
POST   /api/stripe/webhook                → Live (env-dependent)
```

---

## 📁 EXISTING FILE STRUCTURE

```
src/
├── app/
│   ├── (auth)/                               → Auth routes (Supabase Auth)
│   │   ├── layout.tsx                        → Shared auth shell
│   │   ├── login/page.tsx                    → ✅ Supabase email/password + Google OAuth
│   │   └── register/page.tsx                 → ✅ Supabase signUp + role selection + Zod validation
│   ├── (dashboard)/
│   │   ├── layout.tsx                        → Shared dashboard shell (server-side role)
│   │   ├── dashboard/page.tsx                → Athlete overview (MOCK DATA)
│   │   ├── profile/page.tsx                  → Profile editor (LIVE)
│   │   ├── media/page.tsx                    → Media library (env-dependent)
│   │   ├── tournaments/page.tsx              → Tournament CRUD (LIVE)
│   │   ├── arsenal/page.tsx                  → Arsenal CRUD (LIVE)
│   │   ├── messages/page.tsx                 → ✅ Uses real session userId
│   │   ├── discover/page.tsx                 → Athlete discovery (LIVE)
│   │   ├── coach-dashboard/page.tsx          → Coach dashboard (hybrid)
│   │   ├── admin/page.tsx                    → ⚠️ MOCK DATA ONLY
│   │   └── settings/page.tsx                 → Partial
│   ├── [slug]/page.tsx                       → ✅ Public profile (SSR, SEO, zero editor UI)
│   ├── athlete/[username]/page.tsx           → ✅ Public athlete profile (Server Component)
│   ├── athlete/preview/page.tsx              → Preview route
│   ├── auth/callback/route.ts                → ✅ OAuth callback handler (Supabase code exchange)
│   ├── coach/[username]/page.tsx             → Public coach profile
│   ├── api/
│   │   ├── auth/sync/route.ts                → ✅ Prisma record sync for Supabase users
│   │   └── ...                               → All other API routes
│   └── api/og/image/route.tsx                → ✅ Dynamic OG image
├── components/layout/Sidebar.tsx             → ✅ Role from server-side prop
├── lib/
│   ├── auth.ts                               → JWT resolver (migration fallback)
│   ├── dal.ts                                → ✅ Supabase-first + JWT fallback + lazy sync
│   ├── prisma.ts                             → Prisma client
│   ├── supabase/client.ts                    → ✅ Browser Supabase client
│   ├── supabase/server.ts                    → ✅ Server Supabase client
│   ├── validations/auth.ts                   → ✅ Zod schemas for login/register
│   └── validations/onboarding.ts             → ✅ Zod schemas for onboarding steps
├── middleware.ts                              → ✅ Role-based routing + Supabase session refresh
└── prisma/schema.prisma                      → ✅ Updated with all missing tables + columns
```

---

## 🚨 KNOWN GAPS — FIX IN THIS ORDER

### CRITICAL
```
1. ✅ FIXED — /[slug] public profile now renders ZERO editor UI
   Pure Server Component, full SSR, Schema.org JSON-LD, generateMetadata().
   File: src/app/[slug]/page.tsx + src/app/athlete/[username]/page.tsx
2. ⏳ UNCHANGED — Admin panel is entirely mock/static (teammate owns this)
3. ⏳ UNCHANGED — Admin role enforcement (teammate owns this)
```

### HIGH
```
4. ✅ FIXED — Demo fallback removed from /api/athletes/me (returns 401)
   Uses verifySessionFromRequest() from lib/dal.ts. No demo fallback.
   File: src/app/api/athletes/me/route.ts
5. ✅ FIXED — Demo fallback removed from /api/watchlist (strict COACH role check)
   Session + requireRole('COACH') on all handlers (GET/POST/DELETE).
   File: src/app/api/watchlist/route.ts
6. ✅ FIXED — Sidebar role now from server-side Supabase session
   Layout passes role prop from verifySession(). No pathname detection.
   Files: src/components/layout/Sidebar.tsx + src/app/(dashboard)/layout.tsx
7. ✅ FIXED — Messages currentUserId now from authenticated session
   Fetches real user ID from /api/athletes/me on mount.
   File: src/app/(dashboard)/messages/page.tsx
```

### MEDIUM
```
8.  ✅ FIXED — Hydration error on /athlete/preview resolved
    CSS moved from inline <style> to static file with CSS custom properties.
    File: src/app/athlete/preview/preview.css
9.  ✅ FIXED — Role-based routing & onboarding flow implemented
    Middleware: cross-role redirects, /onboarding protected.
    Dashboard layout: ATHLETE guard. Portal layout: COACH guard.
    OAuth callback: role-based redirect. 6-step onboarding wizard.
    Landing page: converted to Server Component with generateMetadata().
10. ✅ FIXED — Coach dashboard has hardcoded/placeholder metric values
    Dashboard now fetches real data via DAL (getQuickStats, getProfileCompletion, etc.)
    File: src/app/(dashboard)/dashboard/page.tsx
11. Settings notification toggles not persisted (UI-only)
12. Family invitation flow is UI-only — no backend
13. Parent role in Prisma schema has no end-to-end flow
```

### LOW
```
14. Some env examples have stale references not matching implementation
15. Profile completion % uses hardcoded data — needs real backend calculation
```

---

## 🏃 SPRINT PLAN

| Sprint | Weeks | Deliverables |
|--------|-------|-------------|
| 1 | 1–2 | Codebase review, Supabase schema + RLS, auth, role-based routing, landing, onboarding |
| 2 | 3–4 | Public profile (SSR + SEO), profile editor, Cloudinary media, bowling stats, ball arsenal |
| 3 | 5–6 | Tournament results, college targets, theme studio (CSS vars), profile completion system |
| 4 | 7–8 | Coach portal: signup, verification, athlete search with all filters |
| 5 | 9–10 | Recruiting board (Kanban + Supabase Realtime), team collaboration |
| 6 | 11–12 | Messaging system, family access portal, family invite flow |
| 7 | 13–14 | Stripe (plans + webhooks), feature gating, analytics, admin portal (all 9 screens) |
| 8 | 15–16 | QA, performance, SEO audit, security hardening, production deploy |

### Week 1 — Before Writing Any New Code
```
1. Review existing codebase — what to keep vs rebuild
2. Check Prisma schema vs spec schema — identify gaps
3. Decide migration strategy
4. Note: CoachTeam feature removed from requirements
```

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Server-side only

# Auth
JWT_SECRET=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # Safe to expose
CLOUDINARY_API_KEY=                  # Server-side only
CLOUDINARY_API_SECRET=               # Server-side only

# Stripe
STRIPE_SECRET_KEY=                   # Server-side only
STRIPE_WEBHOOK_SECRET=               # Server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Safe to expose

# Resend
RESEND_API_KEY=                      # Server-side only

# Anthropic (AI bio generation)
ANTHROPIC_API_KEY=                   # Server-side only
# Returns "service unavailable" if missing

# App
NEXT_PUBLIC_APP_URL=
ADMIN_SUBDOMAIN=admin.strikingshowcase.com
```

---

## ⚙️ CURRENT SESSION PROGRESS

*(Update this section at the end of every session)*

```
Current Sprint:  Sprint 2 — Week 3–4
Last worked on:  Sprint 2 Prompt 1 — Public Profile SSR + Dashboard + Profile Editor
                 PART 1: Public Profile /[slug] — full SSR with SEO:
                   - Complete rewrite as pure Server Component (zero 'use client')
                   - getPublicProfile() DAL function: fetches by slug, explicit field select
                   - generateMetadata(): title, description, OG image, canonical URL, Twitter card
                   - Schema.org Person JSON-LD for Google rich results
                   - All 8 sections: Hero, Bowling Stats, Highlight Reel, Photo Gallery,
                     Ball Arsenal, Tournament Results, College Targets, Bio
                   - OG image route updated from ?id= to ?slug= param
                   - Fire-and-forget profile view tracking
                   Files: src/app/[slug]/page.tsx, src/app/api/og/image/route.tsx
                 PART 2: Athlete Dashboard /dashboard — real data:
                   - Converted from 'use client' + hardcoded demo data → async Server Component
                   - DAL functions: getProfileCompletion, getRecentProfileViews,
                     getQuickStats, getRecentInquiries (all in src/lib/dal.ts)
                   - Profile completion uses exact spec formula (8 criteria, 100% total)
                   - Promise.all() for parallel data fetches
                   - KPI cards: 7d views, watchlist count, unread messages, total inquiries
                   - Quick stats: season avg, high game, high series from real DB
                   - Recent inquiries panel replaces old hardcoded activity feed
                   - Profile completion banner with next-action suggestion from DAL
                   File: src/app/(dashboard)/dashboard/page.tsx
                 PART 3: Profile Editor /dashboard/profile — Server Actions + Zod:
                   - page.tsx: thin Server Component that loads profile via verifySession()
                   - ProfileEditor.tsx: 'use client' component with 5 tabs, useTransition
                   - 5 tabs: Personal Info, Bowling Stats, Academics, Bio, Privacy
                   - Zod schemas per tab (src/lib/validations/profile.ts)
                   - Server Actions per tab (src/app/(dashboard)/profile/actions.ts):
                     savePersonalInfo, saveBowlingStats, saveAcademicInfo, saveBio, savePrivacy
                   - Each action: verifySession → Zod validate → prisma update → revalidatePath
                   - Bio tab: 500 char limit + AI bio generation via /api/ai/bio
                   - Privacy tab: visibility toggle, actively recruiting, divisions, regions
                   - Photo upload preserved via /api/media/upload
                   Files: src/app/(dashboard)/profile/page.tsx,
                          src/app/(dashboard)/profile/ProfileEditor.tsx,
                          src/app/(dashboard)/profile/actions.ts,
                          src/lib/validations/profile.ts
                 tsc --noEmit: ✅ zero errors
Next task:       Sprint 2 Prompt 2 (Media Manager, Stats Editor, or Theme Studio)
Blockers:        None currently
Decisions made:  BowlingStyle enum has ONE_HANDED/TWO_HANDED (not STROKER etc).
                 ProfileVisibility enum has PUBLIC/PRIVATE (no COACHES_ONLY).
                 Profile editor uses Server Actions per tab, not single PUT.
                 Dashboard is async Server Component, not client-side fetch.
                 Public profile uses slug-based lookup exclusively.
                 OG image route uses ?slug= query param.
```

---
*Source: requirements.pdf (v1.1) + striking_showcase_role_spec.pdf + architecture diagram*
*Confidential — March 2026*