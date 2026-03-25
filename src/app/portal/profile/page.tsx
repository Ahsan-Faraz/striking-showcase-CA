import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import CoachProfileEditor from './CoachProfileEditor';

export const dynamic = 'force-dynamic';

export default async function PortalProfilePage() {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'COACH') redirect('/dashboard');

  const coach = user.coachProfile;
  if (!coach) redirect('/portal');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Coach Profile
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Update your coaching information visible to athletes and their families.
        </p>
      </div>

      {/* Verification badge */}
      {coach.isVerified ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <p className="text-sm font-medium text-green-400">Verified Coach</p>
          {coach.verifiedAt && (
            <span className="text-xs text-green-400/60 ml-auto">
              since {new Date(coach.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-[#C9A84C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-[#C9A84C]">Pending Verification</p>
        </div>
      )}

      <CoachProfileEditor
        initialData={{
          school: coach.school,
          title: coach.title ?? '',
          division: coach.division ?? '',
          conference: coach.conference ?? '',
          bio: coach.bio ?? '',
          sport: coach.sport ?? 'Bowling',
        }}
        isVerified={coach.isVerified}
      />
    </div>
  );
}
