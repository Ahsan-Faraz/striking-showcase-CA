# Striking Showcase — Developer Guide

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up database (SQLite for dev)
npx prisma db push

# Start dev server
npm run dev
```

Then open: **http://localhost:3000/preview** — this is the index of all pages.

---

## Preview All Pages

| Page | URL | Notes |
|------|-----|-------|
| **Preview Index** | `/preview` | Start here — links to every page |
| Coach Landing | Open `coach-landing.html` directly | Standalone HTML |
| Brand Book | Open `brand-book.html` directly | Standalone HTML |
| Athlete Landing | `/` | Next.js homepage |
| Login | `/login` | Auth page |
| Register | `/register` | Role selection |
| Dashboard | `/dashboard` | Requires auth |
| Profile Editor | `/profile` | Requires auth |
| Media | `/media` | Requires auth |
| Tournaments | `/tournaments` | Requires auth |
| Arsenal | `/arsenal` | Requires auth |
| Messages | `/messages` | Requires auth |
| Settings | `/settings` | Requires auth |
| **Portfolio Preview** | `/athlete/preview` | 3 layouts + theme toggle — NO auth needed |
| Portfolio (real) | `/athlete/[id]` | Needs athlete in DB |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma ORM (SQLite for dev, Postgres for prod)
- **Styling**: Tailwind CSS + CSS custom properties + inline styles
- **Auth**: JWT tokens with bcrypt password hashing
- **Payments**: Stripe integration (athlete subscription $17.99/mo)
- **AI**: Bio generator endpoint

---

## Brand System

### Colors
- **Maroon** (brand primary): `#660033`
- **Gold** (accent): `#C9A84C`
- **Gold Light**: `#E8D48B`
- **Dark Plum** (dark bg): `#1A1524`
- **Warm Cream** (light bg): `#FDFBF8`

### Fonts (Google Fonts)
- **Headings**: Exo 2 (weights 700, 800, 900) — uppercase, tight tracking
- **Body**: Nunito Sans (weights 400, 500, 600)
- **Mono/Labels**: DM Mono (weight 400) — uppercase, wide tracking

### Logo
- Files: `public/logo-white.png`, `public/logo-maroon.png`
- The star motif from the logo is used as a recurring design element

See `brand-book.html` for the complete brand guide.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Athlete landing page
│   ├── preview/page.tsx            # Developer preview index
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/               # Auth-protected pages
│   │   ├── layout.tsx              # Sidebar + ambient effects
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── media/page.tsx
│   │   ├── tournaments/page.tsx
│   │   ├── arsenal/page.tsx
│   │   ├── messages/page.tsx
│   │   └── settings/page.tsx
│   ├── athlete/
│   │   ├── [username]/page.tsx     # Public portfolio (real data)
│   │   └── preview/page.tsx        # Portfolio preview (sample data, 3 layouts)
│   └── api/                        # API routes
│       ├── auth/
│       ├── athletes/
│       ├── arsenal/
│       ├── tournaments/
│       ├── messages/
│       ├── media/
│       ├── watchlist/
│       ├── stripe/
│       └── ai/bio/
├── components/
│   ├── ui/                         # Reusable UI (Card, Button, Badge, etc.)
│   ├── athlete/                    # Athlete-specific (Portfolio, StatStrip, etc.)
│   ├── layout/                     # Navbar, Sidebar
│   └── messages/                   # ThreadList, Conversation
├── lib/
│   ├── prisma.ts                   # Database client
│   ├── auth.ts                     # JWT auth utilities
│   ├── stripe.ts                   # Stripe integration
│   └── utils.ts                    # Helpers + D1 benchmarks
└── standalone HTML files (project root):
    ├── coach-landing.html          # Coach landing page
    ├── brand-book.html             # Brand guidelines
    ├── logo-white.png
    ├── logo-maroon.png
    └── diandra.jpg                 # Founder photo
```

---

## Database Schema (Prisma)

Key models:
- **User** — email, password, role (ATHLETE/COACH/ADMIN)
- **AthleteProfile** — all bowling stats, academics, bio, preferences, portfolio layout choice
- **CoachProfile** — school, division, contact info
- **Tournament** — results linked to athlete
- **Arsenal** — bowling balls with coverstock + Storm layout (pinToPap, valAngle, drillingAngle)
- **Media** — photos/videos with upload URLs
- **Message/Thread** — coach-athlete messaging with parent CC
- **Subscription** — Stripe subscription tracking
- **ProfileView** — analytics for who viewed the profile

See `prisma/schema.prisma` for the full schema.

---

## Portfolio System

The athlete portfolio has **3 layout options**:

1. **Classic** — Full-viewport hero with massive name, 6-column scoreboard stat strip, numbered sections, 3D ball orbs, sticky CTA bar
2. **Spotlight** — ESPN broadcast split layout, circular benchmark rings, horizontal scrolling cards
3. **Editorial** — Magazine feature story, pull quotes, timeline tournaments, masonry media grid

Athletes choose their layout in settings. The portfolio supports **light and dark themes**.

The portfolio is the most important page — it's what coaches see when evaluating an athlete.

---

## Environment Variables

Create `.env` in the project root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
OPENAI_API_KEY="sk-..."  # For AI bio generator
```

---

## Key Design Decisions

- **Dark mode default** with warm plum background (#1A1524), not pure black
- **Light mode** uses warm cream (#FDFBF8) with maroon-tinted borders and real shadows
- **Gold accent** for CTAs, stats, and highlights — darkened to #9A7B2E in light mode for readability
- **Stat strip** inverts to a maroon band with white text in light mode
- **Cards** are glass-effect in dark, solid white with shadows in light
- **All fonts** loaded via next/font/google for performance
- **Responsive** — tested at 375px, 768px, 1024px breakpoints
- **prefers-reduced-motion** respected throughout

---

## What Still Needs Building

- [ ] Coach dashboard (separate from athlete dashboard)
- [ ] Admin dashboard
- [ ] Coach-facing portfolio view (how coaches see athletes from discover/search)
- [ ] Stripe checkout flow and subscription management
- [ ] Media upload to cloud storage (S3/Cloudflare R2)
- [ ] AI bio generator integration
- [ ] Email notifications
- [ ] Mobile responsive testing across all pages
- [ ] Production deployment (Vercel recommended)
