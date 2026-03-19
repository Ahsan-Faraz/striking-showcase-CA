import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const tournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  place: z.number().int().min(1, 'Place must be at least 1'),
  average: z.number().min(0).max(300),
  date: z.string().min(1, 'Date is required'),
  format: z.string().nullable().optional(),
});

async function getAthleteProfile(request: NextRequest) {
  let user = null;
  try { user = await getCurrentUser(request); } catch {}

  if (user) {
    return prisma.athleteProfile.findUnique({ where: { userId: user.id } });
  }
  // Demo mode fallback
  return prisma.athleteProfile.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tournaments = await prisma.tournament.findMany({
      where: { athleteId: profile.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ tournaments });
  } catch (error: any) {
    console.error('Get tournaments error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = tournamentSchema.parse(body);

    const tournament = await prisma.tournament.create({
      data: {
        athleteId: profile.id,
        name: validated.name,
        place: validated.place,
        average: validated.average,
        date: validated.date,
        format: validated.format || null,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create tournament error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
