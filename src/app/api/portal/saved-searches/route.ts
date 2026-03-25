import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifySessionFromRequest, requireRole } from '@/lib/dal';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  filtersJson: z.record(z.string()),
  emailAlerts: z.boolean().optional(),
});

async function getCoachProfile(request: NextRequest) {
  const user = await verifySessionFromRequest(request);
  if (!user) return { error: 'Unauthorized' as const, status: 401 };
  if (!requireRole(user, 'COACH')) return { error: 'Forbidden' as const, status: 403 };

  const coach = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
  if (!coach) return { error: 'Coach profile not found' as const, status: 404 };

  return { coach };
}

export async function GET(request: NextRequest) {
  try {
    const result = await getCoachProfile(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const searches = await prisma.savedSearch.findMany({
      where: { coachId: result.coach.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Get saved searches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getCoachProfile(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const body = await request.json();
    const validated = createSchema.parse(body);

    // Limit to 20 saved searches per coach
    const count = await prisma.savedSearch.count({ where: { coachId: result.coach.id } });
    if (count >= 20) {
      return NextResponse.json({ error: 'Maximum 20 saved searches allowed' }, { status: 400 });
    }

    const search = await prisma.savedSearch.create({
      data: {
        coachId: result.coach.id,
        name: validated.name,
        filtersJson: validated.filtersJson,
        emailAlerts: validated.emailAlerts ?? false,
      },
    });

    return NextResponse.json(search, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create saved search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await getCoachProfile(request);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // Ensure the saved search belongs to this coach
    const existing = await prisma.savedSearch.findFirst({
      where: { id, coachId: result.coach.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.savedSearch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete saved search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
