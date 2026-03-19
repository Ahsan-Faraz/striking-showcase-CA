import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getAuthUser(request: NextRequest) {
  try {
    return await getCurrentUser(request);
  } catch {
    return null;
  }
}

async function getAthleteProfile(request: NextRequest) {
  const user = await getAuthUser(request);
  if (user) {
    return prisma.athleteProfile.findUnique({ where: { userId: user.id } });
  }
  return prisma.athleteProfile.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: params.id },
      include: {
        tournaments: { orderBy: { date: 'desc' } },
        arsenal: { orderBy: { sortOrder: 'asc' } },
        media: { where: { isPublic: true }, orderBy: { sortOrder: 'asc' } },
        user: { select: { email: true, role: true } },
      },
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Record view
    const viewer = await getAuthUser(request);
    if (viewer && viewer.id !== athlete.userId) {
      await prisma.profileView.create({
        data: {
          athleteId: athlete.id,
          viewerId: viewer.id,
          viewerType: viewer.role,
        },
      });

      // Create notification for athlete
      await prisma.notification.create({
        data: {
          userId: athlete.userId,
          type: 'PROFILE_VIEW',
          title: 'Profile Viewed',
          description: `A ${viewer.role.toLowerCase()} viewed your profile`,
          actionUrl: `/profile/${athlete.id}`,
        },
      });
    }

    return NextResponse.json({ athlete });
  } catch (error) {
    console.error('Get athlete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);

    // Verify ownership
    const existing = await prisma.athleteProfile.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // In demo mode (no auth), fall back to first athlete profile for ownership check
    const ownerProfile = await getAthleteProfile(request);
    if (!ownerProfile || ownerProfile.id !== existing.id) {
      // If authenticated user exists but doesn't own this profile, deny
      if (user && existing.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // If no auth and profile doesn't match demo fallback, deny
      if (!user && (!ownerProfile || ownerProfile.id !== existing.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();

    // Filter allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'classYear', 'location', 'state', 'school', 'gender',
      'dominantHand', 'style', 'coachName', 'coachContact', 'proShop', 'bowlingCenter',
      'bio', 'profilePhotoUrl', 'gpa', 'act', 'sat', 'ncaaStatus', 'intendedMajor',
      'usbcId', 'seasonAverage', 'highGame', 'highSeries', 'revRate', 'ballSpeed',
      'pap', 'axisTilt', 'axisRotation', 'spareConversion',
      'preferredDivisions', 'preferredRegions',
      'profileVisibility', 'portfolioLayout', 'colorScheme', 'isActivelyRecruiting',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        // Convert numeric strings to numbers where needed
        const numericFields = ['classYear', 'gpa', 'act', 'sat', 'seasonAverage', 'highGame', 'highSeries', 'revRate', 'ballSpeed', 'axisTilt', 'axisRotation', 'spareConversion'];
        if (numericFields.includes(field) && typeof body[field] === 'string' && body[field] !== '') {
          data[field] = parseFloat(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    const updated = await prisma.athleteProfile.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ athlete: updated });
  } catch (error) {
    console.error('Update athlete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
