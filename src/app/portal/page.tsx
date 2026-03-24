import { verifySession } from '@/lib/dal';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'COACH') redirect('/dashboard');

  const coach = user.coachProfile;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Coach Portal
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Welcome back{coach?.school ? `, ${coach.school}` : ''}. Discover and recruit athletes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Board Athletes</p>
          <p className="font-mono text-3xl font-medium text-gold">—</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Active Threads</p>
          <p className="font-mono text-3xl font-medium text-gold">—</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Profiles Viewed</p>
          <p className="font-mono text-3xl font-medium text-gold">—</p>
        </div>
      </div>

      <div className="glass-card p-8 mt-8 text-center">
        <p className="text-[var(--text-secondary)]">
          Coach portal features are coming soon. Search, recruiting board, and messaging will be available in upcoming sprints.
        </p>
      </div>
    </div>
  );
}
