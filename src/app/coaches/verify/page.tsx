import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession } from '@/lib/dal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification Pending — Striking Showcase',
};

export const dynamic = 'force-dynamic';

export default async function CoachVerifyPage() {
  const user = await verifySession();

  // Not logged in → signup
  if (!user) redirect('/coaches/signup');

  // Not a coach → home
  if (user.role !== 'COACH') redirect('/');

  const coach = user.coachProfile;

  // Already verified → portal
  if (coach?.isVerified) redirect('/portal');

  return (
    <div className="min-h-screen bg-[#0C0A10] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Status icon */}
        <div className="w-20 h-20 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-3">
          Your Account is Pending Verification
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Our team reviews all coach accounts to protect athletes and their families.
          This typically takes <span className="text-[#C9A84C] font-semibold">24–48 hours</span>.
        </p>

        {/* Submitted info */}
        {coach && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Your Submitted Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">School</span>
                <span className="text-white font-medium">{coach.school}</span>
              </div>
              {coach.title && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Title</span>
                  <span className="text-white font-medium">{coach.title}</span>
                </div>
              )}
              {coach.division && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Division</span>
                  <span className="text-white font-medium">{coach.division}</span>
                </div>
              )}
              {coach.conference && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Conference</span>
                  <span className="text-white font-medium">{coach.conference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What you can do */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">What you can do while waiting</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="text-gray-300">Browse athlete public profiles</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="text-gray-300">Search the athlete database</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <span className="text-gray-500">Send messages to athletes <span className="text-xs">(available after verification)</span></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <span className="text-gray-500">Add athletes to recruiting board <span className="text-xs">(available after verification)</span></span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portal/search"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#1C0A14] transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E0C878 50%, #C9A84C 100%)' }}
          >
            Browse Athletes
          </Link>
          <Link
            href="/portal"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border border-white/10 text-gray-300 hover:bg-white/5 transition-all duration-300"
          >
            Go to Portal
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-600">
          Questions? Contact{' '}
          <a href="mailto:support@strikingshowcase.com" className="text-[#C9A84C] hover:underline">
            support@strikingshowcase.com
          </a>
        </p>
      </div>
    </div>
  );
}
