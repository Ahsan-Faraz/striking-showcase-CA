import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getAthleteProfile(request: NextRequest) {
  let user = null;
  try { user = await getCurrentUser(request); } catch {}

  if (user) {
    return prisma.athleteProfile.findUnique({ where: { userId: user.id } });
  }
  return prisma.athleteProfile.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament || tournament.athleteId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const updated = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        name: body.name ?? tournament.name,
        place: body.place ?? tournament.place,
        average: body.average ?? tournament.average,
        date: body.date ?? tournament.date,
        format: body.format !== undefined ? body.format : tournament.format,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update tournament error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament || tournament.athleteId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.tournament.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete tournament error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
