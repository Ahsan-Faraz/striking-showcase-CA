import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
         style={{ background: 'linear-gradient(160deg, #110E18 0%, #1A0A12 35%, #2A0E20 55%, #110E18 100%)' }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large maroon glow top-right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(102,0,51,0.25) 0%, transparent 70%)' }} />
        {/* Gold accent glow bottom-left */}
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <img
              src="/logo-white.png"
              alt="Striking Showcase"
              className="h-16 w-auto"
              style={{ filter: 'drop-shadow(0 0 30px rgba(102,0,51,0.3))' }}
            />
          </Link>
        </div>

        {/* Card with gradient top border */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient top border accent */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #660033, #C9A84C, #660033)' }} />
          <div className="glass-card rounded-t-none p-8 border-t-0">
            {children}
          </div>
        </div>

        {/* Decorative bottom text */}
        <p className="text-center mt-6 text-[10px] uppercase tracking-[0.25em] text-[var(--text-tertiary)]/40">
          Show Off. Get Recruited
        </p>
      </div>
    </div>
  );
}
