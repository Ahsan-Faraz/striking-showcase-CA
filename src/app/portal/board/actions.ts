'use server';

import prisma from '@/lib/prisma';
import { verifySession, logBoardActivity } from '@/lib/dal';
import type { ColumnKey } from './types';

type ActionResult = { error?: string; data?: Record<string, unknown> };

async function getVerifiedCoachSession() {
  const user = await verifySession();
  if (!user) return { error: 'Not authenticated' };
  if (user.role !== 'COACH') return { error: 'Coach role required' };
  if (!user.coachProfile) return { error: 'Coach profile not found' };
  if (!user.coachProfile.isVerified) return { error: 'Coach must be verified' };
  return { coach: user.coachProfile, userId: user.id };
}

/** Update board entry status (drag and drop) */
export async function updateBoardStatus(
  entryId: string,
  newStatus: ColumnKey,
): Promise<ActionResult> {
  const auth = await getVerifiedCoachSession();
  if ('error' in auth) return { error: auth.error };

  const entry = await prisma.watchlist.findFirst({
    where: { id: entryId, coachId: auth.coach.id },
  });
  if (!entry) return { error: 'Board entry not found' };

  if (entry.status === newStatus) return { data: { success: true } };

  await prisma.watchlist.update({
    where: { id: entryId },
    data: { status: newStatus },
  });

  await logBoardActivity(
    entryId,
    auth.coach.id,
    `moved_to_${newStatus.toLowerCase()}`,
    entry.status,
    newStatus,
    `Moved from ${entry.status} to ${newStatus}`,
  );

  return { data: { success: true } };
}

/** Update notes for a board entry (auto-save on blur) */
export async function updateBoardNotes(
  entryId: string,
  notes: string,
): Promise<ActionResult> {
  const auth = await getVerifiedCoachSession();
  if ('error' in auth) return { error: auth.error };

  const entry = await prisma.watchlist.findFirst({
    where: { id: entryId, coachId: auth.coach.id },
  });
  if (!entry) return { error: 'Board entry not found' };

  // Save note version
  await prisma.noteVersion.create({
    data: { watchlistId: entryId, content: notes },
  });

  // Clean up old versions beyond 10
  const versions = await prisma.noteVersion.findMany({
    where: { watchlistId: entryId },
    orderBy: { createdAt: 'desc' },
    skip: 10,
    select: { id: true },
  });
  if (versions.length > 0) {
    await prisma.noteVersion.deleteMany({
      where: { id: { in: versions.map((v) => v.id) } },
    });
  }

  await prisma.watchlist.update({
    where: { id: entryId },
    data: { notes },
  });

  return { data: { success: true } };
}

/** Remove athlete from board */
export async function removeFromBoard(entryId: string): Promise<ActionResult> {
  const auth = await getVerifiedCoachSession();
  if ('error' in auth) return { error: auth.error };

  const entry = await prisma.watchlist.findFirst({
    where: { id: entryId, coachId: auth.coach.id },
  });
  if (!entry) return { error: 'Board entry not found' };

  await prisma.watchlist.delete({ where: { id: entryId } });

  return { data: { success: true } };
}

/** Send a quick reply message from detail panel */
export async function sendQuickReply(
  athleteId: string,
  content: string,
): Promise<ActionResult> {
  const auth = await getVerifiedCoachSession();
  if ('error' in auth) return { error: auth.error };

  if (!content.trim()) return { error: 'Message cannot be empty' };
  if (content.length > 5000) return { error: 'Message too long' };

  // Find or create thread
  let thread = await prisma.messageThread.findFirst({
    where: { coachId: auth.coach.id, athleteId },
  });

  if (!thread) {
    thread = await prisma.messageThread.create({
      data: { coachId: auth.coach.id, athleteId },
    });
  }

  // Create message
  await prisma.message.create({
    data: {
      threadId: thread.id,
      senderId: auth.userId,
      senderRole: 'COACH',
      content: content.trim(),
    },
  });

  // Update thread lastMessageAt
  await prisma.messageThread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date() },
  });

  // Log activity on the board entry
  const boardEntry = await prisma.watchlist.findFirst({
    where: { coachId: auth.coach.id, athleteId },
  });
  if (boardEntry) {
    await logBoardActivity(
      boardEntry.id,
      auth.coach.id,
      'message_sent',
      undefined,
      undefined,
      'Message sent',
    );
  }

  return { data: { success: true, threadId: thread.id } };
}

/** Export board as CSV — returns CSV string */
export async function exportBoardCSV(): Promise<{ error?: string; csv?: string }> {
  const auth = await getVerifiedCoachSession();
  if ('error' in auth) return { error: auth.error };

  const entries = await prisma.watchlist.findMany({
    where: { coachId: auth.coach.id },
    include: {
      athlete: {
        select: {
          firstName: true,
          lastName: true,
          school: true,
          state: true,
          classYear: true,
          seasonAverage: true,
          revRate: true,
          preferredDivisions: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const headers = [
    'Name',
    'School',
    'State',
    'Grad Year',
    'Avg Score',
    'Rev Rate',
    'Division',
    'Board Status',
    'Days on Board',
    'Last Activity',
    'Notes',
  ];

  const rows = entries.map((e) => {
    const daysOnBoard = Math.floor(
      (Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    return [
      `${e.athlete.firstName} ${e.athlete.lastName}`,
      e.athlete.school ?? '',
      e.athlete.state ?? '',
      String(e.athlete.classYear),
      e.athlete.seasonAverage != null ? String(e.athlete.seasonAverage) : '',
      e.athlete.revRate != null ? String(e.athlete.revRate) : '',
      e.athlete.preferredDivisions.join('; '),
      e.status,
      String(daysOnBoard),
      e.updatedAt.toISOString().split('T')[0],
      (e.notes ?? '').replace(/"/g, '""').replace(/\n/g, ' '),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return { csv: csvContent };
}
