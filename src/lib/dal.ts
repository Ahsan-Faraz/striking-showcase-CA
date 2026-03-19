/**
 * Data Access Layer — ALL DB access goes through here.
 * Verifies session before every query. No demo fallbacks.
 */
import { cache } from 'react';
import { NextRequest } from 'next/server';
import prisma from './prisma';
import { createSupabaseServerClient } from './supabase/server';
import { verifyToken, type JWTPayload } from './auth';
import type { Role } from '@prisma/client';

export type SessionUser = NonNullable<Awaited<ReturnType<typeof _verifySession>>>;

/**
 * Verify session: tries Supabase Auth first, falls back to
 * existing JWT cookie during migration. Never returns demo data.
 */
async function _verifySession() {
  // 1. Try Supabase Auth
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          athleteProfile: true,
          coachProfile: true,
          subscription: true,
        },
      });
      if (dbUser) return dbUser;

      // Supabase user exists but no Prisma record — try by email
      const byEmail = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          athleteProfile: true,
          coachProfile: true,
          subscription: true,
        },
      });
      if (byEmail) return byEmail;
    }
  } catch {
    // Supabase not configured — fall through to JWT
  }

  // 2. Fallback: existing JWT cookie (migration period)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        athleteProfile: true,
        coachProfile: true,
        subscription: true,
      },
    });
    return dbUser;
  } catch {
    return null;
  }
}

/** Cached per-request session verification (Server Components / Route Handlers). */
export const verifySession = cache(_verifySession);

/**
 * Verify session from a NextRequest (API Route Handlers).
 * Checks Authorization header, then cookies.
 */
export async function verifySessionFromRequest(request: NextRequest) {
  // 1. Try Supabase Auth
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          athleteProfile: true,
          coachProfile: true,
          subscription: true,
        },
      });
      if (dbUser) return dbUser;

      const byEmail = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          athleteProfile: true,
          coachProfile: true,
          subscription: true,
        },
      });
      if (byEmail) return byEmail;
    }
  } catch {
    // Supabase not configured — fall through to JWT
  }

  // 2. Fallback: JWT from Authorization header or cookie
  let token: string | undefined;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token) {
    token = request.cookies.get('token')?.value;
  }
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      athleteProfile: true,
      coachProfile: true,
      subscription: true,
    },
  });
}

/** Require specific role — returns 403-style null if role doesn't match. */
export function requireRole(user: SessionUser, role: Role): boolean {
  return user.role === role;
}
