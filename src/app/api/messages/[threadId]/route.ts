import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import {
  sendNewMessageToAthleteEmail,
  sendReplyToCoachEmail,
  sendFamilyMessageNotificationEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

/**
 * Check if user is authorized to access this thread.
 * Returns the role context: 'coach' | 'athlete' | 'family' | null
 */
async function getThreadAccess(
  threadId: string,
  userId: string,
): Promise<{
  thread: Awaited<ReturnType<typeof prisma.messageThread.findUnique>> & {
    athlete: { userId: string; id: string; firstName: string; lastName: string; slug: string | null };
    coach: { userId: string; id: string; school: string; title: string | null; isVerified: boolean; emailOnAthleteReply: boolean };
  };
  accessRole: "coach" | "athlete" | "family";
} | null> {
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      athlete: {
        select: {
          userId: true,
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          familyAccess: {
            where: { status: "active" },
            select: { parentId: true },
          },
        },
      },
      coach: {
        select: {
          userId: true,
          id: true,
          school: true,
          title: true,
          isVerified: true,
          emailOnAthleteReply: true,
        },
      },
    },
  });

  if (!thread) return null;

  // Coach access
  if (thread.coach.userId === userId) {
    return { thread: thread as any, accessRole: "coach" };
  }

  // Athlete access
  if (thread.athlete.userId === userId) {
    return { thread: thread as any, accessRole: "athlete" };
  }

  // Family access
  const familyIds = (thread.athlete as any).familyAccess?.map((f: any) => f.parentId) ?? [];
  if (familyIds.includes(userId)) {
    return { thread: thread as any, accessRole: "family" };
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } },
) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getThreadAccess(params.threadId, user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { threadId: params.threadId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        senderId: true,
        senderRole: true,
        createdAt: true,
        readAt: true,
        sender: {
          select: {
            athleteProfile: { select: { firstName: true, lastName: true } },
            coachProfile: { select: { school: true, title: true } },
            familyAccess: {
              take: 1,
              select: { name: true, relationship: true },
            },
          },
        },
      },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        threadId: params.threadId,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      thread: {
        id: access.thread.id,
        athleteName: `${access.thread.athlete.firstName} ${access.thread.athlete.lastName}`,
        athleteSlug: access.thread.athlete.slug,
        coachSchool: access.thread.coach.school,
        coachTitle: access.thread.coach.title,
      },
      messages: messages.map((m) => {
        let senderName = "Unknown";
        let senderLabel: string | null = null;

        if (m.senderRole === "COACH" && m.sender.coachProfile) {
          senderName = m.sender.coachProfile.title
            ? `${m.sender.coachProfile.title} — ${m.sender.coachProfile.school}`
            : m.sender.coachProfile.school;
        } else if (m.senderRole === "ATHLETE" && m.sender.athleteProfile) {
          senderName = `${m.sender.athleteProfile.firstName} ${m.sender.athleteProfile.lastName}`;
        } else if (m.senderRole === "PARENT" && m.sender.familyAccess?.[0]) {
          const fam = m.sender.familyAccess[0];
          senderName = fam.name || "Family Member";
          senderLabel = fam.relationship ? `(${fam.relationship})` : "(Family)";
        }

        return {
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          senderRole: m.senderRole,
          senderName,
          senderLabel,
          createdAt: m.createdAt.toISOString(),
          readAt: m.readAt?.toISOString() || null,
        };
      }),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } },
) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getThreadAccess(params.threadId, user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Unverified coaches cannot send messages
    if (access.accessRole === "coach" && !access.thread.coach.isVerified) {
      return NextResponse.json(
        { error: "Your account must be verified to send messages" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { content } = messageSchema.parse(body);

    // Determine senderRole based on access
    let senderRole: "COACH" | "ATHLETE" | "PARENT";
    if (access.accessRole === "coach") senderRole = "COACH";
    else if (access.accessRole === "family") senderRole = "PARENT";
    else senderRole = "ATHLETE";

    // Create the message (immutable — no UPDATE or DELETE ever)
    const message = await prisma.message.create({
      data: {
        threadId: params.threadId,
        senderId: user.id,
        senderRole,
        content,
      },
    });

    // Update thread lastMessageAt
    await prisma.messageThread.update({
      where: { id: params.threadId },
      data: { lastMessageAt: new Date() },
    });

    // Notify recipient(s) — fire-and-forget, never block the response
    const athleteName = `${access.thread.athlete.firstName} ${access.thread.athlete.lastName}`;
    const coachLabel = access.thread.coach.title
      ? `${access.thread.coach.title}`
      : "Coach";

    if (senderRole === "COACH") {
      // Notify athlete via email
      const athleteUser = await prisma.user.findUnique({
        where: { id: access.thread.athlete.userId },
        select: { email: true },
      });
      if (athleteUser) {
        sendNewMessageToAthleteEmail({
          to: athleteUser.email,
          coachName: coachLabel,
          coachSchool: access.thread.coach.school,
          messagePreview: content,
        }).catch(() => {});
      }

      // Notify family members
      const familyMembers = await prisma.familyAccess.findMany({
        where: { athleteId: access.thread.athlete.id, status: "active" },
        select: { parent: { select: { email: true } } },
      });
      for (const fam of familyMembers) {
        sendFamilyMessageNotificationEmail({
          to: fam.parent.email,
          athleteName,
          coachName: `${coachLabel} — ${access.thread.coach.school}`,
          messagePreview: content,
          athleteSlug: access.thread.athlete.slug || "",
        }).catch(() => {});
      }

      // In-app notification for athlete
      prisma.notification.create({
        data: {
          userId: access.thread.athlete.userId,
          type: "MESSAGE",
          title: "New Message",
          description: `${access.thread.coach.school} sent you a message`,
          actionUrl: "/messages",
        },
      }).catch(() => {});
    } else {
      // Athlete or family replied → notify coach
      if (access.thread.coach.emailOnAthleteReply) {
        const coachUser = await prisma.user.findUnique({
          where: { id: access.thread.coach.userId },
          select: { email: true },
        });
        if (coachUser) {
          sendReplyToCoachEmail({
            to: coachUser.email,
            athleteName,
            messagePreview: content,
            threadId: params.threadId,
          }).catch(() => {});
        }
      }

      // In-app notification for coach
      prisma.notification.create({
        data: {
          userId: access.thread.coach.userId,
          type: "MESSAGE",
          title: "New Reply",
          description: `${athleteName} replied to your message`,
          actionUrl: `/portal/messages?thread=${params.threadId}`,
        },
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderRole: message.senderRole,
        senderName: "",
        senderLabel: null,
        createdAt: message.createdAt.toISOString(),
        readAt: null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
