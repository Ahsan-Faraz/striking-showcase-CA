import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import CoachSettingsForm from './CoachSettingsForm';

export const dynamic = 'force-dynamic';

export default async function PortalSettingsPage() {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'COACH') redirect('/dashboard');

  const coach = user.coachProfile;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Manage your notification preferences and account.
        </p>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-5">
          Email Notifications
        </h2>
        <CoachSettingsForm
          initialData={{
            emailOnAthleteReply: coach?.emailOnAthleteReply ?? true,
            emailDailyDigest: coach?.emailDailyDigest ?? true,
          }}
        />
      </div>

      {/* Account section */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-5">
          Account
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Email</p>
              <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Role</p>
              <p className="text-xs text-[var(--text-tertiary)]">Coach</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass-card p-6 border-red-500/20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400/80 mb-5">
          Danger Zone
        </h2>
        <SignOutButton />
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
      >
        Sign Out
      </button>
    </form>
  );
}
