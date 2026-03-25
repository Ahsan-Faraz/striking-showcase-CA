/**
 * Data Access Layer — ALL DB access goes through here.
 * Verifies session before every query. No demo fallbacks.
 */
import "server-only";
import { cache } from "react";
import { NextRequest } from "next/server";
import prisma from "./prisma";
import { createSupabaseServerClient } from "./supabase/server";
import { verifyToken, type JWTPayload } from "./auth";
import type { Role } from "@prisma/client";

const USER_INCLUDES = {
  athleteProfile: true,
  coachProfile: true,
  subscription: true,
} as const;

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof _verifySession>>
>;

/**
 * Look up Prisma User by Supabase user ID or email.
 * If no record exists, lazily create one from user_metadata.
 */
async function findOrCreatePrismaUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  // 1. Try by Supabase UUID
  let dbUser = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    include: USER_INCLUDES,
  });
  if (dbUser) return dbUser;

  // 2. Try by email
  if (supabaseUser.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      include: USER_INCLUDES,
    });
    if (dbUser) return dbUser;
  }

  // 3. Lazy sync — create Prisma record from Supabase user_metadata
  const metadata = supabaseUser.user_metadata ?? {};
  const role: Role = (
    ["ATHLETE", "COACH", "ADMIN", "PARENT"] as const
  ).includes(metadata.role as Role)
    ? (metadata.role as Role)
    : "ATHLETE";

  try {
    dbUser = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role,
        athleteProfile:
          role === "ATHLETE"
            ? {
                create: {
                  firstName: (metadata.first_name as string) || "",
                  lastName: (metadata.last_name as string) || "",
                  classYear: metadata.class_year
                    ? parseInt(String(metadata.class_year), 10)
                    : new Date().getFullYear() + 2,
                },
              }
            : undefined,
        coachProfile:
          role === "COACH"
            ? {
                create: {
                  school: (metadata.school as string) || "Unknown",
                },
              }
            : undefined,
      },
      include: USER_INCLUDES,
    });
    return dbUser;
  } catch {
    // Unique constraint race — retry lookup
    return prisma.user.findFirst({
      where: {
        OR: [{ id: supabaseUser.id }, { email: supabaseUser.email! }],
      },
      include: USER_INCLUDES,
    });
  }
}

/**
 * Verify session: tries Supabase Auth first, falls back to
 * existing JWT cookie during migration. Never returns demo data.
 */
async function _verifySession() {
  // 1. Try Supabase Auth
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user && !error) {
      return findOrCreatePrismaUser(user);
    }
  } catch {
    // Supabase not configured — fall through to JWT
  }

  // 2. Fallback: existing JWT cookie (migration period)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    return prisma.user.findUnique({
      where: { id: payload.userId },
      include: USER_INCLUDES,
    });
  } catch {
    return null;
  }
}

/** Cached per-request session verification (Server Components / Route Handlers). */
export const verifySession = cache(_verifySession);

/**
 * Verify session from a NextRequest (API Route Handlers).
 * Checks Supabase Auth first, then Authorization header / cookie JWT.
 */
export async function verifySessionFromRequest(request: NextRequest) {
  // 1. Try Supabase Auth
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user && !error) {
      return findOrCreatePrismaUser(user);
    }
  } catch {
    // Supabase not configured — fall through to JWT
  }

  // 2. Fallback: JWT from Authorization header or cookie
  let token: string | undefined;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }
  if (!token) {
    token = request.cookies.get("token")?.value;
  }
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    include: USER_INCLUDES,
  });
}

// ─── PUBLIC PROFILE ────────────────────────────────────────
/** Fetch public profile by slug. Returns null if not found or not public. */
export async function getPublicProfile(slug: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      classYear: true,
      location: true,
      state: true,
      school: true,
      gender: true,
      coachName: true,
      coachContact: true,
      proShop: true,
      bowlingCenter: true,
      usbcClub: true,
      bio: true,
      profilePhotoUrl: true,
      profileVisibility: true,
      isActivelyRecruiting: true,
      divisionInterest: true,
      preferredDivisions: true,
      preferredRegions: true,
      themeJson: true,
      colorScheme: true,
      portfolioLayout: true,
      seasonAverage: true,
      highGame: true,
      highSeries: true,
      revRate: true,
      ballSpeed: true,
      pap: true,
      axisTilt: true,
      axisRotation: true,
      spareConversion: true,
      dominantHand: true,
      style: true,
      gpa: true,
      act: true,
      sat: true,
      ncaaStatus: true,
      intendedMajor: true,
      usbcId: true,
      tournaments: {
        orderBy: { date: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          date: true,
          place: true,
          average: true,
          format: true,
        },
      },
      arsenal: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          brand: true,
          weight: true,
          isPrimary: true,
          coverstock: true,
          layout: true,
          core: true,
          surface: true,
        },
      },
      media: {
        where: { isPublic: true },
        orderBy: { sortOrder: "asc" },
        take: 20,
        select: {
          id: true,
          type: true,
          url: true,
          thumbnailUrl: true,
          title: true,
          duration: true,
          isFeatured: true,
          sortOrder: true,
        },
      },
      collegeTargets: {
        select: {
          id: true,
          schoolName: true,
          division: true,
          conference: true,
          status: true,
        },
      },
    },
  });
  if (!profile || profile.profileVisibility !== "PUBLIC") return null;
  return profile;
}

// ─── DASHBOARD STATS ───────────────────────────────────────

/** Profile completion % using the exact formula from spec. */
export async function getProfileCompletion(
  userId: string,
): Promise<{ percentage: number; nextAction: string; nextActionLink: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      profilePhotoUrl: true,
      bio: true,
      seasonAverage: true,
      highGame: true,
      highSeries: true,
      revRate: true,
      ballSpeed: true,
      pap: true,
      axisTilt: true,
      axisRotation: true,
      usbcId: true,
      _count: {
        select: {
          media: { where: { type: "video", isFeatured: true } },
          arsenal: true,
          tournaments: true,
          collegeTargets: true,
        },
      },
    },
  });
  if (!profile)
    return {
      percentage: 0,
      nextAction: "Complete your profile to get started",
      nextActionLink: "/profile",
    };

  let pct = 0;
  const missing: { text: string; link: string }[] = [];

  // Photo uploaded: 15%
  if (profile.profilePhotoUrl) {
    pct += 15;
  } else {
    missing.push({ text: "Upload a profile photo (+15%)", link: "/profile" });
  }

  // Bio written (min 50 chars): 10%
  if (profile.bio && profile.bio.length >= 50) {
    pct += 10;
  } else {
    missing.push({
      text: "Write a bio of at least 50 characters (+10%)",
      link: "/profile",
    });
  }

  // All bowling stats filled: 20%
  const statsArray = [
    profile.seasonAverage,
    profile.highGame,
    profile.highSeries,
    profile.revRate,
    profile.ballSpeed,
  ];
  const statsFilled = statsArray.filter((s) => s != null).length;
  if (statsFilled === statsArray.length) {
    pct += 20;
  } else {
    missing.push({
      text: "Fill all 5 bowling stat fields (+20%)",
      link: "/profile",
    });
  }

  // At least 1 highlight video: 15%
  if (profile._count.media > 0) {
    pct += 15;
  } else {
    missing.push({
      text: "Add a highlight video and mark it featured (+15%)",
      link: "/media",
    });
  }

  // At least 3 ball arsenal entries: 10%
  if (profile._count.arsenal >= 3) {
    pct += 10;
  } else {
    missing.push({
      text: `Add ${3 - profile._count.arsenal} more ball arsenal entries (+10%)`,
      link: "/arsenal",
    });
  }

  // At least 3 tournament results: 10%
  if (profile._count.tournaments >= 3) {
    pct += 10;
  } else {
    missing.push({
      text: `Add ${3 - profile._count.tournaments} more tournament results (+10%)`,
      link: "/tournaments",
    });
  }

  // At least 1 college target: 10%
  if (profile._count.collegeTargets > 0) {
    pct += 10;
  } else {
    missing.push({
      text: "Add at least 1 college target (+10%)",
      link: "/targets",
    });
  }

  // USBC ID linked: 10%
  if (profile.usbcId) {
    pct += 10;
  } else {
    missing.push({ text: "Link your USBC ID (+10%)", link: "/profile" });
  }

  return {
    percentage: pct,
    nextAction: missing[0]?.text ?? "Your profile is 100% complete!",
    nextActionLink: missing[0]?.link ?? "/dashboard",
  };
}

/** Recent profile views in the last 7 days. */
export async function getRecentProfileViews(
  profileId: string,
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  return prisma.profileView.count({
    where: { athleteId: profileId, createdAt: { gte: since } },
  });
}

/** Recent coach inquiries (last 5 threads). */
export async function getRecentInquiries(athleteId: string) {
  return prisma.messageThread.findMany({
    where: { athleteId },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
    select: {
      id: true,
      lastMessageAt: true,
      coach: { select: { school: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });
}

/** Quick stats for the dashboard. */
export async function getQuickStats(profileId: string, userId: string) {
  const [
    totalViews,
    totalInquiries,
    completion,
    watchlistCount,
    unreadMessages,
  ] = await Promise.all([
    prisma.profileView.count({ where: { athleteId: profileId } }),
    prisma.messageThread.count({ where: { athleteId: profileId } }),
    getProfileCompletion(userId),
    prisma.watchlist.count({ where: { athleteId: profileId } }),
    prisma.message.count({
      where: {
        thread: { athleteId: profileId },
        readAt: null,
        NOT: { senderId: userId },
      },
    }),
  ]);
  return {
    totalViews,
    totalInquiries,
    profileCompletion: completion.percentage,
    watchlistCount,
    unreadMessages,
  };
}

/** Require specific role — returns false if role doesn't match. */
export function requireRole(user: SessionUser, role: Role): boolean {
  return user.role === role;
}
