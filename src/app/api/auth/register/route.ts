import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ATHLETE', 'COACH']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  classYear: z.number().int().min(2024).max(2035).optional(),
  school: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user with profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          passwordHash,
          role: validated.role,
        },
      });

      if (validated.role === 'ATHLETE') {
        await tx.athleteProfile.create({
          data: {
            userId: newUser.id,
            firstName: validated.firstName,
            lastName: validated.lastName,
            classYear: validated.classYear || 2026,
          },
        });

        // Create trial subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);

        await tx.subscription.create({
          data: {
            userId: newUser.id,
            status: 'TRIALING',
            trialEndsAt: trialEnd,
          },
        });
      } else if (validated.role === 'COACH') {
        await tx.coachProfile.create({
          data: {
            userId: newUser.id,
            school: validated.school || '',
          },
        });
      }

      return newUser;
    });

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
