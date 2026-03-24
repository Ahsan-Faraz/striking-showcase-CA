import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import type { Role } from '@prisma/client';

/**
 * POST /api/auth/sync
 * Called after Supabase signup to create matching Prisma User + role profile.
 * Requires an active Supabase session (reads from cookies).
 */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Check if Prisma record already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ id: user.id }, { email: user.email! }],
    },
    include: { athleteProfile: true },
  });

  if (existing) {
    const needsOnboarding = existing.role === 'ATHLETE' && !existing.athleteProfile?.slug;
    return NextResponse.json({ data: { userId: existing.id, synced: false, needsOnboarding } });
  }

  // Create Prisma User + role-specific profile from user_metadata
  const metadata = user.user_metadata ?? {};
  const role = (['ATHLETE', 'COACH', 'ADMIN', 'PARENT'].includes(metadata.role)
    ? metadata.role
    : 'ATHLETE') as Role;

  const newUser = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email!,
      role,
      athleteProfile:
        role === 'ATHLETE'
          ? {
              create: {
                firstName: metadata.first_name || '',
                lastName: metadata.last_name || '',
                classYear: metadata.class_year
                  ? parseInt(String(metadata.class_year), 10)
                  : new Date().getFullYear() + 2,
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

  const needsOnboarding = role === 'ATHLETE';
  return NextResponse.json({ data: { userId: newUser.id, synced: true, needsOnboarding } });
}
