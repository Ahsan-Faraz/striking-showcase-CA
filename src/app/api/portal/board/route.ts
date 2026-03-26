import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifySessionFromRequest, requireRole, getRecruitingBoard, logBoardActivity } from '@/lib/dal';

export const dynamic = 'force-dynamic';

const addSchema = z.object({
  athleteId: z.string().min(1),
  status: z.enum(['TRACKING', 'CONTACTED', 'VISITED', 'OFFERED', 'COMMITTED', 'PASSED']).default('TRACKING'),
});

async function getVerifiedCoach(request: NextRequest) {
  const user = await verifySessionFromRequest(request);
  if (!user) return { error: 'Unauthorized' as const, status: 401 };
  if (!requireRole(user, 'COACH')) return { error: 'Forbidden' as const, status: 403 };

  const coach = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!coach) return { error: 'Coach profile not found' as const, status: 404 };
  if (!coach.isVerified) return { error: 'Coach must be verified' as const, status: 403 };

  return { coach, userId: user.id };
}

/** GET /api/portal/board — Fetch all board entries grouped by status */
export async function GET(request: NextRequest) {
  try {
    const result = await getVerifiedCoach(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const columns = await getRecruitingBoard(result.coach.id);
    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Get board error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/portal/board — Add athlete to board */
export async function POST(request: NextRequest) {
  try {
    const result = await getVerifiedCoach(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const body = await request.json();
    const validated = addSchema.parse(body);

    // Check if already on board
    const existing = await prisma.watchlist.findUnique({
      where: {
        coachId_athleteId: {
          coachId: result.coach.id,
          athleteId: validated.athleteId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Athlete already on board' }, { status: 409 });
    }

    // Verify athlete exists
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: validated.athleteId },
    });
    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    const entry = await prisma.watchlist.create({
      data: {
        coachId: result.coach.id,
        athleteId: validated.athleteId,
        status: validated.status,
      },
    });

    // Log activity
    await logBoardActivity(
      entry.id,
      result.coach.id,
      `added_to_${validated.status.toLowerCase()}`,
      undefined,
      validated.status,
      `Added to ${validated.status}`,
    );

    // Notify athlete
    await prisma.notification.create({
      data: {
        userId: athlete.userId,
        type: 'WATCHLIST_ADD',
        title: 'Added to Watchlist',
        description: `A coach from ${result.coach.school} added you to their recruiting board`,
        actionUrl: '/dashboard',
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Add to board error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
