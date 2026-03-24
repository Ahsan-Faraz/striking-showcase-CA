import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugSchema } from '@/lib/validations/onboarding';

/**
 * GET /api/slug/check?slug=some-slug
 * Returns { available: boolean } after verifying slug format and uniqueness.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ available: false, error: 'Slug is required' }, { status: 400 });
  }

  // Validate format
  const result = slugSchema.safeParse({ slug });
  if (!result.success) {
    return NextResponse.json(
      { available: false, error: result.error.issues[0]?.message ?? 'Invalid slug format' },
      { status: 400 }
    );
  }

  // Check uniqueness against AthleteProfile slugs
  const existing = await prisma.athleteProfile.findUnique({
    where: { slug: result.data.slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
