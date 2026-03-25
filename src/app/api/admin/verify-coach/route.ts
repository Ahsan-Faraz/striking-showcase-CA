import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

/**
 * TEMPORARY admin verification workaround.
 * Until the admin panel is built, coaches can be verified via this API
 * using the ADMIN_SECRET environment variable.
 *
 * Usage:
 *   POST /api/admin/verify-coach
 *   Headers: { "x-admin-secret": "<ADMIN_SECRET>" }
 *   Body: { "coachEmail": "coach@school.edu" }
 *
 * Or via terminal:
 *   curl -X POST http://localhost:3000/api/admin/verify-coach \
 *     -H "Content-Type: application/json" \
 *     -H "x-admin-secret: YOUR_ADMIN_SECRET" \
 *     -d '{"coachEmail": "coach@school.edu"}'
 *
 * Set ADMIN_SECRET in .env (do NOT use NEXT_PUBLIC_ prefix).
 * Remove this route once the admin panel is live.
 */

export const dynamic = 'force-dynamic';

const schema = z.object({
  coachEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json(
        { error: 'ADMIN_SECRET not configured' },
        { status: 503 },
      );
    }

    const providedSecret = request.headers.get('x-admin-secret');
    if (!providedSecret || providedSecret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { coachEmail } = schema.parse(body);

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: coachEmail },
      include: { coachProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'COACH') {
      return NextResponse.json({ error: 'User is not a coach' }, { status: 400 });
    }

    if (!user.coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    if (user.coachProfile.isVerified) {
      return NextResponse.json({ message: 'Coach is already verified' });
    }

    // Verify the coach
    await prisma.coachProfile.update({
      where: { id: user.coachProfile.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `Coach ${coachEmail} has been verified successfully`,
      coach: {
        email: coachEmail,
        school: user.coachProfile.school,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Verify coach error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** List all unverified coaches (for quick reference) */
export async function GET(request: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 503 });
    }

    const providedSecret = request.headers.get('x-admin-secret');
    if (!providedSecret || providedSecret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unverified = await prisma.coachProfile.findMany({
      where: { isVerified: false },
      select: {
        id: true,
        school: true,
        division: true,
        title: true,
        createdAt: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      count: unverified.length,
      coaches: unverified.map((c) => ({
        id: c.id,
        email: c.user.email,
        school: c.school,
        division: c.division,
        title: c.title,
        signedUpAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('List unverified coaches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
