import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Role } from '@prisma/client';

/**
 * OAuth callback handler.
 * Exchanges auth code for session, ensures a Prisma User record exists,
 * then redirects based on role:
 * - ATHLETE (new / no slug) → /onboarding
 * - ATHLETE (returning)     → /dashboard
 * - COACH                   → /portal
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  // Ensure Prisma User record exists (lazy sync for OAuth users)
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ id: user.id }, { email: user.email! }],
    },
    include: { athleteProfile: true, coachProfile: true },
  });

  const metadata = user.user_metadata ?? {};
  const role = (metadata.role as Role) || 'ATHLETE';
  let isNew = false;

  if (!existing) {
    isNew = true;
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        role,
        athleteProfile:
          role === 'ATHLETE'
            ? {
                create: {
                  firstName: metadata.first_name || metadata.full_name?.split(' ')[0] || '',
                  lastName: metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || '',
                  classYear: metadata.class_year || new Date().getFullYear() + 2,
                  profilePhotoUrl: metadata.avatar_url || null,
                },
              }
            : undefined,
        coachProfile:
          role === 'COACH'
            ? {
                create: {
                  school: metadata.school || 'Unknown',
                },
              }
            : undefined,
      },
    });
  }

  // If `next` param was explicitly set, honour it
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Role-based redirect
  if (role === 'COACH') {
    return NextResponse.redirect(`${origin}/portal`);
  }

  // ATHLETE: new users (or those without slug) → onboarding
  if (isNew || !existing?.athleteProfile?.slug) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Returning athlete with completed profile
  return NextResponse.redirect(`${origin}/dashboard`);
}
