---
applyTo: "**"
---

# Striking Showcase — Copilot Coding Rules

## Stack
Next.js 14 App Router · Supabase (Auth + PostgreSQL + RLS + Realtime) · Prisma · Tailwind CSS · Cloudinary · Stripe · Resend

## Architecture Rules
- All DB queries go through `lib/dal.ts`. Always verify session before querying.
- Verify session in EVERY Server Action and Route Handler — middleware is NOT enough auth.
- Use Server Components by default. Add `"use client"` only for interactivity.
- Public profile `/[slug]` must NEVER render editor UI — not even when athlete is logged in.
- Never use demo fallback pattern (returning first profile when unauthenticated) — this is a known critical bug.

## Role Enforcement
- Every protected route must verify authenticated user server-side.
- Every role-specific route must enforce role match server-side — never derive role from URL.
- Coach routes: require `role === COACH` server-side.
- Admin routes: require `role === ADMIN` + TOTP 2FA verified. Log every action to audit_log.
- Coaches initiate messages only — athletes CANNOT create threads.
- Athletes CANNOT read the `recruiting_board` table — enforce via RLS.

## Supabase Patterns
- Always use Supabase RLS — never bypass with service role key in client-facing code.
- Use `supabase.auth.getUser()` server-side — never trust client-passed user IDs.
- Realtime subscriptions for: recruiting board sync, message threads, notifications.
- Use explicit column selection — never `select('*')` in production.

## API Route Rules
- Every route handler: verify session → check role → validate input with Zod → call DAL → return typed response.
- Return generic error messages to client. Log full details server-side.
- Never expose raw Prisma/Supabase errors to the client.
- Admin endpoints must check `role === ADMIN` on every request — no exceptions.

## Forms & Mutations
- Use Server Actions with Zod validation for all form submissions.
- Server Action pattern: verify session → validate with Zod → call DAL → return `{ error?, data? }`.
- Messages are immutable — never implement edit or delete on messages table.

## Stripe Integration
- Feature gate by plan: analytics → Pro only, theme studio → Pro only.
- Check `subscriptions` table server-side for plan status — never trust client claims.
- `subscriptions` table is NEVER writable from client — only via Stripe webhook.
- Webhook handler must verify Stripe signature before processing.

## Cloudinary
- Use Cloudinary upload widget for media — not a custom uploader.
- Photos: JPG/PNG, max 10MB, auto-compress to max 2000px wide.
- Videos: YouTube/Vimeo URL only — no direct video upload.
- Fetch video metadata via oEmbed API on URL paste.
- Free plan: 3 photos + 1 video. Pro plan: unlimited.

## SEO (Public Profile — Critical)
- Public profile must be fully SSR — coaches Google athlete names.
- Always use `generateMetadata()` for dynamic routes.
- Always include Schema.org Person JSON-LD on public profiles.
- OG image must use Next.js `ImageResponse` — never static images.
- Set canonical URL on every public page.

## Performance
- Use `Promise.all()` for parallel data fetches — never sequential awaits.
- Wrap slow data in `<Suspense>` — add `loading.tsx` per route segment.
- Use `next/image` always — never `<img>`. Always include width, height, alt.
- Use `next/font` always — never Google Fonts via `<link>`.
- Use Supabase Realtime only for: recruiting board, messages, notifications.

## TypeScript
- Strict mode on. No `any`. No non-null assertions without explanation.
- Type all API responses. Type all component props.
- Use Zod schemas that match Prisma models — keep them in sync.

## Never Do
- Never render editor UI on public profile `/[slug]`
- Never use demo fallback (returning first DB record when unauthenticated)
- Never derive user role from URL or pathname
- Never trust client-passed user IDs or role claims
- Never store secrets in `NEXT_PUBLIC_` env vars
- Never make messages editable or deletable
- Never allow athletes to create message threads
- Never allow client to write to `subscriptions` table
- Never bypass RLS with service role key in client-facing routes
- Never expose stack traces or DB errors to client

## Context7
Always use library /vercel/next.js for Next.js patterns.
Always use library /supabase/supabase for Supabase queries, auth, and RLS.
Always use library /colinhacks/zod for validation schemas.
Always use library /stripe/stripe-node for Stripe integration.
Always use library /resend/resend-node for email.