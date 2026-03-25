import { verifySession, getCoachDashboardData } from '@/lib/dal';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  TRACKING: 'Tracking',
  CONTACTED: 'Contacted',
  VISITED: 'Visited',
  OFFERED: 'Offered',
  COMMITTED: 'Committed',
  PASSED: 'Passed',
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function PortalPage() {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'COACH') redirect('/dashboard');

  const coach = user.coachProfile;

  // Unverified coaches see a limited dashboard
  const isVerified = coach?.isVerified ?? false;

  // Fetch real data only if we have a coach profile
  const data = coach
    ? await getCoachDashboardData(coach.id, user.id)
    : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Coach Portal
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Welcome back{coach?.school ? `, ${coach.school}` : ''}. Discover and recruit athletes.
        </p>
      </div>

      {/* Verification banner */}
      {!isVerified && (
        <div className="rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#C9A84C]">Account Pending Verification</p>
            <p className="text-xs text-gray-400 mt-0.5">
              You can browse and search athletes, but messaging and board features require verification.
            </p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">On Board</p>
          <p className="font-mono text-3xl font-medium text-gold">{data?.totalOnBoard ?? 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Active Threads</p>
          <p className="font-mono text-3xl font-medium text-gold">{data?.totalThreads ?? 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Unread Messages</p>
          <p className="font-mono text-3xl font-medium text-gold">{data?.unreadMessages ?? 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Offered</p>
          <p className="font-mono text-3xl font-medium text-gold">{data?.boardColumns.OFFERED ?? 0}</p>
        </div>
      </div>

      {/* Board columns breakdown */}
      {data && data.totalOnBoard > 0 && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Recruiting Board
            </h2>
            <Link href="/portal/board" className="text-xs text-[#C9A84C] hover:underline">
              View Board &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(Object.entries(data.boardColumns) as [string, number][]).map(([status, count]) => (
              <div key={status} className="text-center rounded-xl bg-white/5 border border-white/5 p-3">
                <p className="font-mono text-xl font-medium text-[var(--text-primary)]">{count}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mt-1">
                  {STATUS_LABELS[status] ?? status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity + Quick links side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
            Recent Board Activity
          </h2>
          {data && data.recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {data.recentActivity.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">{item.athleteName}</span>
                    <span className="text-[var(--text-tertiary)]"> moved to </span>
                    <span className="text-[#C9A84C] font-medium">{STATUS_LABELS[item.status] ?? item.status}</span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] shrink-0 ml-3">
                    {timeAgo(item.date)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">No board activity yet. Start by searching for athletes.</p>
          )}
        </div>

        {/* Quick links */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/portal/search"
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Search Athletes</p>
                <p className="text-xs text-[var(--text-tertiary)]">Find recruits by stats, location, grad year</p>
              </div>
            </Link>
            <Link
              href="/portal/messages"
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Messages</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {data && data.unreadMessages > 0
                    ? `${data.unreadMessages} unread message${data.unreadMessages === 1 ? '' : 's'}`
                    : 'View athlete conversations'
                  }
                </p>
              </div>
            </Link>
            <Link
              href="/portal/board"
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Recruiting Board</p>
                <p className="text-xs text-[var(--text-tertiary)]">Manage your athlete pipeline</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
