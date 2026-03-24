import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { verifySession } from '@/lib/dal';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();

  // Unauthenticated → login
  if (!user) redirect('/login');

  // ATHLETE on /portal → redirect to /dashboard
  if (user.role === 'ATHLETE') redirect('/dashboard');

  // PARENT on /portal → redirect to /family
  if (user.role === 'PARENT') redirect('/family');

  const role = user.role;
  const coachProfile = user.coachProfile;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[600px] h-[600px] bg-maroon/8 -top-48 -right-48" />
        <div className="orb w-[400px] h-[400px] bg-gold/5 bottom-0 left-1/4" style={{ animationDelay: '4s' }} />
      </div>
      <Sidebar
        role={role}
        coachName={coachProfile?.title ? `${coachProfile.title}` : 'Coach'}
        coachSchool={coachProfile?.school}
      />
      <main className="lg:pl-64 min-h-screen relative z-10">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
