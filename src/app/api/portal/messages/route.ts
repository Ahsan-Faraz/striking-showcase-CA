import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { sendNewMessageToAthleteEmail, sendFamilyMessageNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const createThreadSchema = z.object({
  athleteId: z.string().min(1),
});

/**
 * POST /api/portal/messages
 * Coach initiates a thread with an athlete (or returns existing threadId).
 * Body: { athleteId }
 * Auth: verified COACH only.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "COACH") {
      return NextResponse.json(
        { error: "Only coaches can initiate threads" },
        { status: 403 },
      );
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: user.id },
    });
    if (!coachProfile) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 404 });
    }
    if (!coachProfile.isVerified) {
      return NextResponse.json(
        { error: "Your account must be verified to contact athletes" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { athleteId } = createThreadSchema.parse(body);

    // Verify athlete exists
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: athleteId },
      select: { id: true, userId: true, firstName: true, lastName: true, slug: true },
    });
    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Check for existing thread (one per coach/athlete pair)
    const existing = await prisma.messageThread.findUnique({
      where: {
        athleteId_coachId: {
          athleteId,
          coachId: coachProfile.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ threadId: existing.id, existing: true });
    }

    // Create new thread + CoachInquiry record
    const thread = await prisma.messageThread.create({
      data: {
        athleteId,
        coachId: coachProfile.id,
      },
    });

    await prisma.coachInquiry.create({
      data: {
        athleteId,
        coachId: coachProfile.id,
        threadId: thread.id,
      },
    });

    // Create notification for athlete
    await prisma.notification.create({
      data: {
        userId: athlete.userId,
        type: "MESSAGE",
        title: "New Coach Inquiry",
        description: `${coachProfile.title || "A coach"} from ${coachProfile.school} wants to connect`,
        actionUrl: "/messages",
      },
    }).catch(() => {});

    return NextResponse.json({ threadId: thread.id, existing: false }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create thread error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/portal/messages
 * Returns all threads for the authenticated coach, with last message + unread count.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: user.id },
    });
    if (!coachProfile) return NextResponse.json({ threads: [] });

    const threads = await prisma.messageThread.findMany({
      where: { coachId: coachProfile.id },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            school: true,
            classYear: true,
            slug: true,
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
      userId: user.id,
      threads: threads.map((t, i) => ({
        id: t.id,
        athleteId: t.athlete.id,
        lastMessageAt: t.lastMessageAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
        athlete: {
          id: t.athlete.id,
          name: `${t.athlete.firstName} ${t.athlete.lastName}`,
          school: t.athlete.school,
          classYear: t.athlete.classYear,
          photoUrl: t.athlete.profilePhotoUrl,
          slug: t.athlete.slug,
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
    console.error("Get coach threads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
