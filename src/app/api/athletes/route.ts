import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minAverage = searchParams.get('minAverage');
    const maxAverage = searchParams.get('maxAverage');
    const classYear = searchParams.get('classYear');
    const state = searchParams.get('state');
    const hand = searchParams.get('hand');
    const style = searchParams.get('style');
    const minGpa = searchParams.get('minGpa');
    const gender = searchParams.get('gender');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Prisma.AthleteProfileWhereInput = {
      profileVisibility: 'PUBLIC',
      isActivelyRecruiting: true,
    };

    if (minAverage) {
      where.seasonAverage = { ...((where.seasonAverage as Prisma.FloatNullableFilter) || {}), gte: parseFloat(minAverage) };
    }
    if (maxAverage) {
      where.seasonAverage = { ...((where.seasonAverage as Prisma.FloatNullableFilter) || {}), lte: parseFloat(maxAverage) };
    }
    if (classYear) {
      where.classYear = parseInt(classYear);
    }
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }
    if (hand) {
      where.dominantHand = hand as 'RIGHT' | 'LEFT';
    }
    if (style) {
      where.style = style as 'ONE_HANDED' | 'TWO_HANDED';
    }
    if (minGpa) {
      where.gpa = { gte: parseFloat(minGpa) };
    }
    if (gender) {
      where.gender = gender;
    }

    const [athletes, total] = await Promise.all([
      prisma.athleteProfile.findMany({
        where,
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
          highSeries: true,
          dominantHand: true,
          style: true,
          gpa: true,
          isActivelyRecruiting: true,
          usbcVerified: true,
        },
        orderBy: { seasonAverage: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.athleteProfile.count({ where }),
    ]);

    return NextResponse.json({
      athletes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
