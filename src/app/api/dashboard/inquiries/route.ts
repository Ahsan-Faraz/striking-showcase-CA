import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/inquiries
 * Returns all threads for the authenticated athlete, with last message + unread count.
 * Auth: ATHLETE role required.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ATHLETE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });
    if (!athleteProfile) return NextResponse.json({ threads: [] });

    const threads = await prisma.messageThread.findMany({
      where: { athleteId: athleteProfile.id },
      include: {
        coach: {
          select: {
            id: true,
            school: true,
            title: true,
            division: true,
            isVerified: true,
            user: { select: { email: true } },
          },
        },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const unreadCounts = await Promise.all(
      threads.map((t) =>
        prisma.message.count({
          where: { threadId: t.id, readAt: null, senderId: { not: user.id } },
        }),
      ),
    );

    return NextResponse.json({
      threads: threads.map((t, i) => ({
        id: t.id,
        lastMessageAt: t.lastMessageAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
        coach: {
          id: t.coach.id,
          name: t.coach.title
            ? `${t.coach.title} — ${t.coach.school}`
            : t.coach.school || "Coach",
          school: t.coach.school,
          division: t.coach.division,
          isVerified: t.coach.isVerified,
        },
        lastMessage: t.messages[0]
          ? {
              content: t.messages[0].content,
              senderId: t.messages[0].senderId,
              senderRole: t.messages[0].senderRole,
              readAt: t.messages[0].readAt?.toISOString() || null,
            }
          : null,
        unreadCount: unreadCounts[i],
      })),
    });
  } catch (error) {
    console.error("Get athlete inquiries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
