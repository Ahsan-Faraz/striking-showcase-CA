import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } },
) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thread = await prisma.messageThread.findUnique({
      where: { id: params.threadId },
      include: {
        athlete: { select: { userId: true } },
        coach: { select: { userId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (thread.athlete.userId !== user.id && thread.coach.userId !== user.id) {
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
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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

    const thread = await prisma.messageThread.findUnique({
      where: { id: params.threadId },
      include: {
        athlete: { select: { userId: true } },
        coach: { select: { userId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (thread.athlete.userId !== user.id && thread.coach.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = messageSchema.parse(body);

    const senderRole = user.role === "COACH" ? "COACH" : "ATHLETE";

    const message = await prisma.message.create({
      data: {
        threadId: params.threadId,
        senderId: user.id,
        senderRole: senderRole,
        content,
      },
    });

    await prisma.messageThread.update({
      where: { id: params.threadId },
      data: { lastMessageAt: new Date() },
    });

    // Notify the other party
    const recipientUserId =
      thread.athlete.userId === user.id
        ? thread.coach.userId
        : thread.athlete.userId;

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: "MESSAGE",
        title: "New Message",
        description: "You have a new message",
        actionUrl: "/messages",
      },
    });

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderRole: message.senderRole,
        createdAt: message.createdAt.toISOString(),
        readAt: null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
