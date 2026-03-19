'use client';

import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ─── ANIMATED COUNTER ─── */
function Counter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const duration = 2000;
          const update = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ─── FAQ ITEM ─── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-primary)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-6 flex items-center justify-between gap-4 group"
      >
        <span className="font-heading text-lg font-semibold text-[var(--text-primary)] group-hover:text-gold transition-colors">{question}</span>
        <svg
          className={`w-5 h-5 text-[var(--text-tertiary)] shrink-0 transition-transform duration-300 ${open ? 'rotate-45 text-gold' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-400"
        style={{ maxHeight: open ? '200px' : '0' }}
      >
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed pb-6">{answer}</p>
      </div>
    </div>
  );
}

/* ─── STAR DIVIDER ─── */
function StarDivider() {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <div className="flex-1 max-w-[100px] h-px" style={{ background: 'linear-gradient(90deg, transparent, #660033, transparent)' }} />
      <svg className="w-4 h-4 opacity-50" viewBox="0 0 120 120" fill="#660033"><polygon points="60,5 72,42 112,42 80,65 90,102 60,80 30,102 40,65 8,42 48,42" /></svg>
      <div className="flex-1 max-w-[100px] h-px" style={{ background: 'linear-gradient(90deg, transparent, #660033, transparent)' }} />
    </div>
  );
}

export default function LandingPage() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setStickyVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ─── STICKY BAR (Desktop) ─── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-primary)] backdrop-blur-xl transition-transform duration-400 hidden md:block"
        style={{
          background: 'rgba(10,10,15,0.92)',
          transform: stickyVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Start Your Free Month — <span className="text-gold font-semibold">First month free</span>, then $17.99/mo
          </p>
          <Link href="/register" className="btn-primary text-xs px-5 py-2 rounded-lg">
            Start Free Month
          </Link>
        </div>
      </div>

      {/* ─── MOBILE STICKY CTA ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3 border-t border-[var(--border-primary)] backdrop-blur-xl md:hidden transition-transform duration-400"
        style={{
          background: 'rgba(10,10,15,0.95)',
          transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <Link href="/register" className="btn-primary w-full text-center block py-3 text-sm font-bold rounded-lg">
          Start Your Free Month
        </Link>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 1: CINEMATIC HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Layered backgrounds */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #660033 0%, #3A001A 35%, #0a0a0f 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(102,0,51,0.4) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.08) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb w-[600px] h-[600px] bg-[#660033] -top-[15%] -left-[15%] absolute opacity-50" style={{ animationDuration: '14s' }} />
          <div className="orb w-[500px] h-[500px] bg-[var(--gold-dark)] top-[20%] -right-[15%] absolute opacity-30" style={{ animationDuration: '18s', animationDelay: '-4s' }} />
          <div className="orb w-[700px] h-[700px] bg-[#3d001f] -bottom-[20%] left-[30%] absolute opacity-40" style={{ animationDuration: '20s', animationDelay: '-8s' }} />
        </div>
        {/* Bowling Lane Illustration */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] max-w-[1800px] h-auto opacity-55" viewBox="0 0 1200 700" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="laneGrad" x1="600" y1="700" x2="600" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a1018" stopOpacity="1"/>
                <stop offset="40%" stopColor="#0d0a10" stopOpacity=".6"/>
                <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="laneLines" x1="600" y1="700" x2="600" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(201,168,76,.15)"/>
                <stop offset="100%" stopColor="rgba(201,168,76,0)"/>
              </linearGradient>
              <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity=".5"/>
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="ballTrail" x1="600" y1="620" x2="600" y2="280" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity=".3"/>
                <stop offset="60%" stopColor="#660033" stopOpacity=".15"/>
                <stop offset="100%" stopColor="#660033" stopOpacity="0"/>
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <polygon points="400,700 800,700 680,200 520,200" fill="url(#laneGrad)" opacity=".7"/>
            <line x1="540" y1="650" x2="555" y2="280" stroke="url(#laneLines)" strokeWidth="1"/>
            <line x1="580" y1="650" x2="575" y2="280" stroke="url(#laneLines)" strokeWidth="1"/>
            <line x1="620" y1="650" x2="605" y2="280" stroke="url(#laneLines)" strokeWidth="1"/>
            <line x1="660" y1="650" x2="635" y2="280" stroke="url(#laneLines)" strokeWidth="1"/>
            <circle cx="560" cy="550" r="2" fill="rgba(201,168,76,.12)"/>
            <circle cx="600" cy="550" r="2" fill="rgba(201,168,76,.12)"/>
            <circle cx="640" cy="550" r="2" fill="rgba(201,168,76,.12)"/>
            <path d="M600 640 Q595 500 588 360 Q582 280 590 230" stroke="url(#ballTrail)" strokeWidth="18" strokeLinecap="round" fill="none" opacity=".6"/>
            <circle cx="592" cy="218" r="60" fill="url(#pinGlow)" opacity=".3"/>
            <line x1="592" y1="218" x2="540" y2="175" stroke="#C9A84C" strokeWidth="1.5" opacity=".2" filter="url(#glow)"/>
            <line x1="592" y1="218" x2="650" y2="170" stroke="#C9A84C" strokeWidth="1" opacity=".15" filter="url(#glow)"/>
            <line x1="592" y1="218" x2="560" y2="150" stroke="#660033" strokeWidth="1.5" opacity=".2" filter="url(#glow)"/>
            <line x1="592" y1="218" x2="630" y2="145" stroke="#660033" strokeWidth="1" opacity=".15" filter="url(#glow)"/>
            <circle cx="560" cy="165" r="7" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5"/>
            <circle cx="580" cy="162" r="7" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5"/>
            <circle cx="600" cy="160" r="7" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1.5"/>
            <circle cx="620" cy="162" r="7" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5"/>
            <circle cx="570" cy="182" r="8" fill="none" stroke="rgba(201,168,76,.2)" strokeWidth="1.5"/>
            <circle cx="592" cy="180" r="8" fill="none" stroke="rgba(201,168,76,.25)" strokeWidth="1.5" filter="url(#glow)"/>
            <circle cx="614" cy="182" r="8" fill="none" stroke="rgba(201,168,76,.2)" strokeWidth="1.5"/>
            <circle cx="580" cy="200" r="9" fill="none" stroke="rgba(201,168,76,.3)" strokeWidth="2" filter="url(#glow)"/>
            <circle cx="608" cy="200" r="9" fill="none" stroke="rgba(102,0,51,.35)" strokeWidth="2" filter="url(#glow)"/>
            <circle cx="594" cy="218" r="10" fill="none" stroke="#C9A84C" strokeWidth="2.5" filter="url(#glow)" opacity=".6"/>
            <circle cx="594" cy="218" r="5" fill="#C9A84C" opacity=".15"/>
            <circle cx="598" cy="300" r="14" fill="none" stroke="#660033" strokeWidth="2.5" filter="url(#glow)" opacity=".5"/>
            <circle cx="598" cy="300" r="8" fill="#660033" opacity=".2"/>
            <circle cx="594" cy="295" r="2" fill="rgba(255,255,255,.1)"/>
            <circle cx="601" cy="294" r="2" fill="rgba(255,255,255,.1)"/>
            <circle cx="597" cy="290" r="1.5" fill="rgba(255,255,255,.08)"/>
            <line x1="400" y1="700" x2="520" y2="200" stroke="rgba(255,255,255,.03)" strokeWidth="1"/>
            <line x1="800" y1="700" x2="680" y2="200" stroke="rgba(255,255,255,.03)" strokeWidth="1"/>
          </svg>
        </div>
        {/* Strike flash */}
        <div className="absolute z-[1] pointer-events-none hero-strike-flash" style={{ top: '12%', left: '50%', width: 600, height: 600, transform: 'translate(-50%,-30%)', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 30%, transparent 65%)', animation: 'strike-pulse 4s ease-in-out infinite' }} />
        {/* Light streaks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
          <div className="hero-streak" style={{ position: 'absolute', top: '22%', left: '-20%', width: 280, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', animation: 'streak-fly 4s linear infinite' }} />
          <div className="hero-streak" style={{ position: 'absolute', top: '38%', left: '-20%', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'streak-fly 3.5s linear infinite 1.2s' }} />
          <div className="hero-streak" style={{ position: 'absolute', top: '55%', left: '-20%', width: 320, height: 1, background: 'linear-gradient(90deg, transparent, #660033, transparent)', animation: 'streak-fly 5s linear infinite 2.4s' }} />
          <div className="hero-streak" style={{ position: 'absolute', top: '70%', left: '-20%', width: 160, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)', animation: 'streak-fly 3s linear infinite 3.6s' }} />
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {[
            { w: 3, bg: 'var(--gold)', top: '20%', left: '15%', dur: '8s', delay: '0s' },
            { w: 2, bg: 'rgba(255,255,255,0.4)', top: '35%', left: '72%', dur: '10s', delay: '1s' },
            { w: 4, bg: '#660033', top: '60%', left: '28%', dur: '7s', delay: '2s' },
            { w: 2, bg: 'var(--gold)', top: '75%', left: '85%', dur: '9s', delay: '3s' },
            { w: 3, bg: 'rgba(255,255,255,0.25)', top: '45%', left: '50%', dur: '11s', delay: '0.5s' },
            { w: 2, bg: 'var(--gold)', top: '15%', left: '60%', dur: '6s', delay: '4s' },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: p.w, height: p.w, background: p.bg, top: p.top, left: p.left, animation: `particle-float ${p.dur} linear infinite ${p.delay}` }} />
          ))}
        </div>
        {/* Pin glow halos */}
        <div className="absolute rounded-full pointer-events-none z-[1]" style={{ width: 120, height: 120, background: 'var(--gold)', opacity: 0.06, top: '8%', left: '45%', filter: 'blur(40px)', animation: 'pin-halo 3s ease-in-out infinite alternate' }} />
        <div className="absolute rounded-full pointer-events-none z-[1]" style={{ width: 80, height: 80, background: '#660033', opacity: 0.08, top: '15%', left: '52%', filter: 'blur(40px)', animation: 'pin-halo 3s ease-in-out infinite alternate 1s' }} />
        <div className="absolute rounded-full pointer-events-none z-[1]" style={{ width: 100, height: 100, background: 'var(--gold)', opacity: 0.05, top: '5%', left: '38%', filter: 'blur(40px)', animation: 'pin-halo 3s ease-in-out infinite alternate 2s' }} />
        {/* Gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{ background: 'linear-gradient(90deg, transparent 5%, var(--gold) 50%, transparent 95%)' }} />

        <div className="relative z-[2] max-w-[900px] mx-auto text-center pt-20">
          {/* Logo */}
          <img
            src="/logo-white.png"
            alt="Striking Showcase"
            className="mx-auto mb-8 animate-in"
            style={{ width: 'clamp(200px, 30vw, 360px)', filter: 'drop-shadow(0 0 40px rgba(102,0,51,0.3))' }}
          />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 border border-gold/20 bg-gold/[0.08] animate-in">
            <svg className="w-3.5 h-3.5" viewBox="0 0 120 120" fill="var(--gold)"><polygon points="60,5 72,42 112,42 80,65 90,102 60,80 30,102 40,65 8,42 48,42" /></svg>
            <span className="text-[11px] font-mono text-gold tracking-[0.12em] uppercase">The First Recruiting Platform for Youth Bowlers</span>
          </div>

          {/* Tagline */}
          <h1
            className="text-[clamp(28px,4.5vw,52px)] uppercase tracking-[-0.01em] leading-none animate-in-delay-1"
            style={{
              fontFamily: "'Exo 2', var(--font-exo2), sans-serif",
              fontWeight: 900,
              backgroundImage: 'linear-gradient(135deg, #660033, #C9A84C, #660033)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'grad-shift 6s ease-in-out infinite',
            }}
          >
            Show Off.<br />Get Recruited.
          </h1>

          <p className="mt-8 text-base md:text-lg text-white/50 max-w-[680px] mx-auto leading-relaxed animate-in-delay-2">
            Build your professional recruiting profile. Get discovered by college coaches.
            Your stats, your videos, your story — one link that changes everything.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-in-delay-2">
            <Link href="/register" className="btn-primary text-base px-12 py-5 rounded-xl font-bold shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200 w-full sm:w-auto">
              Start Your Free Month
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base px-10 py-5 rounded-xl w-full sm:w-auto">
              See How It Works
            </Link>
          </div>

          <p className="mt-5 text-[13px] text-white/30 animate-in-delay-3">
            No commitment. Cancel anytime. $17.99/mo after your free month.
          </p>

          {/* Social proof */}
          <div className="inline-flex items-center gap-3 mt-6 animate-in-delay-3">
            <div className="flex -space-x-2">
              {[{ bg: 'var(--gold)', text: 'AS' }, { bg: 'var(--maroon-light, #8a1a52)', text: 'MC' }, { bg: '#4a7c59', text: 'JR' }].map((a) => (
                <div key={a.text} className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-bold" style={{ background: a.bg, color: '#0a0a0f' }}>
                  {a.text}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-white/40 font-mono">Join youth bowlers already getting noticed</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-in-delay-3">
          <span className="text-[11px] font-mono text-white/25 tracking-widest uppercase">Scroll</span>
          <div className="w-4 h-4 border-r-[1.5px] border-b-[1.5px] border-white/20 rotate-45 animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: THE PROBLEM
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, rgba(102,0,51,0.06), transparent)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <StarDivider />
            <p className="section-label">The Problem</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              You&apos;re Putting In The Work.<br />
              <span className="text-gradient-gold">But Who&apos;s Watching?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>, title: 'Coaches can\'t see everyone at Junior Gold', desc: 'Thousands of athletes. One weekend. Coaches can\'t watch every squad on every pair. The best bowler for their program might be on a lane they never walked past.' },
              { icon: <><path d="M15 10l5 5M20 10l-5 5" /><rect x="2" y="3" width="14" height="14" rx="2" /></>, title: 'Instagram isn\'t a recruiting tool', desc: "You're posting highlights but coaches aren't scrolling for you. And hundreds of great bowlers don't post at all." },
              { icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, title: "You don't know who's looking", desc: 'Which coaches are actively recruiting? Which programs have open spots for your class year? You shouldn\'t have to guess.' },
            ].map((card) => (
              <div key={card.title} className="glass-card p-8 group hover:-translate-y-1 transition-all duration-300 border-b-2 border-b-transparent hover:border-b-gold/30">
                <div className="w-12 h-12 rounded-xl bg-gold/[0.08] border border-gold/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{card.icon}</svg>
                </div>
                <h3 className="font-heading text-lg font-bold uppercase mb-3 group-hover:text-gold transition-colors">{card.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14 pt-10 border-t border-[var(--border-primary)]">
            <p className="font-heading text-lg md:text-xl font-semibold text-gold mx-auto leading-snug whitespace-nowrap">
              The best bowlers don&apos;t always get recruited. The most <em className="not-italic underline decoration-gold/40 underline-offset-4">visible</em> ones do.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: THE SOLUTION (Mock Profile)
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <StarDivider />
            <p className="section-label">The Solution</p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                One Profile.<br /><span className="text-gradient-gold">Every Coach.</span>
              </h2>
              <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
                This is your recruiting profile. Coaches see this. One link. Always up to date.
                Everything a college program needs to know about you — presented professionally and verified.
              </p>
            </div>

            {/* Mock Profile Card */}
            <div className="rounded-2xl overflow-hidden border border-gold/30 relative" style={{ background: 'rgba(10,10,15,0.8)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              {/* Gradient border glow */}
              <div className="absolute inset-[-1px] rounded-2xl opacity-40 pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--gold), transparent, var(--maroon), transparent, var(--gold))', zIndex: -1 }} />
              {/* Hero banner */}
              <div className="h-28 bg-gradient-to-br from-maroon to-[#3d001f] relative flex items-end px-6 pb-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-gold bg-gradient-to-br from-gold to-[#a8893a] flex items-center justify-center font-heading text-xl font-bold text-[#0a0a0f] mr-3 shrink-0">AS</div>
                <div>
                  <p className="font-heading text-lg font-semibold text-white">Autumn Strode</p>
                  <p className="text-xs text-white/60">Class of 2026 — Springfield, IL</p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-mono">Actively Recruiting</span>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 border-b border-white/[0.08] py-4 px-6">
                {[{ v: '218', l: 'Average' }, { v: '310', l: 'Rev Rate' }, { v: '278', l: 'High Game' }, { v: '724', l: 'High Series' }].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="font-mono text-lg font-medium text-gold">{s.v}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
              {/* Badges */}
              <div className="flex gap-2 px-6 py-3 border-b border-white/[0.08]">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20">Verified</span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-gold/10 text-gold border border-gold/20">Junior Gold Qualifier</span>
              </div>
              {/* Photo placeholders */}
              <div className="grid grid-cols-3 gap-1.5 px-6 py-3 border-b border-white/[0.08]">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/10" />)}
              </div>
              {/* Tournament table */}
              <div className="px-6 py-3">
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 pb-2 border-b border-white/[0.06] mb-1">
                  {['Tournament', 'Avg', 'Finish'].map((h) => <span key={h} className="text-[9px] font-mono text-white/25 uppercase tracking-wider">{h}</span>)}
                </div>
                {[
                  ['Junior Gold Regionals', '224', '3rd'],
                  ['Springfield Classic', '218', '1st'],
                  ['Storm Youth Open', '211', '5th'],
                ].map(([name, avg, finish]) => (
                  <div key={name} className="grid grid-cols-[2fr_1fr_1fr] gap-2 py-1.5">
                    <span className="text-[11px] text-white/80">{name}</span>
                    <span className="text-[11px] text-white/50">{avg}</span>
                    <span className="text-[11px] text-white/50">{finish}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: FEATURES
          ═══════════════════════════════════════════ */}
      <section id="features" className="relative py-24 md:py-32 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, rgba(10,10,15,0.5), transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <StarDivider />
            <p className="section-label">Features</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              Everything You Need to <span className="text-gradient-gold">Get Recruited</span>
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">One subscription. Every tool a youth bowler needs to get in front of college coaches.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Professional Portfolio', desc: 'Three stunning layouts. Your stats, videos, and achievements presented like you belong on a college roster.' },
              { title: 'Verified Stats', desc: 'Your average, high game, rev rate, and tournament results — presented professionally so coaches trust what they see.' },
              { title: 'Highlight Video Gallery', desc: 'Upload your best moments. Coaches watch directly on your profile — no YouTube hunting.' },
              { title: 'AI Bio Builder', desc: "Don't know what to write? Answer 5 quick questions and AI writes your recruiting bio for you." },
              { title: 'Stat Comparison Tools', desc: 'See how your stats compare across the platform. Track your progress and know where you stand.' },
              { title: 'Direct Coach Access', desc: 'Coaches message you right through the platform. Your parents see every message automatically.' },
            ].map((f) => (
              <div key={f.title} className="glass-card p-7 group border-b-2 border-b-transparent hover:border-b-gold/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-maroon/30 to-gold/10 border border-gold/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-gold text-lg">✦</span>
                </div>
                <h3 className="font-heading text-lg font-bold uppercase mb-2 group-hover:text-gold transition-colors">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <StarDivider />
            <p className="section-label">How It Works</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              Four Steps to <span className="text-gradient-gold">Getting Recruited</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {/* Dashed connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-[2px] opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--gold) 0, var(--gold) 8px, transparent 8px, transparent 16px)' }} />
            {[
              { num: '1', title: 'Sign Up Free', desc: '60-second signup. First month is completely free.', badge: 'FREE' },
              { num: '2', title: 'Build Your Profile', desc: 'Add your stats, upload photos and videos, let AI write your bio.' },
              { num: '3', title: 'Get Discovered', desc: 'Coaches search by average, class year, location, and more. Your profile shows up.' },
              { num: '4', title: 'Get Recruited', desc: 'Coaches message you directly. Your parents are always in the loop. You choose the right program.' },
            ].map((step) => (
              <div key={step.num} className="text-center relative group">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 bg-gradient-to-br from-maroon to-[#3d001f] border-2 border-gold/30 flex items-center justify-center relative z-10 group-hover:border-gold/60 group-hover:scale-105 transition-all duration-300">
                  <span className="font-heading text-3xl font-bold text-gold">{step.num}</span>
                  {step.badge && (
                    <span className="absolute -top-1.5 -right-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-gold to-[var(--gold-light)] text-[10px] font-mono font-medium text-[#0a0a0f] tracking-wider">{step.badge}</span>
                  )}
                </div>
                <h3 className="font-heading text-lg font-bold uppercase mb-2 group-hover:text-gold transition-colors">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6: SOCIAL PROOF
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, rgba(102,0,51,0.06), transparent)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <StarDivider />
            <p className="section-label">Social Proof</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              Bowlers Like You Are <span className="text-gradient-gold">Getting Noticed</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'I signed up on a Thursday. By Monday, two coaches had viewed my profile and one sent a message. This actually works.', name: 'Autumn S.', meta: 'Class of 2026 — Illinois — 218 avg', initials: 'AS' },
              { quote: "My daughter's profile on Striking Showcase is what got the conversation started with Wichita State. Worth every penny.", name: 'Mike S.', meta: 'Parent', initials: 'MS' },
              { quote: "I didn't even know some of these schools had bowling programs. Now three of them are talking to me.", name: 'Marcus C.', meta: 'Class of 2026 — Texas — 224 avg', initials: 'MC' },
            ].map((t) => (
              <div key={t.name} className="glass-card p-7 md:p-8 group hover:border-gold/20 transition-all duration-300">
                <span className="font-heading text-5xl text-gold/15 leading-none block mb-2">&ldquo;</span>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed italic mb-6">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-secondary)]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-[var(--maroon-light,#8a1a52)] flex items-center justify-center font-heading text-sm font-semibold text-gold shrink-0">{t.initials}</div>
                  <div>
                    <p className="text-sm font-heading font-semibold text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)] font-mono">{t.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: THE NUMBERS
          ═══════════════════════════════════════════ */}
      <section className="py-20 px-4 border-y border-[var(--border-primary)]" style={{ background: 'linear-gradient(135deg, rgba(102,0,51,0.12), rgba(10,10,15,0.9), rgba(201,168,76,0.06))' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {([
            { target: 4800, suffix: '+', label: 'Athlete profiles', prefix: '' },
            { target: 50, suffix: 'K+', label: 'Profile views by coaches', prefix: '' },
            { target: 6, suffix: '', label: 'Recruiting tools built in', prefix: '' },
            { target: 3, suffix: '', label: 'Portfolio layouts', prefix: '' },
          ] as const).map((n) => (
            <div key={n.label} className="text-center">
              <p className="font-mono text-3xl md:text-4xl font-medium text-gold mb-2">
                <Counter target={n.target} prefix={n.prefix} suffix={n.suffix} />
              </p>
              <p className="text-sm text-[var(--text-secondary)] max-w-[180px] mx-auto">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8: FOR PARENTS
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="section-label">For Parents</p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Parents: Here&apos;s Why This Is <span className="text-gradient-gold">Worth $17.99/mo</span>
              </h2>
              <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
                You already spend hundreds on tournaments, equipment, and coaching. Striking Showcase puts all that investment in front of the people who can turn it into a scholarship. And you&apos;ll never miss a message from a coach — you&apos;re CC&apos;d on everything.
              </p>
              <p className="mt-8 font-heading text-lg font-medium text-gold leading-snug">
                Your kid is investing 20+ hours a week in bowling. Invest $17.99/mo in making sure it counts.
              </p>
            </div>

            {/* Value Card */}
            <div className="glass-card p-8 md:p-10 border-gold/30">
              <h3 className="font-heading text-xl font-semibold mb-7">What $17.99/month gets your bowler:</h3>
              <div className="space-y-0">
                {[
                  ['Professional recruiting profile', '$500+ value'],
                  ['Video hosting for highlight reels', '$20/mo value'],
                  ['Direct access to college programs', 'Priceless'],
                  ['AI-written recruiting bio', '$100+ value'],
                  ['Verified stats coaches trust', 'Credibility'],
                ].map(([item, value]) => (
                  <div key={item} className="flex justify-between items-baseline py-3 border-b border-white/[0.04] last:border-b-0">
                    <span className="text-sm text-[var(--text-primary)]">{item}</span>
                    <span className="text-xs font-mono text-gold ml-4 shrink-0">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t-2 border-gold/30 text-center">
                <p className="font-heading text-sm whitespace-nowrap">
                  Total value: <span className="text-gold font-semibold">$600+</span>. Your cost: <span className="text-gold font-semibold">$17.99/mo</span>. First month free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: FOUNDER
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, rgba(102,0,51,0.06), transparent)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label text-center mb-12">Built by the Bowling Community</p>
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-center">
            {/* Founder photo */}
            <div className="w-[280px] h-[340px] rounded-2xl mx-auto md:mx-0 overflow-hidden border border-gold/30 relative">
              <img src="/diandra.jpg" alt="Diandra Asbaty" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-heading text-2xl md:text-3xl font-bold">Diandra Asbaty</h3>
              <span className="text-sm font-mono text-gold tracking-wider block mt-2 mb-5">Founder, Striking Showcase</span>
              <p className="text-[var(--text-secondary)] leading-relaxed max-w-[580px]">
                2x Collegiate National Champion. World Champion. Hall of Famer.
                Diandra built Striking Showcase because she&apos;s been on both sides of the lane and knows great bowlers get overlooked every single year.
              </p>
              <div className="flex gap-10 mt-8 pt-6 border-t border-[var(--border-primary)]">
                {[
                  { val: '2x', label: 'National Champion' },
                  { val: '3x', label: 'Hall of Famer' },
                  { val: '1000s', label: 'Families Served' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-mono text-2xl font-medium text-gold">{s.val}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10: PRICING
          ═══════════════════════════════════════════ */}
      <section id="pricing" className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-lg mx-auto text-center">
          <p className="section-label">Pricing</p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-4">
            One Plan. <span className="text-gradient-gold">Everything Included.</span>
          </h2>

          <div className="accent-card p-8 md:p-10 mt-12 text-center relative overflow-hidden" id="signup">
            <div className="font-heading text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-2">
              $17.99<span className="text-xl font-normal text-[var(--text-tertiary)]">/month</span>
            </div>
            <p className="font-heading text-xl font-semibold text-gradient-gold mb-8">First Month FREE</p>
            <ul className="space-y-3 text-left mb-8">
              {[
                'Professional recruiting portfolio (3 layouts)',
                'Unlimited photo and video uploads',
                'Verified stat display',
                'AI Bio Builder',
                'Direct messaging with coaches',
                'Stat comparison tools',
                'Profile analytics (see who\'s viewing)',
                'Tournament results tracker',
                'Ball arsenal showcase',
                'Parent/guardian access included',
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary w-full text-center block py-4 text-base font-bold shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200">
              Start Your Free Month
            </Link>
            <p className="text-xs text-[var(--text-tertiary)] mt-5">Credit card required. Cancel anytime. No contracts.</p>
            <p className="text-sm text-[var(--text-secondary)] mt-4 pt-4 border-t border-[var(--border-secondary)] italic">
              Coaches use Striking Showcase completely free — they&apos;re here looking for YOU.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 11: FAQ
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">FAQ</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h2>
          </div>
          <div>
            <FaqItem question="Is it really free for the first month?" answer="Yes. You get full access for 30 days. If you love it, it's $17.99/month after that. If not, cancel before your trial ends and you won't be charged." />
            <FaqItem question="What if I'm not good enough yet?" answer="There's no minimum average required. Coaches recruit athletes at all levels — D1, D2, NAIA, NJCAA. If you're competing in youth bowling, you belong here." />
            <FaqItem question="Can my parents see my messages?" answer="Yes. Parents are automatically CC'd on every coach message. Full transparency, always." />
            <FaqItem question="How is this different from just emailing coaches?" answer="Coaches don't read cold emails from athletes they've never heard of. On Striking Showcase, coaches come to YOU — they search, they discover your profile, they reach out. You're not chasing. You're being found." />
            <FaqItem question="What if no coaches contact me?" answer="Your profile is searchable by college programs nationwide. But visibility takes effort — complete your profile, upload videos, keep your stats current. The more complete your profile, the more coaches find you." />
            <FaqItem question="Do I need a USBC membership?" answer="Not required. Having one is great, but all bowlers competing in youth bowling are welcome on the platform." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 12: FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="relative py-28 md:py-36 px-4 overflow-hidden text-center">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #3A001A 50%, #660033 100%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(102,0,51,0.3), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px opacity-30" style={{ background: 'linear-gradient(90deg, transparent 5%, var(--gold) 50%, transparent 95%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-[1.05]">
            Your Next Chapter<br />
            <span className="text-gradient-gold">Starts With One Profile</span>
          </h2>
          <p className="mt-6 text-lg text-white/50 max-w-[520px] mx-auto">
            College programs are searching for someone exactly like you right now.
          </p>
          <div className="mt-10">
            <Link href="/register" className="btn-primary text-lg px-14 py-5 rounded-xl font-bold shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200">
              Start Your Free Month
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/30 font-heading tracking-wider">
            No risk. No commitment. Show Off. Get Recruited.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 13: FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-[var(--border-primary)] py-16 px-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 items-start mb-12">
            <div>
              <img src="/logo-white.png" alt="Striking Showcase" className="h-10 w-auto" />
              <p className="text-sm text-[var(--text-tertiary)] mt-2">Show Off. Get Recruited.</p>
            </div>
            <div className="flex flex-wrap gap-4 md:flex-col md:gap-3">
              {['About', 'For Athletes', 'For Coaches', 'Privacy', 'Terms', 'Contact', 'Support'].map((l) => (
                <Link key={l} href="#" className="text-sm text-[var(--text-secondary)] hover:text-gold transition-colors">{l}</Link>
              ))}
            </div>
            <div className="flex gap-3">
              {[
                <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
                <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />,
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />,
              ].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl border border-[var(--border-primary)] flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group">
                  <svg className="w-[18px] h-[18px] text-[var(--text-secondary)] group-hover:text-gold transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                </a>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-[var(--border-primary)] text-center md:text-left">
            <p className="text-[13px] text-[var(--text-tertiary)]">&copy; {new Date().getFullYear()} Striking Showcase. <span className="text-gold">Show Off. Get Recruited.</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
