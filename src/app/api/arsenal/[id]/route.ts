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

    const ball = await prisma.ballArsenal.findUnique({
      where: { id: params.id },
    });

    if (!ball || ball.athleteId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();

    if (body.isPrimary) {
      await prisma.ballArsenal.updateMany({
        where: { athleteId: profile.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.ballArsenal.update({
      where: { id: params.id },
      data: {
        name: body.name ?? ball.name,
        brand: body.brand !== undefined ? body.brand : ball.brand,
        weight: body.weight ?? ball.weight,
        condition: body.condition !== undefined ? body.condition : ball.condition,
        isPrimary: body.isPrimary ?? ball.isPrimary,
        sortOrder: body.sortOrder ?? ball.sortOrder,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update ball error:', error);
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

    const ball = await prisma.ballArsenal.findUnique({
      where: { id: params.id },
    });

    if (!ball || ball.athleteId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.ballArsenal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete ball error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
