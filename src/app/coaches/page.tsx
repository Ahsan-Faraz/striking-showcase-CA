import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'For College Coaches — Striking Showcase',
  description:
    'Discover and recruit the best bowling athletes. Search by stats, watch highlight reels, contact prospects directly.',
  openGraph: {
    title: 'For College Coaches — Striking Showcase',
    description:
      'Discover and recruit the best bowling athletes. Search by stats, watch highlight reels, contact prospects directly.',
    url: 'https://strikingshowcase.com/coaches',
    siteName: 'Striking Showcase',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For College Coaches — Striking Showcase',
    description: 'Discover and recruit the best bowling athletes.',
  },
  alternates: {
    canonical: 'https://strikingshowcase.com/coaches',
  },
};

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

export default function CoachesLandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

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
        {/* Gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{ background: 'linear-gradient(90deg, transparent 5%, var(--gold) 50%, transparent 95%)' }} />

        <div className="relative z-[2] max-w-[900px] mx-auto text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 border border-gold/20 bg-gold/[0.08] animate-in">
            <svg className="w-3.5 h-3.5" viewBox="0 0 120 120" fill="var(--gold)"><polygon points="60,5 72,42 112,42 80,65 90,102 60,80 30,102 40,65 8,42 48,42" /></svg>
            <span className="text-[11px] font-mono text-gold tracking-[0.12em] uppercase">Built for College Bowling Programs</span>
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
            Find Your Next<br />Bowling Recruit.
          </h1>

          <p className="mt-8 text-base md:text-lg text-white/50 max-w-[680px] mx-auto leading-relaxed animate-in-delay-2">
            Search 500+ athlete profiles. Filter by average, rev rate, graduation year, state, and division.
            Contact prospects directly. No middleman.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-in-delay-2">
            <Link href="/coaches/signup" className="btn-primary text-base px-12 py-5 rounded-xl font-bold shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200 w-full sm:w-auto">
              Create Coach Account — Free
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base px-10 py-5 rounded-xl w-full sm:w-auto">
              See How It Works
            </Link>
          </div>

          <p className="mt-5 text-[13px] text-white/30 animate-in-delay-3">
            100% free for coaches. Verified .edu email required.
          </p>

          {/* Social proof */}
          <div className="inline-flex items-center gap-3 mt-6 animate-in-delay-3">
            <div className="flex -space-x-2">
              {[{ bg: 'var(--gold)', text: 'WS' }, { bg: 'var(--maroon-light, #8a1a52)', text: 'UL' }, { bg: '#4a7c59', text: 'VT' }].map((a) => (
                <div key={a.text} className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-bold" style={{ background: a.bg, color: '#0a0a0f' }}>
                  {a.text}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-white/40 font-mono">College programs already recruiting here</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-in-delay-3">
          <span className="text-[11px] font-mono text-white/25 tracking-widest uppercase">Scroll</span>
          <div className="w-4 h-4 border-r-[1.5px] border-b-[1.5px] border-white/20 rotate-45 animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: THE PROBLEM (Coach Perspective)
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, rgba(102,0,51,0.06), transparent)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <StarDivider />
            <p className="section-label">The Problem</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              Recruiting Bowling Athletes<br />
              <span className="text-gradient-gold">Shouldn&apos;t Be This Hard.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>, title: 'You can\'t see everyone at Junior Gold', desc: 'Thousands of athletes. One weekend. You can\'t watch every squad on every pair. The best bowler for your program might be on a lane you never walked past.' },
              { icon: <><path d="M15 10l5 5M20 10l-5 5" /><rect x="2" y="3" width="14" height="14" rx="2" /></>, title: 'Spreadsheets don\'t cut it anymore', desc: 'Tracking recruits in Excel, scattered emails, handwritten notes from tournaments — there has to be a better way.' },
              { icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, title: 'Finding the right fit takes time', desc: 'You need to know stats, video, academic info, and what division they\'re targeting — all before sending the first message.' },
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
            <p className="font-heading text-lg md:text-xl font-semibold text-gold mx-auto leading-snug">
              Striking Showcase puts every athlete&apos;s full recruiting profile in <em className="not-italic underline decoration-gold/40 underline-offset-4">one place</em>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: THE SOLUTION (Coach Portal Preview)
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <StarDivider />
              <p className="section-label">The Solution</p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Your Recruiting<br /><span className="text-gradient-gold">Command Center.</span>
              </h2>
              <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
                Search athletes by 11 filters. Track prospects on a Kanban board. Message athletes directly from their profile.
                Everything your program needs to recruit bowling talent — in one platform.
              </p>
            </div>

            {/* Mock Coach Portal Card */}
            <div className="rounded-2xl overflow-hidden border border-gold/30 relative" style={{ background: 'rgba(10,10,15,0.8)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <div className="absolute inset-[-1px] rounded-2xl opacity-40 pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--gold), transparent, var(--maroon), transparent, var(--gold))', zIndex: -1 }} />
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-maroon to-[#3d001f] flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                </div>
                <span className="font-heading text-sm font-semibold text-white">Athlete Search</span>
                <span className="ml-auto text-[10px] font-mono text-white/40">11 filters</span>
              </div>
              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-white/[0.08]">
                {['Class 2026', 'D1', 'Avg 200+', 'Rev 350+', 'Illinois'].map((f) => (
                  <span key={f} className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-gold/10 text-gold border border-gold/20">{f}</span>
                ))}
              </div>
              {/* Result rows */}
              <div className="px-6 py-2">
                {[
                  { name: 'Autumn Strode', avg: '218', rev: '310', yr: '2026', state: 'IL', status: 'Tracking' },
                  { name: 'Marcus Chen', avg: '224', rev: '380', yr: '2026', state: 'TX', status: 'Contacted' },
                  { name: 'Jordan Rivera', avg: '211', rev: '290', yr: '2027', state: 'OH', status: '' },
                ].map((a) => (
                  <div key={a.name} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-maroon/60 to-gold/20 flex items-center justify-center text-[10px] font-bold text-gold shrink-0">{a.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/80 font-medium truncate">{a.name}</p>
                      <p className="text-[9px] text-white/30 font-mono">{a.yr} · {a.state}</p>
                    </div>
                    <div className="flex gap-3 text-[10px] font-mono text-white/50">
                      <span>{a.avg} avg</span>
                      <span>{a.rev} rpm</span>
                    </div>
                    {a.status && (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${a.status === 'Tracking' ? 'bg-blue-500/15 text-blue-400' : 'bg-green-500/15 text-green-400'}`}>{a.status}</span>
                    )}
                  </div>
                ))}
              </div>
              {/* Board preview */}
              <div className="px-6 py-3 border-t border-white/[0.08]">
                <p className="text-[9px] font-mono text-white/25 uppercase tracking-wider mb-2">Recruiting Board</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Tracking', 'Contacted', 'Visited', 'Offered'].map((col, i) => (
                    <div key={col} className="text-center">
                      <div className="h-8 rounded bg-white/[0.04] border border-dashed border-white/10 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-white/30">{[3, 2, 1, 0][i]}</span>
                      </div>
                      <p className="text-[8px] text-white/20 mt-1">{col}</p>
                    </div>
                  ))}
                </div>
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
              Everything You Need to <span className="text-gradient-gold">Recruit Smarter</span>
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">Free for all verified coaches. Every tool your program needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Athlete Search Engine', desc: '11 filters: average, rev rate, grad year, state, division, GPA, handed, gender, video, last active, and more.' },
              { title: 'Recruiting Board (Kanban)', desc: 'Drag-and-drop pipeline: Tracking → Contacted → Visited → Offered → Committed. Shared with your entire staff.' },
              { title: 'Direct Messaging', desc: 'Contact athletes directly from their profile. Athletes and their family reply in-platform. No phone tag.' },
              { title: 'Ball Arsenal Details', desc: 'See every athlete\'s full ball arsenal — brand, coverstock, layout, and drilling specs. Know their game.' },
              { title: 'Highlight Video Reels', desc: 'Watch highlight videos and browse photo galleries right on the athlete profile. No YouTube hunting.' },
              { title: 'Tournament History', desc: 'Verified tournament results, placements, and competitive formats — all in one place.' },
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
              Three Steps to <span className="text-gradient-gold">Start Recruiting</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Dashed connector line (desktop) */}
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-[2px] opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--gold) 0, var(--gold) 8px, transparent 8px, transparent 16px)' }} />
            {[
              { num: '1', title: 'Sign Up Free', desc: 'Create your coach account with your .edu email. Free forever for coaches.', badge: 'FREE' },
              { num: '2', title: 'Get Verified', desc: 'Our team verifies your credentials in 24–48 hours to protect athletes.' },
              { num: '3', title: 'Start Recruiting', desc: 'Search athletes, build your board, and message prospects directly.' },
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
            <p className="section-label">From Coaches</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              Programs Are <span className="text-gradient-gold">Finding Talent Faster</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'I found three athletes in 20 minutes that I would have never seen at a tournament. Two are now on my recruiting board.', name: 'Coach Williams', meta: 'D1 Program — Wichita State', initials: 'CW' },
              { quote: 'The filter engine is exactly what we needed. I can search by rev rate AND division interest AND class year. Nothing else does this.', name: 'Coach Davis', meta: 'D2 Program — Lindenwood', initials: 'CD' },
              { quote: 'Being able to message athletes directly and have their parents in the loop automatically saves us so much time.', name: 'Coach Martinez', meta: 'NAIA Program — Pikeville', initials: 'CM' },
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
          {[
            { val: '500+', label: 'Searchable athlete profiles' },
            { val: '11', label: 'Search filters available' },
            { val: '6', label: 'Pipeline stages on board' },
            { val: 'Free', label: 'For verified coaches' },
          ].map((n) => (
            <div key={n.label} className="text-center">
              <p className="font-mono text-3xl md:text-4xl font-medium text-gold mb-2">{n.val}</p>
              <p className="text-sm text-[var(--text-secondary)] max-w-[180px] mx-auto">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8: VERIFICATION TRUST
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="section-label">Trust & Safety</p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Verified Coaches.<br /><span className="text-gradient-gold">Protected Athletes.</span>
              </h2>
              <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
                Every coach on Striking Showcase goes through a verification process.
                We require a .edu email and manually verify credentials before granting message access.
                Athletes and their families can trust that every message comes from a real college program.
              </p>
              <p className="mt-8 font-heading text-lg font-medium text-gold leading-snug">
                Verified in 24–48 hours. Protect your program&apos;s reputation.
              </p>
            </div>

            {/* Verification Process Card */}
            <div className="glass-card p-8 md:p-10 border-gold/30">
              <h3 className="font-heading text-xl font-semibold mb-7">Verification Process</h3>
              <div className="space-y-0">
                {[
                  ['Submit .edu email', 'Required'],
                  ['School & program details', 'Required'],
                  ['Team review & credential check', '24–48 hours'],
                  ['Verification badge granted', 'Automatic'],
                  ['Full messaging access enabled', 'Immediate'],
                ].map(([item, value]) => (
                  <div key={item} className="flex justify-between items-baseline py-3 border-b border-white/[0.04] last:border-b-0">
                    <span className="text-sm text-[var(--text-primary)]">{item}</span>
                    <span className="text-xs font-mono text-gold ml-4 shrink-0">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t-2 border-gold/30 text-center">
                <p className="font-heading text-sm">
                  Cost: <span className="text-gold font-semibold">$0</span>. Coaches use Striking Showcase <span className="text-gold font-semibold">completely free</span>.
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
            <div className="w-[280px] h-[340px] rounded-2xl mx-auto md:mx-0 overflow-hidden border border-gold/30 relative">
              <img src="/diandra.jpg" alt="Diandra Asbaty" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-heading text-2xl md:text-3xl font-bold">Diandra Asbaty</h3>
              <span className="text-sm font-mono text-gold tracking-wider block mt-2 mb-5">Founder, Striking Showcase</span>
              <p className="text-[var(--text-secondary)] leading-relaxed max-w-[580px]">
                2x Collegiate National Champion. World Champion. Hall of Famer.
                Diandra built Striking Showcase because she&apos;s been on both sides of the lane — as an athlete and alongside coaches — and knows great bowlers get overlooked every single year.
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
          SECTION 10: FAQ
          ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">FAQ</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              Coach <span className="text-gradient-gold">Questions</span>
            </h2>
          </div>
          <div>
            {[
              { q: 'Is it really free for coaches?', a: 'Yes. Striking Showcase is 100% free for verified college coaches. Athletes pay the subscription — coaches use the platform at no cost.' },
              { q: 'What do I need to get verified?', a: 'A valid .edu email address and your school/program details. Our team verifies credentials manually within 24–48 hours.' },
              { q: 'Can I share the recruiting board with my staff?', a: 'Yes. Head coaches can invite assistant and volunteer coaches to share the same recruiting board with real-time sync.' },
              { q: 'Can athletes see my recruiting board?', a: 'No. Your recruiting board is private to your coaching staff. Athletes can never see which stage they\'re in or your internal notes.' },
              { q: 'How do parents factor in?', a: 'Parents are automatically included in all message threads. Every message you send to an athlete is visible to their family. Full transparency.' },
              { q: 'What divisions are represented?', a: 'Athletes from all divisions: D1, D2, D3, NAIA, and NJCAA. You can filter by division interest to find the right fit for your program.' },
            ].map((faq) => (
              <details key={faq.q} className="group border-b border-[var(--border-primary)] last:border-b-0">
                <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
                  <span className="font-heading text-base font-semibold text-[var(--text-primary)] group-hover:text-gold transition-colors pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 text-[var(--text-tertiary)] shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <p className="pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 11: FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="relative py-28 md:py-36 px-4 overflow-hidden text-center">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #3A001A 50%, #660033 100%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(102,0,51,0.3), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px opacity-30" style={{ background: 'linear-gradient(90deg, transparent 5%, var(--gold) 50%, transparent 95%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-[1.05]">
            Your Next Recruit<br />
            <span className="text-gradient-gold">Is Already On The Platform</span>
          </h2>
          <p className="mt-6 text-lg text-white/50 max-w-[520px] mx-auto">
            Create your free coach account and start discovering bowling talent today.
          </p>
          <div className="mt-10">
            <Link href="/coaches/signup" className="btn-primary text-lg px-14 py-5 rounded-xl font-bold shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-200">
              Create Coach Account — Free
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/30 font-heading tracking-wider">
            Free forever for coaches. .edu email required.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 12: FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-[var(--border-primary)] py-16 px-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 items-start mb-12">
            <div>
              <img src="/logo-white.png" alt="Striking Showcase" className="h-10 w-auto" />
              <p className="text-sm text-[var(--text-tertiary)] mt-2">Show Off. Get Recruited.</p>
            </div>
            <div className="flex flex-wrap gap-4 md:flex-col md:gap-3">
              {[
                { label: 'About', href: '/about' },
                { label: 'For Athletes', href: '/' },
                { label: 'For Coaches', href: '/coaches' },
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
                { label: 'Contact', href: '#' },
                { label: 'Support', href: '#' },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-gold transition-colors">{l.label}</Link>
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
