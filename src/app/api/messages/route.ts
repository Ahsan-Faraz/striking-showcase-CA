import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

export const dynamic = "force-dynamic";

const createThreadSchema = z.object({
  athleteId: z.string().min(1),
  message: z.string().min(1, "Message cannot be empty").max(5000),
});

export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "COACH") {
      const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: user.id },
      });
      if (!coachProfile) return NextResponse.json({ threads: [] });

      const threads = await prisma.messageThread.findMany({
        where: { coachId: coachProfile.id },
        include: {
          athlete: {
            select: {
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
              school: true,
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
          otherParty: {
            name: `${t.athlete.firstName} ${t.athlete.lastName}`,
            school: t.athlete.school,
            photoUrl: t.athlete.profilePhotoUrl,
          },
          lastMessage: t.messages[0]
            ? {
                content: t.messages[0].content,
                senderId: t.messages[0].senderId,
                readAt: t.messages[0].readAt?.toISOString() || null,
              }
            : undefined,
          unreadCount: unreadCounts[i],
        })),
      });
    }

    // ATHLETE path
    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });
    if (!athleteProfile) return NextResponse.json({ threads: [] });

    const threads = await prisma.messageThread.findMany({
      where: { athleteId: athleteProfile.id },
      include: {
        coach: {
          select: {
            school: true,
            title: true,
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
        otherParty: {
          name: t.coach.title
            ? `${t.coach.title} — ${t.coach.school}`
            : t.coach.school || "Coach",
          school: t.coach.school,
          photoUrl: null,
        },
        lastMessage: t.messages[0]
          ? {
              content: t.messages[0].content,
              senderId: t.messages[0].senderId,
              readAt: t.messages[0].readAt?.toISOString() || null,
            }
          : undefined,
        unreadCount: unreadCounts[i],
      })),
    });
  } catch (error) {
    console.error("Get threads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validated = createThreadSchema.parse(body);

    // Check if thread already exists
    const existing = await prisma.messageThread.findUnique({
      where: {
        athleteId_coachId: {
          athleteId: validated.athleteId,
          coachId: coachProfile.id,
        },
      },
    });

    if (existing) {
      const message = await prisma.message.create({
        data: {
          threadId: existing.id,
          senderId: user.id,
          senderRole: "COACH",
          content: validated.message,
        },
      });
      await prisma.messageThread.update({
        where: { id: existing.id },
        data: { lastMessageAt: new Date() },
      });
      return NextResponse.json({ threadId: existing.id, message });
    }

    const thread = await prisma.messageThread.create({
      data: {
        athleteId: validated.athleteId,
        coachId: coachProfile.id,
        messages: {
          create: {
            senderId: user.id,
            senderRole: "COACH",
            content: validated.message,
          },
        },
      },
    });

    // Notify athlete
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: validated.athleteId },
    });
    if (athlete) {
      await prisma.notification.create({
        data: {
          userId: athlete.userId,
          type: "MESSAGE",
          title: "New Message",
          description: `${coachProfile.school} sent you a message`,
          actionUrl: "/messages",
        },
      });
    }

    return NextResponse.json({ threadId: thread.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Create thread error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
