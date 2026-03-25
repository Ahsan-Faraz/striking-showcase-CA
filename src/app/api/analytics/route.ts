import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { hasProAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!hasProAccess(user.subscription)) {
      return NextResponse.json(
        { error: "Profile analytics is available on the Pro plan only" },
        { status: 403 },
      );
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel fetch all analytics data
    const [
      totalViews,
      views7d,
      views30d,
      coachViews30d,
      viewsByDay,
      viewsBySource,
      watchlistCount,
    ] = await Promise.all([
      prisma.profileView.count({ where: { athleteId: profile.id } }),
      prisma.profileView.count({
        where: { athleteId: profile.id, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.profileView.count({
        where: { athleteId: profile.id, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.profileView.count({
        where: {
          athleteId: profile.id,
          viewerType: "coach",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Views by day for last 30 days
      prisma.profileView.groupBy({
        by: ["createdAt"],
        where: { athleteId: profile.id, createdAt: { gte: thirtyDaysAgo } },
        _count: true,
        orderBy: { createdAt: "asc" },
      }),
      // Views by source
      prisma.profileView.groupBy({
        by: ["source"],
        where: { athleteId: profile.id, createdAt: { gte: thirtyDaysAgo } },
        _count: true,
      }),
      prisma.watchlist.count({ where: { athleteId: profile.id } }),
    ]);

    // Aggregate views by day (date string → count)
    const dailyViews: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyViews[date.toISOString().split("T")[0]] = 0;
    }
    for (const v of viewsByDay) {
      const dateStr = v.createdAt.toISOString().split("T")[0];
      dailyViews[dateStr] = (dailyViews[dateStr] || 0) + v._count;
    }

    // Source breakdown
    const sources: Record<string, number> = {};
    for (const v of viewsBySource) {
      sources[v.source || "direct"] = v._count;
    }

    return NextResponse.json({
      totalViews,
      views7d,
      views30d,
      coachViews30d,
      watchlistCount,
      dailyViews,
      sources,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
