import 'server-only';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import prisma from './prisma';
import type { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request?: NextRequest) {
  let token: string | undefined;

  if (request) {
    // From Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Or from cookie
    if (!token) {
      token = request.cookies.get('token')?.value;
    }
  } else {
    // Server component context
    const cookieStore = cookies();
    token = cookieStore.get('token')?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      athleteProfile: true,
      coachProfile: true,
      subscription: true,
    },
  });

  return user;
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: unknown) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, context, user);
  };
}
