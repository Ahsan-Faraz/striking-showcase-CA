import { verifySession, getRecruitingBoard } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { KanbanBoard } from './KanbanBoard';
import type { SerializedBoardColumns } from './types';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'COACH') redirect('/dashboard');

  const coach = user.coachProfile;
  if (!coach) redirect('/portal');

  if (!coach.isVerified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="glass-card p-10">
          <svg className="w-16 h-16 text-[#C9A84C] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
            Verification Required
          </h1>
          <p className="text-[var(--text-secondary)]">
            Your account must be verified before you can use the recruiting board.
            You&apos;ll be notified within 24-48 hours.
          </p>
        </div>
      </div>
    );
  }

  const columns = await getRecruitingBoard(coach.id);

  // Serialize dates for client component
  const serializedColumns = Object.fromEntries(
    Object.entries(columns).map(([status, entries]) => [
      status,
      entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
        lastMessage: entry.lastMessage
          ? {
              content: entry.lastMessage.content,
              createdAt: entry.lastMessage.createdAt.toISOString(),
            }
          : null,
        activities: entry.activities.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })),
      })),
    ])
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      <KanbanBoard
        initialColumns={serializedColumns as unknown as SerializedBoardColumns}
        coachId={coach.id}
      />
    </div>
  );
}
