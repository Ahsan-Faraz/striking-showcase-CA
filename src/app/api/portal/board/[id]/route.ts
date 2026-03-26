import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifySessionFromRequest, requireRole, logBoardActivity } from '@/lib/dal';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  status: z.enum(['TRACKING', 'CONTACTED', 'VISITED', 'OFFERED', 'COMMITTED', 'PASSED']).optional(),
  notes: z.string().max(10000).optional(),
});

async function getVerifiedCoach(request: NextRequest) {
  const user = await verifySessionFromRequest(request);
  if (!user) return { error: 'Unauthorized' as const, status: 401 };
  if (!requireRole(user, 'COACH')) return { error: 'Forbidden' as const, status: 403 };

  const coach = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!coach) return { error: 'Coach profile not found' as const, status: 404 };

  return { coach, userId: user.id };
}

/** PUT /api/portal/board/[id] — Update status or notes */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getVerifiedCoach(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const entry = await prisma.watchlist.findFirst({
      where: { id: params.id, coachId: result.coach.id },
    });
    if (!entry) {
      return NextResponse.json({ error: 'Board entry not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    // Handle status change
    if (validated.status && validated.status !== entry.status) {
      updateData.status = validated.status;

      // Log status change activity
      await logBoardActivity(
        entry.id,
        result.coach.id,
        `moved_to_${validated.status.toLowerCase()}`,
        entry.status,
        validated.status,
        `Moved from ${entry.status} to ${validated.status}`,
      );
    }

    // Handle notes update
    if (validated.notes !== undefined && validated.notes !== entry.notes) {
      updateData.notes = validated.notes;

      // Save note version (keep last 10)
      await prisma.noteVersion.create({
        data: {
          watchlistId: entry.id,
          content: validated.notes,
        },
      });

      // Clean up old versions beyond 10
      const versions = await prisma.noteVersion.findMany({
        where: { watchlistId: entry.id },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        select: { id: true },
      });
      if (versions.length > 0) {
        await prisma.noteVersion.deleteMany({
          where: { id: { in: versions.map(v => v.id) } },
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(entry);
    }

    const updated = await prisma.watchlist.update({
      where: { id: entry.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update board entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/portal/board/[id] — Remove athlete from board */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getVerifiedCoach(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const entry = await prisma.watchlist.findFirst({
      where: { id: params.id, coachId: result.coach.id },
    });
    if (!entry) {
      return NextResponse.json({ error: 'Board entry not found' }, { status: 404 });
    }

    // Log removal before deleting (cascade will delete activities too)
    // We log but it will be deleted with the watchlist entry
    await prisma.watchlist.delete({ where: { id: entry.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete board entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** GET /api/portal/board/[id] — Get single board entry details */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getVerifiedCoach(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { getBoardEntryDetail } = await import('@/lib/dal');
    const detail = await getBoardEntryDetail(params.id, result.coach.id);

    if (!detail) {
      return NextResponse.json({ error: 'Board entry not found' }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error('Get board entry detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
