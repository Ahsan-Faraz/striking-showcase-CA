'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BenchmarkBar } from '@/components/athlete/BenchmarkBar';

interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  school: string;
  division: string;
  conference: string;
  isVerified: boolean;
  rosterSize: number;
  openSpots: number;
  bio: string;
  achievements: string[];
  programHighlights: { label: string; value: string }[];
  recruitingNeeds: string[];
  contactEmail: string;
  contactPhone: string;
  schoolWebsite: string;
}

function HeroStat({ value, label, gradient, isLight }: { value: string; label: string; gradient?: boolean; isLight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`font-heading text-4xl md:text-6xl font-black tracking-tight ${gradient ? 'text-gradient-gold' : (isLight ? 'text-[#1A0E1E]' : 'text-white')}`}>
        {value}
      </p>
      <p className={`text-[10px] md:text-xs uppercase tracking-[0.15em] mt-2 font-mono ${isLight ? 'text-[#7A7084]' : 'text-white/40'}`}>
        {label}
      </p>
    </div>
  );
}

export default function CoachPortfolioClient({ coach }: { coach: CoachData }) {
  const rosterPercent = ((coach.rosterSize - coach.openSpots) / coach.rosterSize) * 100;
  const filledSpots = coach.rosterSize - coach.openSpots;
  const schoolInitials = coach.school
    .split(' ')
    .map((w) => w[0])
    .filter((c) => c === c.toUpperCase() && c.match(/[A-Z]/))
    .slice(0, 3)
    .join('');

  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setIsLight(current === 'light');
  }, []);

  function toggleTheme() {
    const next = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    setIsLight(!isLight);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Animated gradient keyframe */}
      <style>{`
        @keyframes grad-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .coach-hero-name {
          font-family: var(--font-exo2), sans-serif;
          font-weight: 900;
          font-size: clamp(48px, 8vw, 96px);
          letter-spacing: -.01em;
          line-height: 0.9;
          text-transform: uppercase;
          background: linear-gradient(135deg, #660033, #C9A84C, #660033);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: grad-shift 6s ease-in-out infinite;
        }
        .coach-hero-light {
          font-family: var(--font-exo2), sans-serif;
          font-weight: 700;
          font-size: clamp(24px, 4vw, 48px);
          color: ${isLight ? '#660033' : '#fff'};
          letter-spacing: .04em;
          line-height: 1.15;
          text-transform: uppercase;
        }
      `}</style>

      {/* ─── CINEMATIC HERO ─── */}
      <section className="relative overflow-hidden" style={{ minHeight: 620 }}>
        {/* Layered gradient background */}
        <div className="absolute inset-0" style={{ background: isLight ? 'linear-gradient(160deg, #F5E6EC 0%, #FDFBF8 40%, #FDFBF8 100%)' : 'linear-gradient(160deg, #660033 0%, #3A001A 30%, #1A1524 70%, #0a0a0f 100%)' }} />
        {/* Radial gold glow */}
        <div className="absolute inset-0" style={{ background: isLight ? 'radial-gradient(ellipse at 70% 20%, rgba(201,168,76,0.08) 0%, transparent 60%)' : 'radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.15) 0%, transparent 60%)' }} />
        {/* Secondary maroon glow */}
        <div className="absolute inset-0" style={{ background: isLight ? 'radial-gradient(ellipse at 20% 80%, rgba(102,0,51,0.06) 0%, transparent 50%)' : 'radial-gradient(ellipse at 20% 80%, rgba(102,0,51,0.25) 0%, transparent 50%)' }} />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        {/* Star watermark */}
        <div className="absolute top-8 right-8 opacity-[0.04] pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 24 24" fill={isLight ? '#660033' : 'white'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        </div>
        {/* Bowling pin watermark */}
        <div className="absolute bottom-16 left-8 opacity-[0.03] pointer-events-none" style={{ animation: 'float 6s ease-in-out infinite' }}>
          <svg width="100" height="160" viewBox="0 0 24 40" fill={isLight ? '#660033' : 'white'}><ellipse cx="12" cy="36" rx="8" ry="4" /><path d="M6 32c-1 2-2 3-2 4s2 4 8 4 8-3 8-4-1-2-2-4c-1-3-1-8 0-12 1-3 2-6 2-9 0-4-2-7-4-9C14.5 1 13 0 12 0S9.5 1 8 2C6 4 4 7 4 11c0 3 1 6 2 9 1 4 1 9 0 12z" /></svg>
        </div>
        {/* Gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ opacity: isLight ? 0.3 : 0.5, background: 'linear-gradient(90deg, transparent 5%, #660033 30%, #C9A84C 50%, #660033 70%, transparent 95%)' }} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20" style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
          {/* Top bar: badges + actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {coach.isVerified && <Badge variant="verified">Verified Program</Badge>}
              <Badge variant="division">{coach.division}</Badge>
            </div>
            <div className="flex gap-2">
              <button className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:scale-105 transition-all duration-200 ${isLight ? 'bg-maroon/5 border-maroon/15 text-maroon/60 hover:text-maroon hover:bg-maroon/10' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`} onClick={toggleTheme} title={isLight ? 'Dark mode' : 'Light mode'}>
                {isLight ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                )}
              </button>
              <button className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:scale-105 transition-all duration-200 ${isLight ? 'bg-maroon/5 border-maroon/15 text-maroon/60 hover:text-maroon hover:bg-maroon/10' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`} onClick={() => navigator.clipboard.writeText(window.location.href)} title="Share">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
              </button>
            </div>
          </div>

          {/* Main hero layout */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-14">
            {/* School Crest */}
            <div className="shrink-0" style={{ animation: 'fadeInUp 0.8s ease forwards 0.2s', opacity: 0 }}>
              <div className="w-44 h-56 md:w-52 md:h-64 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden gap-3" style={{ background: 'linear-gradient(135deg, rgba(102,0,51,0.6), rgba(26,21,36,0.8))' }}>
                <div className="absolute inset-0 rounded-2xl" style={{ padding: 2, background: 'linear-gradient(180deg, #C9A84C, #660033, #C9A84C)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                <span className="font-heading text-5xl md:text-6xl font-black text-gold/70 tracking-widest">{schoolInitials}</span>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-mono">Bowling</span>
              </div>
            </div>

            {/* Name block — Collegiate Superstar style */}
            <div className="flex-1 text-center md:text-left" style={{ animation: 'fadeInUp 0.8s ease forwards 0.3s', opacity: 0 }}>
              <div className="coach-hero-light">{coach.school}</div>
              <div className="coach-hero-name mt-1">{coach.firstName} {coach.lastName}</div>

              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <span className={`font-body text-base ${isLight ? 'text-[#4A3E52]' : 'text-white/50'}`}>{coach.conference}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                <span className={`font-mono text-sm font-bold ${isLight ? 'text-[#8B6B1F]' : 'text-gold'}`}>{coach.openSpots} spot{coach.openSpots !== 1 ? 's' : ''} open</span>
              </div>

              {/* Roster bar */}
              <div className="mt-4 max-w-lg">
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-maroon/10' : 'bg-white/10'}`}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${rosterPercent}%`, background: 'linear-gradient(90deg, #660033, #C9A84C)' }} />
                </div>
                <p className={`text-[10px] font-mono mt-1.5 tracking-wider ${isLight ? 'text-[#7A7084]' : 'text-white/30'}`}>{filledSpots} / {coach.rosterSize} ROSTER FILLED</p>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Button variant="primary" size="lg" className="shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200">
                  Message Coach
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Stat Bar */}
          <div className={`mt-10 pt-6 border-t ${isLight ? 'border-maroon/10' : 'border-white/10'}`} style={{ animation: 'fadeInUp 0.8s ease forwards 0.5s', opacity: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {coach.programHighlights.map((h, i) => (
                <HeroStat key={h.label} value={h.value} label={h.label} gradient={i === 0} isLight={isLight} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENTO GRID ─── */}
      <section className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">

          {/* ── Program Overview — 4 cols ── */}
          <div className="md:col-span-4 glass-card p-6 md:p-8 animate-in">
            <p className="section-label mb-3">About the Program</p>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] font-body">
              {coach.bio}
            </p>
            <div className="mt-5 pt-5 border-t border-[var(--border-secondary)]">
              <div className="flex flex-wrap gap-2">
                {[coach.division, coach.conference, `${coach.rosterSize}-Person Roster`, 'NCAA Sanctioned'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Roster Status — 2 cols ── */}
          <div className="md:col-span-2 glass-card p-6 md:p-8 animate-in-delay-1">
            <p className="section-label mb-4">Roster Status</p>
            <div className="text-center mb-5">
              <p className="font-heading text-6xl font-black text-gold">{coach.openSpots}</p>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">
                Open Spot{coach.openSpots !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Visual roster dots */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {Array.from({ length: coach.rosterSize }).map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold transition-all duration-300 ${
                    i < filledSpots
                      ? 'bg-gradient-to-br from-maroon to-maroon/70 text-white/60 border border-maroon/40'
                      : 'bg-gold/20 text-gold border border-gold/30 animate-pulse'
                  }`}
                >
                  {i < filledSpots ? '' : '?'}
                </div>
              ))}
            </div>

            <div className="w-full h-2.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all duration-1000"
                style={{ width: `${rosterPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2 font-mono">
              {filledSpots} / {coach.rosterSize} FILLED
            </p>
          </div>

          {/* ── Program Achievements — 6 cols, gradient top border ── */}
          <div
            className="md:col-span-6 glass-card p-6 md:p-8 animate-in-delay-1"
            style={{
              borderTop: '2px solid transparent',
              borderImage: 'linear-gradient(90deg, #660033, var(--gold), #660033) 1',
            }}
          >
            <p className="section-label mb-5">Program Achievements</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {coach.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 hover:bg-[var(--bg-card)] transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {i === 0 ? (
                      <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.04 6.04 0 01-2.77.853" />
                      </svg>
                    ) : i === 1 ? (
                      <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    ) : i === 3 ? (
                      <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-primary)] group-hover:text-gold transition-colors font-body">
                    {achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── What We're Looking For — 4 cols ── */}
          <div className="md:col-span-4 glass-card p-6 md:p-8 animate-in-delay-2">
            <p className="section-label mb-2">What We&apos;re Looking For</p>
            <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] uppercase mb-5">
              Recruiting Needs
            </h3>
            <div className="space-y-3">
              {coach.recruitingNeeds.map((need, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-gold/20 transition-colors">
                    <span className="text-gold text-xs font-bold font-mono">{i + 1}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors font-body">
                    {need}
                  </p>
                </div>
              ))}
            </div>

            {/* Benchmark targets */}
            <div className="mt-6 pt-5 border-t border-[var(--border-secondary)]">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mb-3">
                TARGET BENCHMARKS
              </p>
              <div className="space-y-3">
                <BenchmarkBar label="Season Average" value={200} benchmark={200} />
                <BenchmarkBar label="GPA" value={3.5} benchmark={3.5} />
              </div>
            </div>
          </div>

          {/* ── Contact & Info — 2 cols ── */}
          <div className="md:col-span-2 glass-card p-6 md:p-8 animate-in-delay-2">
            <p className="section-label mb-5">Contact</p>
            <div className="space-y-5">
              {coach.contactEmail && (
                <div className="group">
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mb-1">Email</p>
                  <a
                    href={`mailto:${coach.contactEmail}`}
                    className="text-sm text-gold hover:text-gold-light transition-colors hover:underline flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    {coach.contactEmail}
                  </a>
                </div>
              )}
              {coach.contactPhone && (
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mb-1">Phone</p>
                  <p className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {coach.contactPhone}
                  </p>
                </div>
              )}
              {coach.schoolWebsite && (
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mb-1">Program Website</p>
                  <a
                    href={coach.schoolWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gold hover:text-gold-light transition-colors hover:underline flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    Visit Website &rarr;
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border-secondary)]">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mb-3">Program Info</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Division', value: coach.division },
                  { label: 'Conference', value: coach.conference.split(' ').map(w => w[0]).join('') },
                  { label: 'Roster Size', value: String(coach.rosterSize) },
                  { label: 'Open Spots', value: String(coach.openSpots) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors"
                  >
                    <p className="font-heading text-lg font-bold text-[var(--text-primary)]">{item.value}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full mt-6 shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200">
              Message Coach
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[var(--border-primary)]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Bowling pin icon */}
            <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C11 2 10 3 9.5 4.5C9 6 9 7.5 9.5 9C10 10.5 10 12 9.5 14C9 16 8 18 8 19.5C8 21 9.5 22 12 22C14.5 22 16 21 16 19.5C16 18 15 16 14.5 14C14 12 14 10.5 14.5 9C15 7.5 15 6 14.5 4.5C14 3 13 2 12 2Z" />
            </svg>
            <span className="font-heading text-lg font-bold text-[var(--text-primary)] tracking-wide uppercase">
              Striking Showcase
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] font-mono text-center">
            The premier platform for collegiate bowling recruitment
          </p>
          <div
            className="w-16 h-px mt-2"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
          />
        </div>
      </footer>
    </div>
  );
}
