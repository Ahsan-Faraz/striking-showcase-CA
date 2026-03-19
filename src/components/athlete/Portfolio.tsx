'use client';

import { Badge } from '@/components/ui/Badge';
import { BenchmarkBar } from '@/components/athlete/BenchmarkBar';
import { cn, getInitials, getD1Benchmark } from '@/lib/utils';
import { useState } from 'react';

interface PortfolioProps {
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    classYear: number;
    state?: string | null;
    school?: string | null;
    gender?: string | null;
    profilePhotoUrl?: string | null;
    bio?: string | null;
    dominantHand?: string | null;
    style?: string | null;
    seasonAverage?: number | null;
    highGame?: number | null;
    highSeries?: number | null;
    revRate?: number | null;
    ballSpeed?: number | null;
    spareConversion?: number | null;
    gpa?: number | null;
    act?: number | null;
    sat?: number | null;
    ncaaStatus?: string | null;
    intendedMajor?: string | null;
    usbcVerified?: boolean;
    isActivelyRecruiting?: boolean;
    coachName?: string | null;
    coachContact?: string | null;
    proShop?: string | null;
    bowlingCenter?: string | null;
    usbcClub?: string | null;
    tournaments?: Array<{
      id: string;
      name: string;
      place: number;
      average: number;
      date: string;
    }>;
    arsenal?: Array<{
      id: string;
      name: string;
      brand?: string | null;
      weight: number;
      coverstock?: string | null;
      pinToPap?: string | null;
      valAngle?: string | null;
      drillingAngle?: string | null;
      isPrimary: boolean;
    }>;
    media?: Array<{
      id: string;
      type: string;
      url: string;
      title?: string | null;
    }>;
  };
  isOwner?: boolean;
}

/* ── Helper: big stat display ── */
function HeroStat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={cn(
        'font-heading font-black text-5xl md:text-6xl tracking-tight leading-none',
        accent ? 'text-transparent bg-clip-text' : 'text-white'
      )}
      style={accent ? { backgroundImage: 'linear-gradient(135deg, var(--gold), var(--gold-light))' } : undefined}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2 font-mono">{label}</div>
    </div>
  );
}

/* ── Helper: place badge ── */
function PlaceBadge({ place }: { place: number }) {
  if (place === 1) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-heading font-black" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: '#3A1A00' }}>1st</span>;
  if (place === 2) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-heading font-bold bg-white/10 text-white/50">2nd</span>;
  if (place === 3) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-heading font-bold bg-amber-700/20 text-amber-500">3rd</span>;
  return <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-heading font-bold text-white/30">{place}</span>;
}

export function Portfolio({ athlete, isOwner = false }: PortfolioProps) {
  const [shareMsg, setShareMsg] = useState('');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${athlete.firstName} ${athlete.lastName} — Bowling Portfolio`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg('Copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* ═══════════════════════════════════════════
          SECTION 1: CINEMATIC HERO — full-bleed
          ═══════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{ minHeight: '520px' }}>
        {/* Layered background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, var(--accent-deep) 0%, color-mix(in srgb, var(--accent-deep) 50%, #1A1524) 35%, #1A1524 100%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 50% at 70% 30%, var(--accent-gold-glow) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />
        {/* Star watermark */}
        <div className="absolute top-8 right-12 opacity-[0.04]">
          <svg width="200" height="200" viewBox="0 0 120 120" fill="white"><polygon points="60,5 72,42 112,42 80,65 90,102 60,80 30,102 40,65 8,42 48,42"/></svg>
        </div>
        {/* Accent bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 5%, var(--gold) 50%, transparent 95%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-end md:items-stretch p-8 md:p-12 gap-8" style={{ minHeight: '520px' }}>
          {/* Left: Photo */}
          <div className="shrink-0 flex flex-col justify-end">
            <div className="w-44 h-56 md:w-52 md:h-64 rounded-2xl p-[2px] relative" style={{ background: 'linear-gradient(180deg, var(--gold) 0%, var(--accent-deep) 50%, var(--gold) 100%)' }}>
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#1A1524] flex items-center justify-center">
                {athlete.profilePhotoUrl ? (
                  <img src={athlete.profilePhotoUrl} alt={`${athlete.firstName} ${athlete.lastName}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-heading font-black text-white/20">{getInitials(athlete.firstName, athlete.lastName)}</span>
                )}
              </div>
              {athlete.isActivelyRecruiting && (
                <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500 text-white shadow-lg shadow-green-500/30">
                  Recruiting
                </div>
              )}
            </div>
          </div>

          {/* Right: Name + Stats */}
          <div className="flex-1 flex flex-col justify-end gap-6">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              {(athlete as any).usbcId && <Badge variant="outline">USBC #{(athlete as any).usbcId}</Badge>}
              {athlete.dominantHand && <Badge variant="outline">{athlete.dominantHand === 'LEFT' ? 'Left-Handed' : 'Right-Handed'}</Badge>}
              {athlete.style && <Badge variant="outline">{athlete.style === 'TWO_HANDED' ? 'Two-Handed' : 'One-Handed'}</Badge>}
            </div>

            {/* Name — massive */}
            <div>
              <h1 className="font-heading font-black text-6xl md:text-8xl text-white leading-[0.85] tracking-tight uppercase">
                {athlete.firstName}
                <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--gold), var(--gold-light))' }}>
                  {athlete.lastName}
                </span>
              </h1>
              <p className="mt-3 text-white/50 text-sm flex items-center gap-2 flex-wrap font-medium">
                <span style={{ color: 'var(--gold)' }} className="font-bold">Class of {athlete.classYear}</span>
                {athlete.school && <><span className="text-white/20">/</span><span>{athlete.school}</span></>}
                {athlete.state && <><span className="text-white/20">/</span><span>{athlete.state}</span></>}
              </p>
            </div>

            {/* Hero stat bar — the money numbers */}
            <div className="flex items-end gap-8 md:gap-12 pt-2 border-t border-white/10">
              {athlete.seasonAverage && <HeroStat value={athlete.seasonAverage} label="Average" accent />}
              {athlete.highGame && <HeroStat value={athlete.highGame} label="High Game" />}
              {athlete.highSeries && <HeroStat value={athlete.highSeries} label="High Series" />}
              {athlete.revRate && <HeroStat value={athlete.revRate} label="Rev Rate" />}
            </div>
          </div>

          {/* Top-right actions */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10 flex gap-3">
            <button onClick={handleShare} className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
              Share
              {shareMsg && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap" style={{ color: 'var(--gold)' }}>{shareMsg}</span>}
            </button>
            {!isOwner && (
              <a href={`/messages?to=${athlete.id}`} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: '#1C1420', boxShadow: '0 4px 20px var(--accent-gold-glow)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                Message
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: BENTO GRID — the content
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">

        {/* ── Bio (wide) ── */}
        {athlete.bio && (
          <div className="md:col-span-4 rounded-2xl p-6 md:p-8 border border-[var(--border-primary)] bg-[var(--bg-card)]">
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-3" style={{ color: 'var(--gold)' }}>About</p>
            <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">{athlete.bio}</p>
          </div>
        )}

        {/* ── Academics (narrow) ── */}
        <div className="md:col-span-2 rounded-2xl p-6 border border-[var(--border-primary)] bg-[var(--bg-card)]">
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-4" style={{ color: 'var(--gold)' }}>Academics</p>
          <div className="space-y-4">
            {athlete.gpa && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">GPA</span>
                <span className="font-heading font-black text-3xl" style={{ color: 'var(--gold)' }}>{athlete.gpa.toFixed(1)}</span>
              </div>
            )}
            {athlete.act && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">ACT</span>
                <span className="font-heading font-bold text-2xl text-[var(--text-primary)]">{athlete.act}</span>
              </div>
            )}
            {athlete.sat && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">SAT</span>
                <span className="font-heading font-bold text-2xl text-[var(--text-primary)]">{athlete.sat}</span>
              </div>
            )}
            {athlete.ncaaStatus && (
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border-secondary)]">
                <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">NCAA</span>
                <Badge variant={athlete.ncaaStatus === 'Eligible' ? 'verified' : 'outline'}>{athlete.ncaaStatus}</Badge>
              </div>
            )}
            {athlete.intendedMajor && (
              <div className="pt-2 border-t border-[var(--border-secondary)]">
                <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">Major</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{athlete.intendedMajor}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tournaments (4 cols) ── */}
        {athlete.tournaments && athlete.tournaments.length > 0 && (
          <div className="md:col-span-4 rounded-2xl p-6 md:p-8 border border-[var(--border-primary)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] uppercase tracking-[0.3em] font-mono" style={{ color: 'var(--gold)' }}>Tournament Results</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] font-mono">{athlete.tournaments.length} Events</p>
            </div>
            <div className="space-y-2">
              {athlete.tournaments.map((t) => (
                <div key={t.id} className={cn(
                  'flex items-center gap-4 py-3 px-4 rounded-xl transition-colors',
                  t.place <= 3 ? 'border' : 'hover:bg-[var(--bg-card-hover)]'
                )}
                style={t.place <= 3 ? { backgroundColor: 'color-mix(in srgb, var(--gold) 4%, transparent)', borderColor: 'color-mix(in srgb, var(--gold) 10%, transparent)' } : undefined}
                >
                  <PlaceBadge place={t.place} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{t.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{t.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-heading font-bold" style={{ color: 'var(--gold)' }}>{t.average.toFixed(0)}</p>
                    <p className="text-[9px] text-[var(--text-tertiary)] font-mono uppercase">avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Arsenal (2 cols) ── */}
        {athlete.arsenal && athlete.arsenal.length > 0 && (
          <div className="md:col-span-2 rounded-2xl p-6 border border-[var(--border-primary)] bg-[var(--bg-card)]">
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-4" style={{ color: 'var(--gold)' }}>Ball Arsenal</p>
            <div className="space-y-3">
              {athlete.arsenal.map((ball) => (
                <div key={ball.id} className={cn(
                  'p-3 rounded-xl border transition-colors',
                  ball.isPrimary ? '' : 'border-transparent bg-[var(--bg-tertiary)]/50'
                )}
                style={ball.isPrimary ? { borderColor: 'color-mix(in srgb, var(--gold) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--gold) 4%, transparent)' } : undefined}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{ball.name}</span>
                    {ball.isPrimary && <span className="text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded" style={{ color: 'var(--gold)', backgroundColor: 'color-mix(in srgb, var(--gold) 10%, transparent)' }}>Primary</span>}
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {ball.brand && `${ball.brand} · `}{ball.weight}lb{ball.coverstock && ` · ${ball.coverstock}`}
                  </p>
                  {(ball.pinToPap || ball.valAngle || ball.drillingAngle) && (
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1">
                      {[ball.pinToPap && `Pin ${ball.pinToPap}`, ball.valAngle && `VAL ${ball.valAngle}`, ball.drillingAngle && `Drill ${ball.drillingAngle}`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Media (full width) ── */}
        {athlete.media && athlete.media.length > 0 && (
          <div className="md:col-span-6 rounded-2xl p-6 md:p-8 border border-[var(--border-primary)] bg-[var(--bg-card)]">
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-5" style={{ color: 'var(--gold)' }}>Media</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {athlete.media.map((m) => (
                <div key={m.id} className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-tertiary)] relative group cursor-pointer border border-[var(--border-secondary)] transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ '--tw-border-opacity': 1 } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--gold) 30%, transparent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
                >
                  {m.type === 'video' ? (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-deep) 20%, transparent), rgba(26,21,36,0.8))' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                      </div>
                    </div>
                  ) : (
                    <img src={m.url} alt={m.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  {m.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[11px] text-white/80 truncate font-medium">{m.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contact (3 cols) ── */}
        <div className="md:col-span-3 rounded-2xl p-6 border border-[var(--border-primary)] bg-[var(--bg-card)]">
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-4" style={{ color: 'var(--gold)' }}>Contact & Coaching</p>
          <div className="grid grid-cols-2 gap-3">
            {athlete.coachName && (
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                <p className="text-[9px] uppercase tracking-[0.2em] font-mono mb-1" style={{ color: 'var(--gold)' }}>Coach</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{athlete.coachName}</p>
                {athlete.coachContact && <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">{athlete.coachContact}</p>}
              </div>
            )}
            {athlete.proShop && (
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                <p className="text-[9px] uppercase tracking-[0.2em] font-mono mb-1" style={{ color: 'var(--gold)' }}>Pro Shop</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{athlete.proShop}</p>
              </div>
            )}
            {athlete.bowlingCenter && (
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                <p className="text-[9px] uppercase tracking-[0.2em] font-mono mb-1" style={{ color: 'var(--gold)' }}>Home Center</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{athlete.bowlingCenter}</p>
              </div>
            )}
            {athlete.usbcClub && (
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                <p className="text-[9px] uppercase tracking-[0.2em] font-mono mb-1" style={{ color: 'var(--gold)' }}>USBC League</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{athlete.usbcClub}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Additional stats (3 cols) ── */}
        <div className="md:col-span-3 rounded-2xl p-6 border border-[var(--border-primary)] bg-[var(--bg-card)]">
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-4" style={{ color: 'var(--gold)' }}>Additional Stats</p>
          <div className="grid grid-cols-3 gap-4">
            {athlete.ballSpeed && (
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-[var(--text-primary)]">{athlete.ballSpeed}</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mt-1">MPH</div>
              </div>
            )}
            {athlete.spareConversion && (
              <div className="text-center">
                <div className="font-heading font-bold text-2xl" style={{ color: 'var(--gold)' }}>{athlete.spareConversion}%</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mt-1">Spare %</div>
              </div>
            )}
            {athlete.dominantHand && (
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-[var(--text-primary)]">{athlete.dominantHand === 'LEFT' ? 'LH' : 'RH'}</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mt-1">Hand</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <div className="text-center pt-10 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 20%, transparent))' }} />
          <svg width="12" height="12" viewBox="0 0 120 120" fill="currentColor" style={{ color: 'var(--gold)' }} className="opacity-20"><polygon points="60,5 72,42 112,42 80,65 90,102 60,80 30,102 40,65 8,42 48,42"/></svg>
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--gold) 20%, transparent), transparent)' }} />
        </div>
        <img src="/logo-white.png" alt="Striking Showcase" className="h-5 w-auto mx-auto opacity-30" />
      </div>
    </div>
  );
}
