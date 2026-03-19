import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

async function getAuthUser(request: NextRequest) {
  try {
    return await getCurrentUser(request);
  } catch {
    return null;
  }
}

async function resolveUserIdForThread(request: NextRequest, thread: { athlete: { userId: string }, coach: { userId: string } }) {
  const user = await getAuthUser(request);
  if (user) {
    return { userId: user.id, role: user.role };
  }
  // Demo mode: check if thread's athlete or coach profile is the first of its kind
  const firstAthlete = await prisma.athleteProfile.findFirst({ orderBy: { createdAt: 'asc' }, select: { userId: true } });
  if (firstAthlete && firstAthlete.userId === thread.athlete.userId) {
    return { userId: thread.athlete.userId, role: 'ATHLETE' as const };
  }
  const firstCoach = await prisma.coachProfile.findFirst({ orderBy: { createdAt: 'asc' }, select: { userId: true } });
  if (firstCoach && firstCoach.userId === thread.coach.userId) {
    return { userId: thread.coach.userId, role: 'COACH' as const };
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    // Verify user has access to this thread
    const thread = await prisma.messageThread.findUnique({
      where: { id: params.threadId },
      include: {
        athlete: { select: { userId: true } },
        coach: { select: { userId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const resolved = await resolveUserIdForThread(request, thread);
    if (!resolved) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (thread.athlete.userId !== resolved.userId && thread.coach.userId !== resolved.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { threadId: params.threadId },
      orderBy: { createdAt: 'asc' },
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
        senderId: { not: resolved.userId },
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
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    // Verify access
    const thread = await prisma.messageThread.findUnique({
      where: { id: params.threadId },
      include: {
        athlete: { select: { userId: true } },
        coach: { select: { userId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const resolved = await resolveUserIdForThread(request, thread);
    if (!resolved) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (thread.athlete.userId !== resolved.userId && thread.coach.userId !== resolved.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content } = messageSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        threadId: params.threadId,
        senderId: resolved.userId,
        senderRole: resolved.role,
        content,
      },
    });

    // Update thread lastMessageAt
    await prisma.messageThread.update({
      where: { id: params.threadId },
      data: { lastMessageAt: new Date() },
    });

    // Notify the other party
    const recipientUserId = thread.athlete.userId === resolved.userId
      ? thread.coach.userId
      : thread.athlete.userId;

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'MESSAGE',
        title: 'New Message',
        description: `You have a new message`,
        actionUrl: '/messages',
      },
    });

    return NextResponse.json({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderRole: message.senderRole,
      createdAt: message.createdAt.toISOString(),
      readAt: null,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
