import { Sidebar } from '@/components/layout/Sidebar';
import { verifySession } from '@/lib/dal';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();
  const role = user?.role;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      {/* Subtle ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[600px] h-[600px] bg-maroon/8 -top-48 -right-48" />
        <div className="orb w-[400px] h-[400px] bg-gold/5 bottom-0 left-1/4" style={{ animationDelay: '4s' }} />
      </div>
      <Sidebar role={role} />
      <main className="lg:pl-64 min-h-screen relative z-10">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
