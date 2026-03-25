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
import type { Role, Prisma } from "@prisma/client";

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

// ─── COACH DASHBOARD ───────────────────────────────────────

/** Coach portal KPI data: board summary, messages, recent activity. */
export async function getCoachDashboardData(coachProfileId: string, userId: string) {
  const [
    boardCounts,
    unreadMessages,
    totalThreads,
    recentActivity,
  ] = await Promise.all([
    // Board column counts
    prisma.watchlist.groupBy({
      by: ['status'],
      where: { coachId: coachProfileId },
      _count: true,
    }),
    // Unread messages
    prisma.message.count({
      where: {
        thread: { coachId: coachProfileId },
        readAt: null,
        NOT: { senderId: userId },
      },
    }),
    // Total active threads
    prisma.messageThread.count({
      where: { coachId: coachProfileId },
    }),
    // Recent board activity (last 5 changes)
    prisma.watchlist.findMany({
      where: { coachId: coachProfileId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        status: true,
        updatedAt: true,
        athlete: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
  ]);

  // Map board counts to column totals
  const columns = {
    TRACKING: 0,
    CONTACTED: 0,
    VISITED: 0,
    OFFERED: 0,
    COMMITTED: 0,
    PASSED: 0,
  };
  for (const row of boardCounts) {
    if (row.status in columns) {
      columns[row.status as keyof typeof columns] = row._count;
    }
  }

  return {
    boardColumns: columns,
    totalOnBoard: Object.values(columns).reduce((a, b) => a + b, 0),
    unreadMessages,
    totalThreads,
    recentActivity: recentActivity.map((w) => ({
      athleteName: `${w.athlete.firstName} ${w.athlete.lastName}`,
      status: w.status,
      date: w.updatedAt,
    })),
  };
}

// ─── ATHLETE SEARCH (Coach Portal) ────────────────────────

export interface SearchFilters {
  classYear?: string;       // comma-separated: "2025,2026"
  state?: string;           // e.g. "Kansas"
  division?: string;        // comma-separated: "D1,D2"
  avgMin?: string;
  avgMax?: string;
  revRate?: string;         // "low" | "medium" | "high" | "elite"
  handed?: string;          // "LEFT" | "RIGHT"
  gender?: string;
  gpaMin?: string;
  gpaMax?: string;
  hasVideo?: string;        // "true"
  hasUsbc?: string;         // "true"
  lastActive?: string;      // "30" | "60" | "90" days
  sort?: string;            // "average" | "revRate" | "gradYear" | "lastActive" | "gpa"
  order?: string;           // "asc" | "desc"
  page?: string;
  limit?: string;
}

const REV_RATE_RANGES: Record<string, { gte?: number; lte?: number }> = {
  low: { lte: 249 },
  medium: { gte: 250, lte: 349 },
  high: { gte: 350, lte: 449 },
  elite: { gte: 450 },
};

const SORT_MAP: Record<string, string> = {
  average: "seasonAverage",
  revRate: "revRate",
  gradYear: "classYear",
  lastActive: "updatedAt",
  gpa: "gpa",
};

/** Search athletes with full filter set. Returns paginated results + board status for the coach. */
export async function searchAthletes(
  filters: SearchFilters,
  coachProfileId?: string,
) {
  const where: Prisma.AthleteProfileWhereInput = {
    profileVisibility: "PUBLIC",
  };

  // Graduation year (multi-select)
  if (filters.classYear) {
    const years = filters.classYear.split(",").map((y) => parseInt(y.trim(), 10)).filter(Boolean);
    if (years.length > 0) where.classYear = { in: years };
  }

  // State
  if (filters.state) {
    where.state = { contains: filters.state, mode: "insensitive" };
  }

  // Division interest (multi-select on preferredDivisions array)
  if (filters.division) {
    const divs = filters.division.split(",").map((d) => d.trim()).filter(Boolean);
    if (divs.length > 0) where.preferredDivisions = { hasSome: divs };
  }

  // Bowling average range
  if (filters.avgMin || filters.avgMax) {
    const avgFilter: Prisma.FloatNullableFilter = {};
    if (filters.avgMin) avgFilter.gte = parseFloat(filters.avgMin);
    if (filters.avgMax) avgFilter.lte = parseFloat(filters.avgMax);
    where.seasonAverage = avgFilter;
  }

  // Rev rate categorical
  if (filters.revRate && REV_RATE_RANGES[filters.revRate]) {
    const range = REV_RATE_RANGES[filters.revRate];
    const revFilter: Prisma.IntNullableFilter = {};
    if (range.gte !== undefined) revFilter.gte = range.gte;
    if (range.lte !== undefined) revFilter.lte = range.lte;
    where.revRate = revFilter;
  }

  // Handed
  if (filters.handed) {
    where.dominantHand = filters.handed as "RIGHT" | "LEFT";
  }

  // Gender
  if (filters.gender) {
    where.gender = filters.gender;
  }

  // GPA range
  if (filters.gpaMin || filters.gpaMax) {
    const gpaFilter: Prisma.FloatNullableFilter = {};
    if (filters.gpaMin) gpaFilter.gte = parseFloat(filters.gpaMin);
    if (filters.gpaMax) gpaFilter.lte = parseFloat(filters.gpaMax);
    where.gpa = gpaFilter;
  }

  // Has highlight video
  if (filters.hasVideo === "true") {
    where.media = { some: { type: "video" } };
  }

  // USBC verified
  if (filters.hasUsbc === "true") {
    where.usbcVerified = true;
  }

  // Last active (updatedAt within N days)
  if (filters.lastActive) {
    const days = parseInt(filters.lastActive, 10);
    if (days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      where.updatedAt = { gte: since };
    }
  }

  // Sorting
  const sortField = SORT_MAP[filters.sort || "average"] || "seasonAverage";
  const sortOrder = filters.order === "asc" ? "asc" : "desc";
  const orderBy = { [sortField]: sortOrder };

  // Pagination
  const page = Math.max(1, parseInt(filters.page || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit || "20", 10) || 20));

  const [athletes, total] = await Promise.all([
    prisma.athleteProfile.findMany({
      where,
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
        classYear: true,
        state: true,
        school: true,
        profilePhotoUrl: true,
        seasonAverage: true,
        highGame: true,
        highSeries: true,
        revRate: true,
        dominantHand: true,
        style: true,
        gpa: true,
        preferredDivisions: true,
        isActivelyRecruiting: true,
        usbcVerified: true,
        updatedAt: true,
        _count: { select: { media: { where: { type: "video" } } } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.athleteProfile.count({ where }),
  ]);

  // If coach, fetch their board statuses for the returned athletes
  let boardStatusMap: Record<string, string> = {};
  if (coachProfileId && athletes.length > 0) {
    const athleteIds = athletes.map((a) => a.id);
    const boardEntries = await prisma.watchlist.findMany({
      where: { coachId: coachProfileId, athleteId: { in: athleteIds } },
      select: { athleteId: true, status: true },
    });
    boardStatusMap = Object.fromEntries(
      boardEntries.map((e) => [e.athleteId, e.status]),
    );
  }

  return {
    athletes: athletes.map((a) => ({
      ...a,
      hasVideo: a._count.media > 0,
      boardStatus: boardStatusMap[a.id] || null,
    })),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

/** Get saved searches for a coach. */
export async function getSavedSearches(coachProfileId: string) {
  return prisma.savedSearch.findMany({
    where: { coachId: coachProfileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      filtersJson: true,
      emailAlerts: true,
      createdAt: true,
    },
  });
}
