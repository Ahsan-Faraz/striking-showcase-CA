import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const createThreadSchema = z.object({
  athleteId: z.string().min(1),
  message: z.string().min(1, 'Message cannot be empty'),
});

async function getAuthUser(request: NextRequest) {
  try {
    return await getCurrentUser(request);
  } catch {
    return null;
  }
}

async function getDemoRole() {
  // Determine role from available profiles — prefer coach if one exists
  const coach = await prisma.coachProfile.findFirst({ orderBy: { createdAt: 'asc' } });
  if (coach) return { role: 'COACH' as const, coachProfile: coach, athleteProfile: null };
  const athlete = await prisma.athleteProfile.findFirst({ orderBy: { createdAt: 'asc' } });
  if (athlete) return { role: 'ATHLETE' as const, coachProfile: null, athleteProfile: athlete };
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    let threads;

    if (user) {
      // Authenticated path
      if (user.role === 'COACH') {
        const coachProfile = await prisma.coachProfile.findUnique({
          where: { userId: user.id },
        });
        if (!coachProfile) {
          return NextResponse.json({ threads: [] });
        }

        threads = await prisma.messageThread.findMany({
          where: { coachId: coachProfile.id },
          include: {
            athlete: { select: { firstName: true, lastName: true, profilePhotoUrl: true, school: true } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { lastMessageAt: 'desc' },
        });

        return NextResponse.json({
          threads: threads.map((t) => ({
            id: t.id,
            lastMessageAt: t.lastMessageAt.toISOString(),
            otherParty: {
              name: `${t.athlete.firstName} ${t.athlete.lastName}`,
              school: t.athlete.school,
              photoUrl: t.athlete.profilePhotoUrl,
            },
            lastMessage: t.messages[0] ? {
              content: t.messages[0].content,
              senderId: t.messages[0].senderId,
              readAt: t.messages[0].readAt?.toISOString() || null,
            } : undefined,
            unreadCount: 0,
          })),
        });
      } else {
        const athleteProfile = await prisma.athleteProfile.findUnique({
          where: { userId: user.id },
        });
        if (!athleteProfile) {
          return NextResponse.json({ threads: [] });
        }

        threads = await prisma.messageThread.findMany({
          where: { athleteId: athleteProfile.id },
          include: {
            coach: { select: { school: true, user: { select: { email: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { lastMessageAt: 'desc' },
        });

        const unreadCounts = await Promise.all(
          threads.map((t) =>
            prisma.message.count({
              where: { threadId: t.id, readAt: null, senderId: { not: user.id } },
            })
          )
        );

        return NextResponse.json({
          threads: threads.map((t, i) => ({
            id: t.id,
            lastMessageAt: t.lastMessageAt.toISOString(),
            otherParty: {
              name: t.coach.school,
              school: t.coach.school,
              photoUrl: null,
            },
            lastMessage: t.messages[0] ? {
              content: t.messages[0].content,
              senderId: t.messages[0].senderId,
              readAt: t.messages[0].readAt?.toISOString() || null,
            } : undefined,
            unreadCount: unreadCounts[i],
          })),
        });
      }
    } else {
      // Demo mode — determine role from available profiles
      const demo = await getDemoRole();
      if (!demo) {
        return NextResponse.json({ threads: [] });
      }

      if (demo.role === 'COACH' && demo.coachProfile) {
        threads = await prisma.messageThread.findMany({
          where: { coachId: demo.coachProfile.id },
          include: {
            athlete: { select: { firstName: true, lastName: true, profilePhotoUrl: true, school: true } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { lastMessageAt: 'desc' },
        });

        return NextResponse.json({
          threads: threads.map((t) => ({
            id: t.id,
            lastMessageAt: t.lastMessageAt.toISOString(),
            otherParty: {
              name: `${t.athlete.firstName} ${t.athlete.lastName}`,
              school: t.athlete.school,
              photoUrl: t.athlete.profilePhotoUrl,
            },
            lastMessage: t.messages[0] ? {
              content: t.messages[0].content,
              senderId: t.messages[0].senderId,
              readAt: t.messages[0].readAt?.toISOString() || null,
            } : undefined,
            unreadCount: 0,
          })),
        });
      } else if (demo.role === 'ATHLETE' && demo.athleteProfile) {
        threads = await prisma.messageThread.findMany({
          where: { athleteId: demo.athleteProfile.id },
          include: {
            coach: { select: { school: true, user: { select: { email: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { lastMessageAt: 'desc' },
        });

        return NextResponse.json({
          threads: threads.map((t) => ({
            id: t.id,
            lastMessageAt: t.lastMessageAt.toISOString(),
            otherParty: {
              name: t.coach.school,
              school: t.coach.school,
              photoUrl: null,
            },
            lastMessage: t.messages[0] ? {
              content: t.messages[0].content,
              senderId: t.messages[0].senderId,
              readAt: t.messages[0].readAt?.toISOString() || null,
            } : undefined,
            unreadCount: 0,
          })),
        });
      }

      return NextResponse.json({ threads: [] });
    }
  } catch (error) {
    console.error('Get threads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    // Resolve coach profile — auth or demo fallback
    let coachProfile;
    if (user) {
      if (user.role !== 'COACH') {
        return NextResponse.json({ error: 'Unauthorized — only coaches can initiate threads' }, { status: 401 });
      }
      coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: user.id },
      });
    } else {
      coachProfile = await prisma.coachProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    }

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = createThreadSchema.parse(body);

    // Determine senderId — use the coach profile's userId for demo mode
    const senderId = user ? user.id : coachProfile.userId;

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
      // Add message to existing thread
      const message = await prisma.message.create({
        data: {
          threadId: existing.id,
          senderId,
          senderRole: 'COACH',
          content: validated.message,
        },
      });

      await prisma.messageThread.update({
        where: { id: existing.id },
        data: { lastMessageAt: new Date() },
      });

      return NextResponse.json({ threadId: existing.id, message });
    }

    // Create new thread with first message
    const thread = await prisma.messageThread.create({
      data: {
        athleteId: validated.athleteId,
        coachId: coachProfile.id,
        messages: {
          create: {
            senderId,
            senderRole: 'COACH',
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
          type: 'MESSAGE',
          title: 'New Message',
          description: `${coachProfile.school} sent you a message`,
          actionUrl: '/messages',
        },
      });
    }

    return NextResponse.json({ threadId: thread.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create thread error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
