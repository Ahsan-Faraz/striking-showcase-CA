import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifySessionFromRequest, requireRole } from '@/lib/dal';

export const dynamic = 'force-dynamic';

const addSchema = z.object({
  athleteId: z.string().min(1),
  notes: z.string().optional(),
});

async function getVerifiedCoachProfile(request: NextRequest) {
  const user = await verifySessionFromRequest(request);
  if (!user) return { error: 'Unauthorized' as const, status: 401 };
  if (!requireRole(user, 'COACH')) return { error: 'Forbidden' as const, status: 403 };

  const coach = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!coach) return { error: 'Coach profile not found' as const, status: 404 };

  return { coach };
}

export async function GET(request: NextRequest) {
  try {
    const result = await getVerifiedCoachProfile(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { coach } = result;

    const watchlist = await prisma.watchlist.findMany({
      where: { coachId: coach.id },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            classYear: true,
            state: true,
            school: true,
            profilePhotoUrl: true,
            seasonAverage: true,
            highGame: true,
            gpa: true,
            dominantHand: true,
            style: true,
            isActivelyRecruiting: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getVerifiedCoachProfile(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { coach } = result;

    const body = await request.json();
    const validated = addSchema.parse(body);

    // Check if already on watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        coachId_athleteId: {
          coachId: coach.id,
          athleteId: validated.athleteId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already on watchlist' }, { status: 409 });
    }

    const entry = await prisma.watchlist.create({
      data: {
        coachId: coach.id,
        athleteId: validated.athleteId,
        notes: validated.notes || null,
      },
    });

    // Notify athlete
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: validated.athleteId },
    });

    if (athlete) {
      await prisma.notification.create({
        data: {
          userId: athlete.userId,
          type: 'WATCHLIST_ADD',
          title: 'Added to Watchlist',
          description: `A coach from ${coach.school} added you to their watchlist`,
          actionUrl: '/dashboard',
        },
      });
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Add to watchlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');

    if (!athleteId) {
      return NextResponse.json({ error: 'athleteId required' }, { status: 400 });
    }

    const result = await getVerifiedCoachProfile(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { coach } = result;

    await prisma.watchlist.delete({
      where: {
        coachId_athleteId: {
          coachId: coach.id,
          athleteId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
