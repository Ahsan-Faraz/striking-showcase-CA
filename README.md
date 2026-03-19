# Striking Showcase

Collegiate bowling recruitment platform connecting high school bowlers with college programs.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Payments:** Stripe
- **AI:** Claude API (bio generation)
- **Media:** Cloudinary

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in all values in `.env`:

- **DATABASE_URL / DIRECT_URL** — From your Supabase project (Settings > Database)
- **SUPABASE keys** — From Supabase project settings
- **STRIPE keys** — From Stripe dashboard
- **JWT_SECRET** — Any random string (use `openssl rand -base64 32`)
- **ANTHROPIC_API_KEY** — From Anthropic console
- **CLOUDINARY** — From Cloudinary dashboard

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding:

| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Admin   | diandra@strikingshowcase.com   | password123 |
| Athlete | autumn@example.com             | password123 |
| Coach   | williams@wichitastate.edu      | password123 |

## Project Structure

```
src/
  app/
    (auth)/          # Login, register pages
    (dashboard)/     # Authenticated dashboard pages
    api/             # API routes
    coach/           # Public coach portfolio pages
    athlete/         # Public athlete portfolio pages
  components/
    ui/              # Reusable UI components
    layout/          # Sidebar, navbar
    athlete/         # Athlete-specific components
    messages/        # Messaging components
  lib/               # Utilities, Prisma client, auth, Stripe
prisma/
  schema.prisma      # Database schema
  seed.ts            # Seed script
```

## Available Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm run db:push` — Push schema to database
- `npm run db:seed` — Seed demo data
- `npm run db:studio` — Open Prisma Studio
