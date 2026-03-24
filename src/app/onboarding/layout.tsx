import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'ATHLETE') redirect('/portal');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 -top-48 -right-48"
          style={{ background: 'radial-gradient(circle, #660033, transparent)' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 bottom-0 left-1/4"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
