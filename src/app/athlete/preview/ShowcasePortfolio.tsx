'use client';

import './preview.css';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   DEFAULT / FALLBACK DATA
   ═══════════════════════════════════════════════════════════ */
const defaultAthlete = {
  firstName: 'Autumn',
  lastName: 'Strode',
  classYear: 2026,
  state: 'Illinois',
  school: 'Normal Community HS',
  hand: 'Right-Handed',
  style: 'One-Handed',
  bio: "Three-time Junior Gold qualifier and 2025 Illinois State Champion. I've been bowling competitively since age 8 and I'm looking for a D1 program where I can compete at the highest level while pursuing a degree in Sports Management. My game has improved significantly this season thanks to my coach and the competitive tournament circuit.",
  stats: {
    seasonAvg: 218,
    seasonTrend: +4.2,
    highGame: 278,
    highSeries: 724,
    revRate: 310,
    ballSpeed: 17,
    sparePct: 82,
  },
  academics: { gpa: 3.8, act: 28, sat: 1320, ncaa: 'Eligible', major: 'Sports Management' },
  tournaments: [
    { name: 'Holiday Classic', place: 1, avg: 224, date: 'Dec 2025', format: 'Baker' },
    { name: 'Arlington Classic', place: 2, avg: 218, date: 'Nov 2025', format: 'Singles' },
    { name: 'Midwest Challenge', place: 3, avg: 215, date: 'Oct 2025', format: 'Team' },
    { name: 'Illinois State Championship', place: 1, avg: 232, date: 'Sep 2025', format: 'Singles' },
    { name: 'Junior Gold Qualifier', place: 5, avg: 210, date: 'Aug 2025', format: 'Qualifying' },
  ],
  arsenal: [
    { name: 'Hyper Cell Fused', brand: 'Storm', weight: 15, cover: 'Solid', primary: true },
    { name: 'IQ Tour', brand: 'Storm', weight: 15, cover: 'Pearl', primary: false },
    { name: 'Tropical Surge', brand: 'Storm', weight: 15, cover: 'Pearl', primary: false },
    { name: 'Hustle Ink', brand: 'Roto Grip', weight: 14, cover: 'Solid', primary: false },
  ],
  coach: { name: 'Mike Thompson', email: 'mike.t@normalcommunity.edu', phone: '(309) 555-0147' },
  proShop: { name: 'Strike Zone Pro Shop', contact: 'Dave Reynolds', phone: '(309) 555-0234' },
  center: { name: 'Parkside Lanes', city: 'Normal, IL', league: 'Wednesday Night Mixed' },
  divisions: [
    { name: 'D1', active: true },
    { name: 'D2', active: true },
    { name: 'NAIA', active: false },
    { name: 'NJCAA', active: false },
  ],
  regions: [
    { name: 'Midwest', active: true },
    { name: 'Southeast', active: true },
    { name: 'Northeast', active: false },
    { name: 'West', active: false },
  ],
  benchmarks: [
    { label: 'Season Average', value: 218, d1: 200, max: 300 },
    { label: 'High Game', value: 278, d1: 250, max: 300 },
    { label: 'High Series', value: 724, d1: 650, max: 900 },
    { label: 'Spare %', value: 82, d1: 75, max: 100 },
  ],
  videos: [
    { title: 'Holiday Classic Finals', date: 'Dec 2025', views: '1.2K', url: '', embedUrl: null, thumbnail: null },
    { title: 'Practice Session — Dec 2025', date: 'Dec 2025', views: '845', url: '', embedUrl: null, thumbnail: null },
    { title: 'Illinois State Championship', date: 'Sep 2025', views: '2.1K', url: '', embedUrl: null, thumbnail: null },
    { title: 'Arlington Classic Highlights', date: 'Nov 2025', views: '678', url: '', embedUrl: null, thumbnail: null },
  ],
  photos: [] as Array<{ url: string; title?: string | null }>,
  articles: [
    { title: 'Local Bowler Autumn Strode Dominates State Championship', description: 'Normal Community High School junior Autumn Strode rolled a stunning 232 average to claim the Illinois State Championship title, her second major victory this season.', siteName: 'BowlingDigital.com', image: null, url: '#' },
    { title: 'Top 25 Junior Bowlers to Watch in 2026', description: 'Our annual ranking of the most promising junior bowlers heading into the college recruitment season. Autumn Strode ranks #12 nationally.', siteName: 'CollegeBowling.net', image: null, url: '#' },
    { title: 'Junior Gold Qualifiers Announced for 2026 Season', description: 'The United States Bowling Congress has released the list of qualifiers for the upcoming Junior Gold Championships.', siteName: 'USBC.com', image: null, url: '#' },
  ],
  usbcId: null as string | null,
  profilePhotoUrl: null as string | null,
  isActivelyRecruiting: true,
};

/* ═══════════════════════════════════════════════════════════
   THEME COLORS
   ═══════════════════════════════════════════════════════════ */
type Theme = 'dark' | 'light';
type ColorScheme = 'MAROON' | 'NAVY' | 'EMERALD' | 'CRIMSON' | 'ROYAL' | 'SLATE';

const colorSchemeValues: Record<ColorScheme, { deep: string; bright: string; gold: string; goldLight: string; goldOnLight: string; r: number; g: number; b: number }> = {
  MAROON:  { deep: '#660033', bright: '#880044', gold: '#C9A84C', goldLight: '#E0C878', goldOnLight: '#8B6B1F', r: 102, g: 0, b: 51 },
  NAVY:    { deep: '#1E3A5F', bright: '#2D5A8E', gold: '#2D5A8E', goldLight: '#5B8CC5', goldOnLight: '#1E3A5F', r: 30, g: 58, b: 95 },
  EMERALD: { deep: '#065F46', bright: '#059669', gold: '#059669', goldLight: '#34D399', goldOnLight: '#065F46', r: 6, g: 95, b: 70 },
  CRIMSON: { deep: '#991B1B', bright: '#DC2626', gold: '#DC2626', goldLight: '#F87171', goldOnLight: '#991B1B', r: 153, g: 27, b: 27 },
  ROYAL:   { deep: '#4C1D95', bright: '#7C3AED', gold: '#7C3AED', goldLight: '#A78BFA', goldOnLight: '#4C1D95', r: 76, g: 29, b: 149 },
  SLATE:   { deep: '#334155', bright: '#475569', gold: '#475569', goldLight: '#94A3B8', goldOnLight: '#334155', r: 51, g: 65, b: 85 },
};

function getColors(theme: Theme, scheme: ColorScheme = 'MAROON') {
  const s = colorSchemeValues[scheme];
  const rgba = (a: number) => `rgba(${s.r},${s.g},${s.b},${a})`;

  if (theme === 'light') {
    return {
      bg: '#FAF7F3',
      surface: '#FFFFFF',
      surfaceLight: '#F3EFE9',
      surfaceLighter: '#EAE5DD',
      maroon: s.deep,
      maroonBright: s.bright,
      gold: s.goldOnLight,
      goldLight: s.goldOnLight,
      green: '#16874A',
      blue: '#2563EB',
      text: '#1A0E1E',
      textMuted: '#4A3E52',
      textDim: '#7A7084',
      border: rgba(0.10),
      borderLight: rgba(0.06),
      card: '#FFFFFF',
      cardHover: '#FEFCF9',
      overlay: 'rgba(250,247,243,0.94)',
      heroGrad1: rgba(0.06),
      heroGrad2: rgba(0.12),
      cardShadow: `0 1px 3px ${rgba(0.04)}, 0 6px 24px ${rgba(0.06)}`,
      cardShadowHover: `0 4px 12px ${rgba(0.06)}, 0 12px 40px ${rgba(0.08)}`,
      statStripBg: `linear-gradient(135deg, ${s.deep} 0%, ${s.bright} 100%)`,
      heroBg: 'linear-gradient(160deg, #F3EDE8 0%, #E8DDD4 30%, #FAF7F3 100%)',
      heroNameColor: s.deep,
      heroNameStroke: s.gold,
      accentGlow: `0 2px 20px ${rgba(0.12)}`,
      goldOnLight: s.goldOnLight,
      benchFill: `linear-gradient(90deg, ${s.deep}, ${s.goldOnLight})`,
    };
  }
  return {
    bg: '#1A1524',
    surface: '#211B2E',
    surfaceLight: '#2A2338',
    surfaceLighter: '#322A42',
    maroon: s.deep,
    maroonBright: s.bright,
    gold: s.gold,
    goldLight: s.goldLight,
    green: '#22C55E',
    blue: '#3B82F6',
    text: '#E8E6ED',
    textMuted: '#9A97A6',
    textDim: '#6B687A',
    border: 'rgba(255,255,255,0.10)',
    borderLight: 'rgba(255,255,255,0.06)',
    card: 'rgba(255,255,255,0.06)',
    cardHover: 'rgba(255,255,255,0.10)',
    overlay: 'rgba(26,21,36,0.85)',
    heroGrad1: rgba(0.25),
    heroGrad2: rgba(0.35),
    cardShadow: '0 4px 24px rgba(0,0,0,0.3)',
    cardShadowHover: '0 8px 40px rgba(0,0,0,0.4)',
    statStripBg: 'rgba(255,255,255,0.04)',
    heroBg: `linear-gradient(160deg, ${s.deep} 0%, ${s.bright} 35%, #1A1524 100%)`,
    heroNameColor: '#E8E6ED',
    heroNameStroke: s.gold,
    accentGlow: `0 0 20px ${rgba(0.5)}`,
    goldOnLight: s.gold,
    benchFill: `linear-gradient(90deg, ${s.deep}, ${s.gold})`,
  };
}

/* ═══════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, rootMargin: '50px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCounter(target: number, visible: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);
  return val;
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = '', isGold = false, C, goldRgba, style = {} }: {
  value: number; suffix?: string; isGold?: boolean; C: ReturnType<typeof getColors>; goldRgba?: (a: number) => string; style?: React.CSSProperties;
}) {
  const { ref, visible } = useReveal(0);
  const count = useCounter(value, visible);
  return (
    <div ref={ref} style={{
      color: isGold ? C.goldOnLight : C.text,
      textShadow: isGold ? `0 0 20px ${goldRgba ? goldRgba(0.5) : 'rgba(201,168,76,0.5)'}` : 'none',
      display: 'inline-block',
      ...style,
    }}>
      {count}{suffix}
    </div>
  );
}

function SectionHeader({ number, title, C }: { number: string; title: string; C: ReturnType<typeof getColors> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
      <span style={{
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: 14,
        color: C.goldOnLight,
        letterSpacing: '0.08em',
        flexShrink: 0,
      }}>{number}</span>
      <span style={{
        fontFamily: 'var(--font-exo2), sans-serif',
        fontSize: 'clamp(20px, 3vw, 28px)',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: C.text,
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>{title}</span>
      <div style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(90deg, ${C.border}, transparent)`,
      }} />
    </div>
  );
}

function BenchmarkBar({ label, value, d1, max, C, theme, sRgba, goldRgba }: {
  label: string; value: number; d1: number; max: number; C: ReturnType<typeof getColors>; theme?: Theme; sRgba?: (a: number) => string; goldRgba?: (a: number) => string;
}) {
  const { ref, visible } = useReveal();
  const pct = (value / max) * 100;
  const d1pct = (d1 / max) * 100;
  const isLight = theme === 'light';
  return (
    <div ref={ref} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 12,
          color: C.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-exo2), sans-serif',
          fontSize: 16,
          fontWeight: 700,
          color: C.goldOnLight,
        }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: isLight ? '#EAE5DD' : C.card, borderRadius: 3 }}>
        <div style={{
          position: 'absolute',
          left: `${d1pct}%`,
          top: -18,
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 9,
          color: C.textDim,
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>D1: {d1}</div>
        <div style={{
          position: 'absolute',
          left: `${d1pct}%`,
          top: -4,
          width: 1,
          height: 14,
          background: isLight ? (sRgba ? sRgba(0.2) : 'rgba(102,0,51,0.2)') : 'rgba(255,255,255,0.2)',
        }} />
        <div style={{
          width: visible ? `${pct}%` : '0%',
          height: '100%',
          borderRadius: 3,
          background: C.benchFill,
          transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            right: -4,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: C.goldOnLight,
            boxShadow: `0 0 12px ${C.goldOnLight}, 0 0 24px ${goldRgba ? goldRgba(0.4) : 'rgba(201,168,76,0.4)'}`,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 1s',
          }} />
        </div>
      </div>
    </div>
  );
}

function GoldSeparator() {
  return <div className="gold-section-separator" />;
}

function SpotlightRing({ b, circumference, dashoffset, C, theme, delay }: {
  b: { label: string; value: number; d1: number }; circumference: number; dashoffset: number;
  C: ReturnType<typeof getColors>; theme: Theme; delay: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke={theme === 'light' ? '#EAE5DD' : C.border} strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={C.goldOnLight} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={visible ? dashoffset : circumference}
            strokeLinecap="round" style={{
              transition: `stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
            }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 22, color: C.text,
        }}>
          <AnimatedNumber value={b.value} C={C} style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 22 }} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8 }}>{b.label}</div>
      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, color: C.textDim }}>D1: {b.d1}</div>
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

type LayoutType = 'classic' | 'modern' | 'minimal' | 'bold' | 'media-first';

type SourceMode = 'me' | 'provided';

interface ShowcasePortfolioProps {
  sourceMode?: SourceMode;
  initialAthleteRaw?: Record<string, any> | null;
  hideMessagingCta?: boolean;
  showControls?: boolean;
  trackScrollSticky?: boolean;
}

function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt?.[1]) {
    return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1`;
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm?.[1]) {
    return `https://player.vimeo.com/video/${vm[1]}?title=0&byline=0&portrait=0`;
  }
  return /^https?:\/\//i.test(url) ? url : null;
}

function resolvePreviewLayout(layoutLike: string | null | undefined): LayoutType {
  const normalized = String(layoutLike || 'classic').toLowerCase().replace(/_/g, '-');
  if (normalized === 'spotlight') return 'modern';
  if (normalized === 'editorial') return 'minimal';
  if (normalized === 'classic' || normalized === 'modern' || normalized === 'minimal' || normalized === 'bold' || normalized === 'media-first') {
    return normalized;
  }
  return 'classic';
}

function resolvePreviewColorScheme(value: string | null | undefined): ColorScheme {
  const normalized = String(value || 'MAROON').toUpperCase();
  return (Object.keys(colorSchemeValues) as ColorScheme[]).includes(normalized as ColorScheme)
    ? (normalized as ColorScheme)
    : 'MAROON';
}

function toTitleLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeDivision(value: string): string {
  const token = value.replace(/\s+/g, '').toUpperCase();
  if (token === 'JUCO') return 'NJCAA';
  return token;
}

function resolveFontCss(fontFamilyLike: string | null | undefined): { heading: string; body: string; mono: string } {
  const normalized = String(fontFamilyLike || 'default').toLowerCase();
  if (normalized === 'athletic') {
    return {
      heading: '"Bebas Neue", "Oswald", "Arial Narrow", sans-serif',
      body: '"Inter", "Segoe UI", sans-serif',
      mono: '"Roboto Mono", "Consolas", monospace',
    };
  }
  if (normalized === 'classic') {
    return {
      heading: '"Georgia", "Times New Roman", serif',
      body: '"Georgia", "Times New Roman", serif',
      mono: '"Courier New", "Liberation Mono", monospace',
    };
  }
  if (normalized === 'modern') {
    return {
      heading: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
      body: '"DM Sans", "Inter", "Segoe UI", sans-serif',
      mono: '"Space Mono", "Roboto Mono", monospace',
    };
  }
  return {
    heading: '"Exo 2", "Inter", "Segoe UI", sans-serif',
    body: '"Nunito Sans", "Inter", "Segoe UI", sans-serif',
    mono: '"DM Mono", "Roboto Mono", "Consolas", monospace',
  };
}

function resolveThemeSettingsFromApi(athleteRaw: Record<string, any>) {
  let themeJson: Record<string, any> = {};
  if (athleteRaw.themeJson && typeof athleteRaw.themeJson === 'string') {
    try {
      themeJson = JSON.parse(athleteRaw.themeJson);
    } catch {
      themeJson = {};
    }
  } else if (athleteRaw.themeJson && typeof athleteRaw.themeJson === 'object') {
    themeJson = athleteRaw.themeJson;
  }

  const resolvedScheme = resolvePreviewColorScheme(themeJson.colorScheme || athleteRaw.colorScheme);
  const resolvedLayout = resolvePreviewLayout(themeJson.layout || athleteRaw.portfolioLayout);
  const resolvedFontFamily = String(themeJson.fontFamily || 'default').toLowerCase();
  const resolvedHeaderStyle = String(themeJson.headerStyle || 'solid').toLowerCase();
  const resolvedPrimaryColor = typeof themeJson.primaryColor === 'string' && themeJson.primaryColor ? themeJson.primaryColor : colorSchemeValues[resolvedScheme].deep;
  const resolvedAccentColor = typeof themeJson.accentColor === 'string' && themeJson.accentColor ? themeJson.accentColor : colorSchemeValues[resolvedScheme].gold;

  return {
    colorScheme: resolvedScheme,
    layout: resolvedLayout,
    fontFamily: resolvedFontFamily,
    headerStyle: resolvedHeaderStyle,
    primaryColor: resolvedPrimaryColor,
    accentColor: resolvedAccentColor,
  };
}

function resolveHeroBackground(
  theme: Theme,
  C: ReturnType<typeof getColors>,
  s: { deep: string },
  sRgba: (alpha: number) => string,
  headerStyle: string,
  primaryColor: string,
  accentColor: string,
  profilePhotoUrl: string | null,
): string {
  if (headerStyle === 'gradient') {
    return `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`;
  }
  if (headerStyle === 'photo-banner' && profilePhotoUrl) {
    return `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%), url(${profilePhotoUrl}) center / cover no-repeat`;
  }
  return theme === 'light' ? C.heroBg : `linear-gradient(160deg, ${s.deep} 0%, ${sRgba(0.85)} 30%, #1A1524 70%, #0a0a0f 100%)`;
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
function mapApiToPreview(a: Record<string, any>): typeof defaultAthlete {
  const selectedDivisions = new Set(
    Array.isArray(a.preferredDivisions)
      ? a.preferredDivisions.map((d: string) => normalizeDivision(String(d)))
      : [],
  );
  const divisionOptions = ['D1', 'D2', 'D3', 'NAIA', 'NJCAA'];

  const selectedRegions = Array.isArray(a.preferredRegions)
    ? a.preferredRegions.map((r: string) => String(r))
    : [];

  return {
    firstName: a.firstName || '',
    lastName: a.lastName || '',
    classYear: a.classYear || 2026,
    state: a.state || '',
    school: a.school || '',
    hand: a.dominantHand === 'LEFT' ? 'Left-Handed' : 'Right-Handed',
    style: a.style === 'TWO_HANDED' ? 'Two-Handed' : 'One-Handed',
    bio: a.bio || '',
    stats: {
      seasonAvg: a.seasonAverage || 0,
      seasonTrend: 0,
      highGame: a.highGame || 0,
      highSeries: a.highSeries || 0,
      revRate: a.revRate || 0,
      ballSpeed: a.ballSpeed || 0,
      sparePct: a.spareConversion || 0,
    },
    academics: {
      gpa: a.gpa ?? 0,
      act: a.act ?? 0,
      sat: a.sat ?? 0,
      ncaa: a.ncaaStatus || 'Pending',
      major: a.intendedMajor || 'Undeclared',
    },
    tournaments: (a.tournaments || []).map((t: any) => ({
      name: t.name,
      place: t.place,
      avg: t.average,
      date: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
      format: 'Singles',
    })),
    arsenal: (a.arsenal || []).map((b: any) => ({
      name: b.name,
      brand: b.brand || '',
      weight: b.weight,
      cover: b.coverstock || '',
      primary: b.isPrimary,
    })),
    coach: { name: a.coachName || '', email: a.coachContact || '', phone: '' },
    proShop: { name: a.proShop || '', contact: '', phone: '' },
    center: { name: a.bowlingCenter || '', city: a.state || '', league: a.usbcClub || '' },
    divisions: selectedDivisions.size
      ? divisionOptions.map((division) => ({
          name: division,
          active: selectedDivisions.has(division),
        }))
      : defaultAthlete.divisions,
    regions: selectedRegions.length
      ? selectedRegions.map((region) => ({ name: toTitleLabel(region), active: true }))
      : defaultAthlete.regions,
    benchmarks: [
      { label: 'Season Average', value: a.seasonAverage || 0, d1: 200, max: 300 },
      { label: 'High Game', value: a.highGame || 0, d1: 250, max: 300 },
      { label: 'High Series', value: a.highSeries || 0, d1: 650, max: 900 },
      { label: 'Spare %', value: a.spareConversion || 0, d1: 75, max: 100 },
    ],
    videos: (a.media || []).filter((m: any) => m.type === 'video').map((m: any) => ({
      title: m.title || 'Video',
      date: '',
      views: '',
      url: m.url || '',
      embedUrl: toEmbedUrl(m.url),
      thumbnail: m.thumbnailUrl || null,
    })),
    photos: (a.media || [])
      .filter((m: any) => m.type === 'image' || m.type === 'photo')
      .map((m: any) => ({ url: m.url, title: m.title || null })),
    articles: (a.articles || []).map((art: any) => ({
      title: art.title || '',
      description: art.description || '',
      siteName: art.siteName || '',
      image: art.image || null,
      url: art.url || '#',
    })),
    usbcId: a.usbcId || null,
    profilePhotoUrl: a.profilePhotoUrl || null,
    isActivelyRecruiting: a.isActivelyRecruiting ?? true,
  };
}

export function ShowcasePortfolio({
  sourceMode = 'me',
  initialAthleteRaw = null,
  hideMessagingCta = true,
  showControls = true,
  trackScrollSticky = true,
}: ShowcasePortfolioProps) {
  const [layout, setLayout] = useState<LayoutType>('classic');
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('MAROON');
  const [themeSettings, setThemeSettings] = useState({
    fontFamily: 'default',
    headerStyle: 'solid',
    primaryColor: colorSchemeValues.MAROON.deep,
    accentColor: colorSchemeValues.MAROON.gold,
  });
  const [athlete, setAthlete] = useState<typeof defaultAthlete | null>(
    initialAthleteRaw ? mapApiToPreview(initialAthleteRaw) : null,
  );
  const [loading, setLoading] = useState(sourceMode === 'me' && !initialAthleteRaw);
  const [showSticky, setShowSticky] = useState(false);
  const [mediaTab, setMediaTab] = useState<'videos' | 'photos'>('videos');
  const heroRef = useRef<HTMLDivElement>(null);

  const C = getColors(theme, colorScheme);
  const s = colorSchemeValues[colorScheme];
  const sRgba = (a: number) => `rgba(${s.r},${s.g},${s.b},${a})`;
  // Parse gold hex to rgb for rgba() usage
  const gHex = theme === 'light' ? s.goldOnLight : s.gold;
  const gR = parseInt(gHex.slice(1, 3), 16);
  const gG = parseInt(gHex.slice(3, 5), 16);
  const gB = parseInt(gHex.slice(5, 7), 16);
  const goldRgba = (a: number) => `rgba(${gR},${gG},${gB},${a})`;
  const fontCss = resolveFontCss(themeSettings.fontFamily);
  const heroBackground = resolveHeroBackground(
    theme,
    C,
    s,
    sRgba,
    themeSettings.headerStyle,
    themeSettings.primaryColor,
    themeSettings.accentColor,
    athlete?.profilePhotoUrl ?? null,
  );

  useEffect(() => {
    if (initialAthleteRaw) {
      const resolved = resolveThemeSettingsFromApi(initialAthleteRaw);
      setColorScheme(resolved.colorScheme);
      setLayout(resolved.layout);
      setThemeSettings({
        fontFamily: resolved.fontFamily,
        headerStyle: resolved.headerStyle,
        primaryColor: resolved.primaryColor,
        accentColor: resolved.accentColor,
      });
    }
  }, [initialAthleteRaw]);

  // Fetch real athlete data and settings from API
  useEffect(() => {
    if (sourceMode !== 'me') return;
    fetch('/api/athletes/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.athlete) {
          try {
            const mapped = mapApiToPreview(data.athlete);
            setAthlete(mapped);
          } catch (e) {
            console.error('Failed to map athlete data:', e);
            setAthlete(defaultAthlete);
          }
          const resolved = resolveThemeSettingsFromApi(data.athlete);
          setColorScheme(resolved.colorScheme);
          setLayout(resolved.layout);
          setThemeSettings({
            fontFamily: resolved.fontFamily,
            headerStyle: resolved.headerStyle,
            primaryColor: resolved.primaryColor,
            accentColor: resolved.accentColor,
          });
        } else {
          setAthlete(defaultAthlete);
        }
      })
      .catch((e) => {
        console.error('Failed to fetch athlete:', e);
        setAthlete(defaultAthlete);
      })
      .finally(() => setLoading(false));
  }, [sourceMode]);

  useEffect(() => {
    if (!trackScrollSticky) return;
    const onScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [trackScrollSticky]);

  // Reset scroll on layout change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [layout]);

  const placeChip = useCallback((place: number) => {
    const s = colorSchemeValues[colorScheme];
    const goldColor = theme === 'light' ? s.goldOnLight : s.gold;
    const colors: Record<number, { bg: string; text: string }> = {
      1: { bg: theme === 'light' ? `rgba(${s.r},${s.g},${s.b},0.12)` : `rgba(${s.r},${s.g},${s.b},0.2)`, text: goldColor },
      2: { bg: theme === 'light' ? 'rgba(120,120,120,0.12)' : 'rgba(192,192,192,0.2)', text: theme === 'light' ? '#808080' : '#C0C0C0' },
      3: { bg: theme === 'light' ? 'rgba(180,100,30,0.12)' : 'rgba(205,127,50,0.2)', text: theme === 'light' ? '#A0652A' : '#CD7F32' },
    };
    const c = colors[place] || { bg: C.card, text: C.textMuted };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: c.bg,
        fontFamily: 'var(--font-exo2), sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: c.text,
      }}>
        {place}
      </span>
    );
  }, [C.card, C.textMuted, theme, colorScheme]);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.4s ease, color 0.4s ease',
      '--preview-gold': C.gold,
      '--preview-gold-0': goldRgba(0),
      '--preview-gold-30': goldRgba(0.3),
      '--preview-gold-50': goldRgba(0.5),
      '--preview-scheme-deep': s.deep,
      '--preview-scheme-40': sRgba(0.4),
      '--preview-scheme-60': sRgba(0.6),
      '--font-exo2': fontCss.heading,
      '--font-nunito-sans': fontCss.body,
      '--font-dm-mono': fontCss.mono,
    } as React.CSSProperties}>

      {/* ═══════════════════════════════════════════
           CONTROL BAR (FIXED)
         ═══════════════════════════════════════════ */}
      {showControls && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        background: theme === 'dark' ? 'rgba(10,8,16,0.92)' : 'rgba(253,251,248,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        fontFamily: 'var(--font-exo2), sans-serif',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}>
        {/* Brand */}
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: C.maroon,
          whiteSpace: 'nowrap',
          marginRight: 8,
        }}>
          <img
            src={theme === 'light' ? '/logo-maroon.png' : '/logo-white.png'}
            alt="Striking Showcase"
            style={{ height: 22, width: 'auto' }}
          />
        </span>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />

        {/* Layout pills */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {([
            { key: 'classic' as LayoutType, label: 'CLASSIC' },
            { key: 'modern' as LayoutType, label: 'MODERN' },
            { key: 'minimal' as LayoutType, label: 'MINIMAL' },
            { key: 'bold' as LayoutType, label: 'BOLD' },
            { key: 'media-first' as LayoutType, label: 'MEDIA FIRST' },
          ]).map((l) => (
            <button
              key={l.key}
              className="ctrl-pill-btn"
              onClick={() => setLayout(l.key)}
              style={{
                fontFamily: 'var(--font-exo2), sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '7px 16px',
                borderRadius: 6,
                border: layout === l.key ? `1px solid ${C.maroon}` : `1px solid ${C.border}`,
                background: layout === l.key ? C.maroon : 'transparent',
                color: layout === l.key ? '#fff' : C.textMuted,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >{l.label}</button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid ${C.border}`,
              background: C.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: C.textMuted,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '\u2600' : '\u263D'}
          </button>

          {!hideMessagingCta && (
            <button style={{
              fontFamily: 'var(--font-exo2), sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              background: C.maroon,
              color: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>Message Athlete</button>
          )}
        </div>
      </div>
      )}

      {/* Spacer for fixed control bar */}
      <div style={{ height: showControls ? 56 : 0 }} />

      {/* Loading state — prevents flash of mock data */}
      {(loading || !athlete) ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 56px)',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `3px solid ${C.border}`,
            borderTopColor: C.gold,
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 13,
            color: C.textMuted,
            letterSpacing: '0.06em',
          }}>Loading your portfolio...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
      <>

      {/* ═══════════════════════════════════════════════════
           LAYOUT 1: CLASSIC
         ═══════════════════════════════════════════════════ */}
      {layout === 'classic' && (
        <div>
          {/* ═══ AMBIENT BACKGROUND ═══ */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${C.heroGrad2}, transparent 70%)`,
              filter: 'blur(80px)',
              opacity: theme === 'light' ? 0.04 : 1,
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${goldRgba(0.12)}, transparent 70%)`,
              filter: 'blur(80px)',
              opacity: theme === 'light' ? 0.04 : 1,
            }} />
          </div>

          {/* ═══ GRID OVERLAY ═══ */}
          {theme === 'dark' && (
          <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.04,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />
          )}

          {/* HERO */}
          <div
            ref={heroRef}
            style={{
              position: 'relative',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '0 32px 64px',
              zIndex: 2,
              overflow: 'hidden',
              background: heroBackground,
            }}
          >
            {/* Radial gold glow */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: theme === 'light' ? `radial-gradient(ellipse at 70% 20%, ${goldRgba(0.06)} 0%, transparent 60%)` : `radial-gradient(ellipse at 70% 20%, ${goldRgba(0.10)} 0%, transparent 60%)`,
            }} />
            {/* Secondary maroon glow */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: theme === 'light' ? `radial-gradient(ellipse at 20% 80%, ${sRgba(0.04)} 0%, transparent 50%)` : `radial-gradient(ellipse at 20% 80%, ${sRgba(0.2)} 0%, transparent 50%)`,
            }} />
            {/* Noise texture */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.035,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
            }} />
            {/* Bowling lane SVG */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '140%', maxWidth: 1800, height: 'auto', opacity: 0.45 }} viewBox="0 0 1200 700" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="plGrad" x1="600" y1="700" x2="600" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1a1018" stopOpacity="1"/><stop offset="40%" stopColor="#0d0a10" stopOpacity=".6"/><stop offset="100%" stopColor="#0a0a0f" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="plLines" x1="600" y1="700" x2="600" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={goldRgba(0.15)}/><stop offset="100%" stopColor={goldRgba(0)}/>
                  </linearGradient>
                  <radialGradient id="plPinGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={C.gold} stopOpacity=".5"/><stop offset="100%" stopColor={C.gold} stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="plTrail" x1="600" y1="620" x2="600" y2="280" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={C.gold} stopOpacity=".3"/><stop offset="60%" stopColor={s.deep} stopOpacity=".15"/><stop offset="100%" stopColor={s.deep} stopOpacity="0"/>
                  </linearGradient>
                  <filter id="plGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <polygon points="400,700 800,700 680,200 520,200" fill="url(#plGrad)" opacity=".7"/>
                <line x1="540" y1="650" x2="555" y2="280" stroke="url(#plLines)" strokeWidth="1"/>
                <line x1="580" y1="650" x2="575" y2="280" stroke="url(#plLines)" strokeWidth="1"/>
                <line x1="620" y1="650" x2="605" y2="280" stroke="url(#plLines)" strokeWidth="1"/>
                <line x1="660" y1="650" x2="635" y2="280" stroke="url(#plLines)" strokeWidth="1"/>
                <path d="M600 640 Q595 500 588 360 Q582 280 590 230" stroke="url(#plTrail)" strokeWidth="18" strokeLinecap="round" fill="none" opacity=".6"/>
                <circle cx="592" cy="218" r="60" fill="url(#plPinGlow)" opacity=".3"/>
                <line x1="592" y1="218" x2="540" y2="175" stroke={C.gold} strokeWidth="1.5" opacity=".2" filter="url(#plGlow)"/>
                <line x1="592" y1="218" x2="650" y2="170" stroke={C.gold} strokeWidth="1" opacity=".15" filter="url(#plGlow)"/>
                <line x1="592" y1="218" x2="560" y2="150" stroke={s.deep} strokeWidth="1.5" opacity=".2" filter="url(#plGlow)"/>
                <circle cx="560" cy="165" r="7" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5"/>
                <circle cx="580" cy="162" r="7" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5"/>
                <circle cx="600" cy="160" r="7" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1.5"/>
                <circle cx="620" cy="162" r="7" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5"/>
                <circle cx="570" cy="182" r="8" fill="none" stroke={goldRgba(0.2)} strokeWidth="1.5"/>
                <circle cx="592" cy="180" r="8" fill="none" stroke={goldRgba(0.25)} strokeWidth="1.5" filter="url(#plGlow)"/>
                <circle cx="614" cy="182" r="8" fill="none" stroke={goldRgba(0.2)} strokeWidth="1.5"/>
                <circle cx="580" cy="200" r="9" fill="none" stroke={goldRgba(0.3)} strokeWidth="2" filter="url(#plGlow)"/>
                <circle cx="608" cy="200" r="9" fill="none" stroke={sRgba(0.35)} strokeWidth="2" filter="url(#plGlow)"/>
                <circle cx="594" cy="218" r="10" fill="none" stroke={C.gold} strokeWidth="2.5" filter="url(#plGlow)" opacity=".6"/>
                <circle cx="594" cy="218" r="5" fill={C.gold} opacity=".15"/>
                <circle cx="598" cy="300" r="14" fill="none" stroke={s.deep} strokeWidth="2.5" filter="url(#plGlow)" opacity=".5"/>
                <circle cx="598" cy="300" r="8" fill={s.deep} opacity=".2"/>
              </svg>
            </div>
            {/* Strike flash */}
            <div style={{
              position: 'absolute', zIndex: 1, pointerEvents: 'none', top: '12%', left: '50%',
              width: 600, height: 600, transform: 'translate(-50%,-30%)',
              background: `radial-gradient(circle, ${goldRgba(0.12)} 0%, ${goldRgba(0.04)} 30%, transparent 65%)`,
              animation: 'strike-pulse 4s ease-in-out infinite',
            }} />
            {/* Light streaks */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '22%', left: '-20%', width: 280, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, animation: 'streak-fly 4s linear infinite' }} />
              <div style={{ position: 'absolute', top: '38%', left: '-20%', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'streak-fly 3.5s linear infinite 1.2s' }} />
              <div style={{ position: 'absolute', top: '55%', left: '-20%', width: 320, height: 1, background: `linear-gradient(90deg, transparent, ${s.deep}, transparent)`, animation: 'streak-fly 5s linear infinite 2.4s' }} />
              <div style={{ position: 'absolute', top: '70%', left: '-20%', width: 160, height: 1, background: `linear-gradient(90deg, transparent, ${goldRgba(0.5)}, transparent)`, animation: 'streak-fly 3s linear infinite 3.6s' }} />
            </div>
            {/* Floating particles */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
              {[
                { w: 3, bg: C.gold, top: '20%', left: '15%', dur: '8s', delay: '0s' },
                { w: 2, bg: 'rgba(255,255,255,0.4)', top: '35%', left: '72%', dur: '10s', delay: '1s' },
                { w: 4, bg: s.deep, top: '60%', left: '28%', dur: '7s', delay: '2s' },
                { w: 2, bg: C.gold, top: '75%', left: '85%', dur: '9s', delay: '3s' },
                { w: 3, bg: 'rgba(255,255,255,0.25)', top: '45%', left: '50%', dur: '11s', delay: '0.5s' },
              ].map((p, i) => (
                <div key={i} style={{ position: 'absolute', borderRadius: '50%', width: p.w, height: p.w, background: p.bg, top: p.top, left: p.left, animation: `particle-float ${p.dur} linear infinite ${p.delay}` }} />
              ))}
            </div>
            {/* Pin glow halos */}
            <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', zIndex: 1, width: 120, height: 120, background: C.gold, opacity: 0.06, top: '8%', left: '45%', filter: 'blur(40px)', animation: 'pin-halo 3s ease-in-out infinite alternate' }} />
            <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', zIndex: 1, width: 80, height: 80, background: s.deep, opacity: 0.08, top: '15%', left: '52%', filter: 'blur(40px)', animation: 'pin-halo 3s ease-in-out infinite alternate 1s' }} />
            {/* Gold bottom line */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, opacity: 0.3, background: `linear-gradient(90deg, transparent 5%, ${C.gold} 50%, transparent 95%)` }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
              {/* Recruiting pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 100,
                padding: '6px 16px 6px 10px',
                marginBottom: 28,
                animation: 'fadeInUp 0.6s ease forwards',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: C.green,
                  animation: 'pulseGreen 2s ease-in-out infinite', display: 'inline-block',
                }} />
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: C.green,
                }}>Actively Recruiting</span>
              </div>

              {/* Name */}
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <div aria-hidden="true" style={{
                  position: 'absolute', top: 2, left: 2,
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 900,
                  fontSize: 'clamp(60px, 11vw, 140px)', lineHeight: 0.9,
                  textTransform: 'uppercase', color: theme === 'light' ? sRgba(0.15) : goldRgba(0.08),
                  userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
                }}>
                  <div>{athlete.firstName}</div>
                  <div>{athlete.lastName}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 900,
                  fontSize: 'clamp(60px, 11vw, 140px)', lineHeight: 0.9,
                  textTransform: 'uppercase', position: 'relative',
                  animation: 'fadeInUp 0.7s ease forwards', animationDelay: '0.15s',
                  opacity: 0, animationFillMode: 'forwards',
                }}>
                  <div style={{ color: C.heroNameColor }}>{athlete.firstName}</div>
                  <div style={{
                    backgroundImage: `linear-gradient(135deg, ${C.maroon}, ${C.gold}, ${C.maroon})`,
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'grad-shift 6s ease-in-out infinite',
                  }}>{athlete.lastName}</div>
                </div>
              </div>

              {/* Meta line */}
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, color: C.textMuted,
                letterSpacing: '0.06em', marginBottom: 24,
                animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.3s',
                opacity: 0, animationFillMode: 'forwards',
              }}>
                Class of {athlete.classYear}
                <span style={{ margin: '0 12px', color: C.textDim }}>|</span>
                {athlete.state}
                <span style={{ margin: '0 12px', color: C.textDim }}>|</span>
                {athlete.hand}
                <span style={{ margin: '0 12px', color: C.textDim }}>|</span>
                {athlete.style}
              </div>

              {/* Badges */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32,
                animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.4s',
                opacity: 0, animationFillMode: 'forwards',
              }}>
                {athlete.usbcId && <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100,
                  background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase', color: theme === 'light' ? '#1D4ED8' : C.blue,
                }}>
                  USBC #{athlete.usbcId}
                </span>}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100,
                  background: sRgba(0.15), border: `1px solid ${sRgba(0.3)}`,
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase', color: C.maroonBright,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  Junior Gold
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100,
                  background: goldRgba(0.12), border: `1px solid ${goldRgba(0.25)}`,
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldOnLight,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                  </svg>
                  D1 Target
                </span>
              </div>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex', gap: 14,
                animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.5s',
                opacity: 0, animationFillMode: 'forwards',
              }}>
                {!hideMessagingCta && (
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12,
                    border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                    color: '#000', fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700,
                    fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                    boxShadow: `0 4px 24px ${goldRgba(0.35)}`,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                    Recruit {athlete.firstName}
                  </button>
                )}
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12,
                  border: `1px solid ${C.border}`, background: C.card, color: C.text,
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 14,
                  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share Profile
                </button>
              </div>
            </div>
          </div>

          {/* STAT STRIP */}
          <Reveal>
            <div style={{
              position: 'relative', zIndex: 2, margin: '0 32px', borderRadius: 16,
              border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
              background: theme === 'light' ? C.statStripBg : 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)', overflow: 'hidden',
              boxShadow: theme === 'light' ? `0 4px 32px ${sRgba(0.15)}` : 'none',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
                {[
                  { label: 'Season Avg', value: athlete.stats.seasonAvg, suffix: '', trend: `+${athlete.stats.seasonTrend}`, isGold: true },
                  { label: 'High Game', value: athlete.stats.highGame, suffix: '' },
                  { label: 'High Series', value: athlete.stats.highSeries, suffix: '' },
                  { label: 'Rev Rate', value: athlete.stats.revRate, suffix: ' RPM' },
                  { label: 'Ball Speed', value: athlete.stats.ballSpeed, suffix: ' MPH' },
                  { label: 'Spare %', value: athlete.stats.sparePct, suffix: '%' },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="stat-cell"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '32px 20px', borderRight: i < 5 ? `1px solid ${theme === 'light' ? 'rgba(255,255,255,0.12)' : C.border}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <AnimatedNumber
                        value={s.value} suffix={s.suffix} isGold={false} C={C}
                        style={{
                          fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1,
                          color: theme === 'light' ? (s.isGold ? colorSchemeValues[colorScheme].goldLight : '#FFFFFF') : (s.isGold ? C.goldOnLight : C.text),
                          textShadow: theme === 'light' ? 'none' : (s.isGold ? `0 0 20px ${goldRgba(0.5)}` : 'none'),
                        }}
                      />
                      {s.trend && (
                        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: theme === 'light' ? '#86EFAC' : C.green, fontWeight: 500 }}>{s.trend}</span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11,
                      color: theme === 'light' ? 'rgba(255,255,255,0.65)' : C.textDim,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* ABOUT */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 2 }}>
            <Reveal><SectionHeader number="01" title="About" C={C} /></Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40 }}>
                <div style={{
                  borderLeft: `3px solid ${C.maroon}`, paddingLeft: 24,
                  fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 16, lineHeight: 1.8, color: C.textMuted,
                }}>{athlete.bio}</div>
                <div style={{
                  background: theme === 'light' ? '#FFFFFF' : C.card,
                  border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                  borderRadius: 16, padding: 0, overflow: 'hidden',
                  boxShadow: theme === 'light' ? C.cardShadow : 'none',
                  transition: 'box-shadow 0.3s ease',
                }}>
                  {[
                    { label: 'School', value: athlete.school },
                    { label: 'Class', value: `${athlete.classYear}` },
                    { label: 'Location', value: athlete.state },
                    { label: 'Hand', value: athlete.hand },
                    { label: 'Style', value: athlete.style },
                  ].map((row, i) => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 20px', borderBottom: i < 4 ? `1px solid ${C.borderLight}` : 'none',
                    }}>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, color: C.text, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* ACADEMICS */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', position: 'relative', zIndex: 2 }}>
            <Reveal><SectionHeader number="02" title="Academics" C={C} /></Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                {[
                  { label: 'GPA', value: `${athlete.academics.gpa || '-'}`, isNum: true },
                  { label: 'ACT', value: `${athlete.academics.act || '-'}`, isNum: true },
                  { label: 'SAT', value: `${athlete.academics.sat || '-'}`, isNum: true },
                  { label: 'NCAA', value: athlete.academics.ncaa || 'Pending', isNum: false },
                ].map((card) => (
                  <div key={card.label} style={{
                    background: theme === 'light' ? '#FFFFFF' : C.card,
                    border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: '24px 20px', position: 'relative', overflow: 'hidden',
                    boxShadow: theme === 'light' ? C.cardShadow : 'none',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.maroon}, ${C.goldOnLight})` }} />
                    <div style={{
                      fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800,
                      fontSize: card.isNum ? 36 : 24, color: C.goldOnLight,
                      textShadow: theme === 'light' ? 'none' : `0 0 16px ${goldRgba(0.3)}`, marginBottom: 4,
                    }}>{card.value}</div>
                    <div style={{
                      fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>{card.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, color: C.textMuted, marginBottom: 32 }}>
                Intended Major: <span style={{ color: C.text, fontWeight: 500 }}>{athlete.academics.major}</span>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Division Preference</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {athlete.divisions.map((d) => (
                    <span key={d.name} style={{
                      display: 'inline-flex', alignItems: 'center', padding: '8px 18px', borderRadius: 100,
                      fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 13,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      ...(d.active
                        ? { background: C.maroon, color: '#fff', border: `1px solid ${C.maroonBright}` }
                        : { background: C.card, color: C.textDim, border: `1px solid ${C.border}` }
                      ),
                    }}>{d.name}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Region Preference</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {athlete.regions.map((r) => (
                    <span key={r.name} style={{
                      display: 'inline-flex', alignItems: 'center', padding: '8px 18px', borderRadius: 100,
                      fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 13,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      ...(r.active
                        ? { background: C.maroon, color: '#fff', border: `1px solid ${C.maroonBright}` }
                        : { background: C.card, color: C.textDim, border: `1px solid ${C.border}` }
                      ),
                    }}>{r.name}</span>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* MEDIA */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 80px', position: 'relative', zIndex: 2 }}>
            <Reveal><SectionHeader number="03" title="Media" C={C} /></Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: C.card, borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {(['videos', 'photos'] as const).map((tab) => (
                  <button key={tab} onClick={() => setMediaTab(tab)} style={{
                    fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 20px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    ...(mediaTab === tab
                      ? { background: C.maroon, color: '#fff', boxShadow: `0 2px 12px ${sRgba(0.4)}` }
                      : { background: 'transparent', color: C.textDim }
                    ),
                  }}>{tab}</button>
                ))}
              </div>
            </Reveal>

            {mediaTab === 'videos' && athlete.videos && athlete.videos.length > 0 && (
              <Reveal delay={150}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div className="video-card" style={{
                    gridRow: '1 / 4',
                    background: theme === 'light' ? '#FFFFFF' : `linear-gradient(160deg, ${sRgba(0.15)}, rgba(26,21,36,0.9))`,
                    border: theme === 'light' ? 'none' : `1px solid ${C.border}`, borderRadius: 16,
                    boxShadow: theme === 'light' ? C.cardShadow : 'none',
                    minHeight: 360, position: 'relative', overflow: 'hidden',
                  }}>
                    {athlete.videos[0]?.embedUrl ? (
                      <iframe
                        src={athlete.videos[0].embedUrl}
                        title={athlete.videos[0].title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 0, minHeight: 360 }}
                      />
                    ) : (
                      <div style={{
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        padding: 40, minHeight: 360, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${sRgba(0.12)}, transparent 70%)` }} />
                        <div style={{
                          width: 80, height: 80, borderRadius: '50%', border: `2px solid ${goldRgba(0.4)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                          position: 'relative', zIndex: 1,
                        }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill={C.goldOnLight} stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 18,
                          textTransform: 'uppercase', color: C.text, textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: 8,
                        }}>{athlete.videos[0].title}</div>
                      </div>
                    )}
                  </div>
                  {athlete.videos.slice(1).map((v, i) => (
                    <a key={i} href={v.url || '#'} target="_blank" rel="noopener noreferrer" className="video-card" style={{
                      background: theme === 'light' ? '#FFFFFF' : `linear-gradient(160deg, ${sRgba(0.08)}, ${C.card})`,
                      border: theme === 'light' ? 'none' : `1px solid ${C.border}`, borderRadius: 14, padding: 20,
                      display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                      boxShadow: theme === 'light' ? C.cardShadow : 'none', textDecoration: 'none',
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', border: `1.5px solid ${goldRgba(0.3)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={C.goldOnLight} stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', color: C.text, marginBottom: 4 }}>{v.title}</div>
                        <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>
                          <span>{v.date}</span><span>{v.views} views</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </Reveal>
            )}

            {mediaTab === 'photos' && (
              <Reveal delay={150}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 180px)', gap: 12 }}>
                  {athlete.photos && athlete.photos.length > 0 ? (
                    <>
                      <div style={{
                        gridColumn: '1 / 3', gridRow: '1 / 3',
                        background: theme === 'light' ? '#FFFFFF' : `linear-gradient(160deg, ${sRgba(0.1)}, ${C.card})`,
                        border: theme === 'light' ? 'none' : `1px solid ${C.border}`, borderRadius: 16,
                        boxShadow: theme === 'light' ? C.cardShadow : 'none',
                        overflow: 'hidden',
                      }}>
                        <img src={athlete.photos[0].url} alt={athlete.photos[0].title || 'Featured photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {(athlete.photos.slice(1, 3)).map((photo, i) => (
                        <div key={i} style={{
                          background: theme === 'light' ? '#FFFFFF' : C.card,
                          border: theme === 'light' ? 'none' : `1px solid ${C.border}`, borderRadius: 14,
                          overflow: 'hidden',
                          boxShadow: theme === 'light' ? C.cardShadow : 'none',
                        }}>
                          <img src={photo.url} alt={photo.title || `Photo ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{
                      gridColumn: '1 / 4', gridRow: '1 / 3',
                      background: theme === 'light' ? '#FFFFFF' : `linear-gradient(160deg, ${sRgba(0.1)}, ${C.card})`,
                      border: theme === 'light' ? 'none' : `1px solid ${C.border}`, borderRadius: 16,
                      boxShadow: theme === 'light' ? C.cardShadow : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>NO PHOTOS YET</span>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* IN THE NEWS */}
          {athlete.articles && athlete.articles.length > 0 && (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 80px', position: 'relative', zIndex: 2 }}>
              <Reveal><SectionHeader number="04" title="In the News" C={C} /></Reveal>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {athlete.articles.map((article, i) => (
                  <Reveal key={i} delay={i * 100}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-card"
                      style={{
                        display: 'block',
                        background: theme === 'light' ? '#FFFFFF' : C.card,
                        border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        textDecoration: 'none',
                        boxShadow: theme === 'light' ? C.cardShadow : 'none',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = theme === 'light' ? C.cardShadowHover : '0 8px 32px rgba(0,0,0,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = theme === 'light' ? C.cardShadow : 'none';
                      }}
                    >
                      {article.image && (
                        <div style={{ width: '100%', height: 160, overflow: 'hidden' }}>
                          <img
                            src={article.image}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '20px 24px' }}>
                        <div style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: 10,
                          color: C.goldOnLight,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: 8,
                        }}>
                          {article.siteName}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-exo2), sans-serif',
                          fontSize: 16,
                          fontWeight: 700,
                          color: C.text,
                          marginBottom: 8,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {article.title}
                        </div>
                        {article.description && (
                          <div style={{
                            fontFamily: 'var(--font-dm-mono), monospace',
                            fontSize: 12,
                            color: C.textMuted,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {article.description}
                          </div>
                        )}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
                          fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.goldOnLight,
                        }}>
                          Read article
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* TOURNAMENT RESULTS */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 80px', position: 'relative', zIndex: 2 }}>
            <Reveal><SectionHeader number="05" title="Tournament Results" C={C} /></Reveal>
            <Reveal delay={100}>
              <div style={{
                background: theme === 'light' ? '#FFFFFF' : C.card,
                border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                borderRadius: 16, overflow: 'hidden',
                boxShadow: theme === 'light' ? C.cardShadow : 'none',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Place', 'Event', 'Format', 'Date', 'Average'].map((h) => (
                        <th key={h} style={{
                          padding: '14px 20px', textAlign: h === 'Average' || h === 'Place' ? 'center' : 'left',
                          fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim,
                          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {athlete.tournaments.map((t, i) => (
                      <tr key={i} className="tournament-row" style={{ borderBottom: i < athlete.tournaments.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>{placeChip(t.place)}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 14, fontWeight: 600, color: C.text }}>{t.name}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textMuted }}>{t.format}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textMuted }}>{t.date}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'var(--font-exo2), sans-serif', fontSize: 20, fontWeight: 700, color: C.text }}>{t.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* BALL ARSENAL */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 80px', position: 'relative', zIndex: 2 }}>
            <Reveal><SectionHeader number="06" title="Ball Arsenal" C={C} /></Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {athlete.arsenal.map((ball, i) => (
                  <div key={i} className="ball-card" style={{
                    background: theme === 'light' ? '#FFFFFF' : C.card,
                    border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    boxShadow: theme === 'light' ? C.cardShadow : 'none',
                  }}>
                    {ball.primary && (
                      <div style={{
                        position: 'absolute', top: 16, right: -30, transform: 'rotate(45deg)',
                        background: `linear-gradient(90deg, ${C.maroon}, ${C.maroonBright})`, color: '#fff',
                        fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, fontWeight: 500,
                        letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 36px', zIndex: 3,
                      }}>Primary</div>
                    )}
                    <div style={{
                      width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px',
                      background: `radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18), ${sRgba(0.4)} 40%, rgba(26,21,36,0.9) 70%, #0d0a12)`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.08)',
                      position: 'relative',
                    }}>
                      <div style={{ position: 'absolute', top: 18, left: 28, width: 14, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', filter: 'blur(3px)' }} />
                      <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }} />
                      </div>
                      <div style={{ position: 'absolute', top: 44, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 15, textTransform: 'uppercase', color: C.text, marginBottom: 4, letterSpacing: '0.02em' }}>{ball.name}</div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{ball.brand}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>
                      <span>{ball.weight}lb</span><span>{ball.cover}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* GOLD SEPARATOR */}
          <GoldSeparator />

          {/* CONTACT */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 80px', position: 'relative', zIndex: 2 }}>
            <Reveal><SectionHeader number="07" title="Contact & Recruiting" C={C} /></Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { title: 'Coach Info', items: [{ label: 'Name', value: athlete.coach.name }, { label: 'Email', value: athlete.coach.email }, { label: 'Phone', value: athlete.coach.phone }] },
                  { title: 'Bowling Center', items: [{ label: 'Center', value: athlete.center.name }, { label: 'Location', value: athlete.center.city }, { label: 'League', value: athlete.center.league }] },
                  { title: 'Pro Shop', items: [{ label: 'Shop', value: athlete.proShop.name }, { label: 'Contact', value: athlete.proShop.contact }, { label: 'Phone', value: athlete.proShop.phone }] },
                ].map((section) => (
                  <div key={section.title} style={{
                    background: theme === 'light' ? '#FFFFFF' : C.card,
                    border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                    borderRadius: 16, padding: 28,
                    boxShadow: theme === 'light' ? C.cardShadow : 'none',
                  }}>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.goldOnLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{section.title}</div>
                    {section.items.map((r) => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</span>
                        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.text, fontWeight: 500, textAlign: 'right' }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* FOOTER */}
          <Reveal>
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '48px 32px', borderTop: `1px solid ${C.borderLight}` }}>
              <img src={theme === 'light' ? '/logo-maroon.png' : '/logo-white.png'} alt="Striking Showcase" style={{ height: 28, width: 'auto', margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textDim, marginBottom: 12 }}>strikingshowcase.com</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.green, letterSpacing: '0.06em' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Verified Profile
              </div>
            </div>
          </Reveal>

          {/* STICKY CTA (Classic only) */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            transform: showSticky ? 'translateY(0)' : 'translateY(100%)',
            opacity: showSticky ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
            background: C.overlay, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderTop: `1px solid ${C.border}`, padding: '14px 32px',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', color: C.text }}>
                  {athlete.firstName} {athlete.lastName}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { label: 'AVG', value: `${athlete.stats.seasonAvg}` },
                    { label: 'HIGH', value: `${athlete.stats.highGame}` },
                    { label: 'GPA', value: `${athlete.academics.gpa}` },
                  ].map((s) => (
                    <span key={s.label} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 100,
                      background: goldRgba(0.1), border: `1px solid ${goldRgba(0.2)}`,
                      fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, letterSpacing: '0.04em',
                    }}>
                      <span style={{ color: C.textDim }}>{s.label}</span>
                      <span style={{ color: C.goldOnLight, fontWeight: 500 }}>{s.value}</span>
                    </span>
                  ))}
                </div>
              </div>
              {!hideMessagingCta && (
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10,
                  border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  color: '#000', fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 13,
                  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                  boxShadow: `0 4px 16px ${goldRgba(0.3)}`,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                  Message Athlete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
           LAYOUT 2: SPOTLIGHT
           ESPN broadcast / sports spotlight style
         ═══════════════════════════════════════════════════ */}
      {(layout === 'modern' || layout === 'bold') && (
        <div>
          {/* Split Hero: Photo left, Stats right */}
          <div style={{ display: 'grid', gridTemplateColumns: layout === 'bold' ? '1fr 1fr' : '3fr 2fr', minHeight: layout === 'bold' ? 620 : 520, position: 'relative', zIndex: 2 }}>
            {/* Photo area */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: heroBackground,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Noise texture */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '128px 128px' }} />
              {/* Gold glow */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 30% 30%, ${goldRgba(0.08)} 0%, transparent 60%)` }} />
              {/* Gradient overlay at bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: `linear-gradient(to top, ${C.bg}, transparent)`, zIndex: 2,
              }} />
              {/* Photo placeholder */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.3 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                </svg>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ATHLETE PHOTO</span>
              </div>
              {/* Name overlaid at bottom */}
              <div style={{
                position: 'absolute', bottom: 32, left: 32, zIndex: 3,
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 100, padding: '4px 12px 4px 8px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulseGreen 2s ease-in-out infinite', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.green, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recruiting</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 900,
                  fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9, textTransform: 'uppercase',
                }}>
                  <div style={{ color: C.heroNameColor }}>{athlete.firstName}</div>
                  <div style={{
                    backgroundImage: `linear-gradient(135deg, ${C.maroon}, ${C.gold}, ${C.maroon})`,
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'grad-shift 6s ease-in-out infinite',
                  }}>{athlete.lastName}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textMuted,
                  marginTop: 8, letterSpacing: '0.06em',
                }}>
                  Class of {athlete.classYear} &bull; {athlete.school} &bull; {athlete.state}
                </div>
                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {[
                    ...(athlete.usbcId ? [{ label: `USBC #${athlete.usbcId}`, color: theme === 'light' ? '#1D4ED8' : C.blue, bg: 'rgba(59,130,246,0.12)' }] : []),
                    { label: 'Junior Gold', color: C.maroonBright, bg: sRgba(0.15) },
                    { label: 'D1 Target', color: C.goldOnLight, bg: goldRgba(0.12) },
                  ].map((badge) => (
                    <span key={badge.label} style={{
                      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100,
                      background: badge.bg, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9,
                      fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: badge.color,
                    }}>{badge.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats stack on the right */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '40px 40px', gap: 0,
              background: theme === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.02)',
              borderLeft: `1px solid ${C.border}`,
              boxShadow: theme === 'light' ? `-4px 0 24px ${sRgba(0.04)}` : 'none',
            }}>
              {[
                { label: 'Season Average', value: athlete.stats.seasonAvg, suffix: '', highlight: true },
                { label: 'High Game', value: athlete.stats.highGame, suffix: '' },
                { label: 'High Series', value: athlete.stats.highSeries, suffix: '' },
                { label: 'Rev Rate', value: athlete.stats.revRate, suffix: ' RPM' },
                { label: 'Ball Speed', value: athlete.stats.ballSpeed, suffix: ' MPH' },
                { label: 'Spare Conversion', value: athlete.stats.sparePct, suffix: '%' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: i < 5 ? `1px solid ${C.borderLight}` : 'none',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{s.label}</span>
                  <AnimatedNumber
                    value={s.value} suffix={s.suffix} isGold={s.highlight} C={C} goldRgba={goldRgba}
                    style={{
                      fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800,
                      fontSize: s.highlight ? (layout === 'bold' ? 56 : 48) : (layout === 'bold' ? 36 : 32), lineHeight: 1,
                    }}
                  />
                </div>
              ))}
              {!hideMessagingCta && (
                <button style={{
                  marginTop: 24, width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: '#000',
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 14,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  boxShadow: `0 4px 20px ${goldRgba(0.3)}`,
                }}>Recruit {athlete.firstName}</button>
              )}
            </div>
          </div>

          {/* Gold divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.goldOnLight}, transparent)`, margin: '0 48px' }} />

          {/* Highlight Reel Row */}
          <div style={{ padding: '40px 48px 0', position: 'relative', zIndex: 2 }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16,
            }}>HIGHLIGHT REEL</div>
            <div className="scroll-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24 }}>
              {athlete.videos.map((v, i) => (
                <div key={i} className="spotlight-highlight-card" style={{
                  flexShrink: 0, width: 280,
                  background: theme === 'light' ? '#FFFFFF' : C.card,
                  border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                  borderRadius: 14,
                  overflow: 'hidden', cursor: 'pointer',
                  boxShadow: theme === 'light' ? C.cardShadow : 'none',
                }}>
                  <div style={{
                    height: 140, background: theme === 'light' ? `linear-gradient(135deg, ${sRgba(0.06)}, ${C.surfaceLight})` : `linear-gradient(135deg, ${C.maroon}22, ${C.bg})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', background: C.maroon,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid rgba(255,255,255,0.2)',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 4,
                        background: C.goldOnLight, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9,
                        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000',
                      }}>FEATURED</div>
                    )}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: C.text, marginBottom: 4 }}>{v.title}</div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>{v.date} &middot; {v.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.goldOnLight}, transparent)`, margin: '0 48px' }} />

          {/* Two-column: Bio+Tournaments | Academics+Arsenal */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, position: 'relative', zIndex: 2 }}>
            {/* Left column */}
            <div>
              {/* Bio */}
              <Reveal>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>ABOUT</div>
                  <p style={{
                    fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 15, lineHeight: 1.8, color: C.textMuted, margin: 0,
                  }}>{athlete.bio}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20 }}>
                    {[
                      { label: 'School', value: athlete.school },
                      { label: 'Hand', value: athlete.hand },
                      { label: 'Style', value: athlete.style },
                      { label: 'Location', value: athlete.state },
                    ].map((r) => (
                      <div key={r.label} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                        background: theme === 'light' ? '#FFFFFF' : C.card,
                        border: theme === 'light' ? 'none' : `1px solid ${C.borderLight}`,
                        borderRadius: 8,
                        boxShadow: theme === 'light' ? `0 1px 4px ${sRgba(0.04)}` : 'none',
                      }}>
                        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase' }}>{r.label}</span>
                        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.text, fontWeight: 500 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Tournaments */}
              <Reveal delay={100}>
                <div style={{ height: 1, background: `linear-gradient(90deg, ${C.goldOnLight}, transparent)`, marginBottom: 32 }} />
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>TOURNAMENT RESULTS</div>
                {athlete.tournaments.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                    borderBottom: i < athlete.tournaments.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                  }}>
                    {placeChip(t.place)}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 14, fontWeight: 600, color: C.text }}>{t.name}</div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>{t.format} &bull; {t.date}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-exo2), sans-serif', fontSize: 22, fontWeight: 800, color: C.goldOnLight }}>{t.avg}</span>
                  </div>
                ))}
              </Reveal>
            </div>

            {/* Right column */}
            <div>
              {/* Academics */}
              <Reveal>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>ACADEMICS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {[
                      { label: 'GPA', value: `${athlete.academics.gpa || '-'}` },
                      { label: 'ACT', value: `${athlete.academics.act || '-'}` },
                      { label: 'SAT', value: `${athlete.academics.sat || '-'}` },
                      { label: 'NCAA', value: athlete.academics.ncaa || 'Pending' },
                    ].map((card) => (
                      <div key={card.label} style={{
                        background: theme === 'light' ? '#FFFFFF' : C.card,
                        border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: '20px 16px', textAlign: 'center',
                        boxShadow: theme === 'light' ? C.cardShadow : 'none',
                      }}>
                        <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 28, color: C.goldOnLight, marginBottom: 2 }}>{card.value}</div>
                        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textMuted, marginTop: 12 }}>
                    Major: <span style={{ color: C.text, fontWeight: 500 }}>{athlete.academics.major}</span>
                  </div>
                  {/* Division & Region */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Division Preference</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                      {athlete.divisions.map((d) => (
                        <span key={d.name} style={{
                          padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                          fontFamily: 'var(--font-exo2), sans-serif', textTransform: 'uppercase',
                          ...(d.active ? { background: C.maroon, color: '#fff' } : { background: C.card, color: C.textDim, border: `1px solid ${C.border}` }),
                        }}>{d.name}</span>
                      ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Region Preference</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {athlete.regions.map((r) => (
                        <span key={r.name} style={{
                          padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                          fontFamily: 'var(--font-exo2), sans-serif', textTransform: 'uppercase',
                          ...(r.active ? { background: C.maroon, color: '#fff' } : { background: C.card, color: C.textDim, border: `1px solid ${C.border}` }),
                        }}>{r.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Arsenal scroll row */}
              <Reveal delay={200}>
                <div style={{ height: 1, background: `linear-gradient(90deg, ${C.goldOnLight}, transparent)`, margin: '32px 0' }} />
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>BALL ARSENAL</div>
                <div className="scroll-row" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
                  {athlete.arsenal.map((ball, i) => (
                    <div key={i} style={{
                      flexShrink: 0, width: 160,
                      background: theme === 'light' ? '#FFFFFF' : C.card,
                      border: theme === 'light' ? 'none' : `1px solid ${C.border}`,
                      borderRadius: 14, padding: '20px 14px', textAlign: 'center', position: 'relative',
                      boxShadow: theme === 'light' ? C.cardShadow : 'none',
                    }}>
                      {ball.primary && (
                        <div style={{
                          position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 4,
                          background: C.maroon, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8,
                          color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>PRIMARY</div>
                      )}
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                        background: `radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18), ${sRgba(0.4)} 40%, rgba(26,21,36,0.9) 70%, #0d0a12)`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      }} />
                      <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: C.text, marginBottom: 2 }}>{ball.name}</div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim }}>{ball.brand} &bull; {ball.weight}lb</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>

          {/* Contact strip */}
          <Reveal>
            <div style={{
              background: theme === 'light' ? '#FFFFFF' : C.card,
              borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
              padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
              position: 'relative', zIndex: 2,
              boxShadow: theme === 'light' ? `0 -2px 20px ${sRgba(0.04)}` : 'none',
            }}>
              {[
                { title: 'Coach', detail: `${athlete.coach.name} — ${athlete.coach.email}`, sub: athlete.coach.phone },
                { title: 'Center', detail: `${athlete.center.name}, ${athlete.center.city}`, sub: athlete.center.league },
                { title: 'Pro Shop', detail: `${athlete.proShop.name} — ${athlete.proShop.contact}`, sub: athlete.proShop.phone },
              ].map((c) => (
                <div key={c.title}>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, color: C.goldOnLight, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 13, color: C.text }}>{c.detail}</div>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, marginTop: 2 }}>{c.sub}</div>
                </div>
              ))}
              {!hideMessagingCta && (
                <button style={{
                  padding: '12px 28px', borderRadius: 8, border: 'none',
                  background: C.maroon, color: '#fff',
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                }}>Message Athlete</button>
              )}
            </div>
          </Reveal>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '40px 32px', position: 'relative', zIndex: 2 }}>
            <img src={theme === 'light' ? '/logo-maroon.png' : '/logo-white.png'} alt="Striking Showcase" style={{ height: 24, width: 'auto', margin: '0 auto 4px', opacity: 0.6 }} />
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, marginTop: 4 }}>strikingshowcase.com</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.green, letterSpacing: '0.06em', marginTop: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Profile
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
           LAYOUT 3: EDITORIAL
           Magazine / feature story style
         ═══════════════════════════════════════════════════ */}
      {(layout === 'minimal' || layout === 'media-first') && (
        <div>
          {/* Full-width hero with name at bottom-right */}
          <div style={{
            position: 'relative', height: layout === 'media-first' ? '55vh' : '70vh', minHeight: layout === 'media-first' ? 420 : 480, overflow: 'hidden',
            background: heroBackground,
          }}>
            {/* Noise texture */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '128px 128px' }} />
            {/* Gold glow */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 70% 30%, ${goldRgba(0.08)} 0%, transparent 60%)` }} />
            {/* Maroon glow */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 20% 70%, ${sRgba(0.15)} 0%, transparent 50%)` }} />
            {/* Light streaks */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
              <div style={{ position: 'absolute', top: '25%', left: '-20%', width: 280, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, animation: 'streak-fly 4s linear infinite' }} />
              <div style={{ position: 'absolute', top: '50%', left: '-20%', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'streak-fly 3.5s linear infinite 1.2s' }} />
            </div>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to top, ${C.bg} 0%, transparent 50%)`,
              zIndex: 1,
            }} />
            {/* Photo placeholder center */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            {/* Name overlaid at bottom right */}
            <div style={{
              position: 'absolute', bottom: 48, right: 48, zIndex: 2, textAlign: 'right',
            }}>
              <div style={{
                fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 900,
                fontSize: 'clamp(48px, 9vw, 120px)', lineHeight: 0.85, textTransform: 'uppercase',
                color: C.heroNameColor, animation: 'slideInRight 0.8s ease forwards',
              }}>
                {athlete.firstName}
              </div>
              <div style={{
                fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 900,
                fontSize: 'clamp(48px, 9vw, 120px)', lineHeight: 0.85, textTransform: 'uppercase',
                backgroundImage: `linear-gradient(135deg, ${C.maroon}, ${C.gold}, ${C.maroon})`,
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'slideInRight 0.8s ease 0.15s forwards, grad-shift 6s ease-in-out infinite',
                opacity: 0, animationFillMode: 'forwards',
              }}>
                {athlete.lastName}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: C.textMuted,
                marginTop: 12, letterSpacing: '0.08em',
              }}>
                Class of {athlete.classYear} &bull; {athlete.school} &bull; {athlete.hand}
              </div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {[
                  { label: 'USBC Verified', color: theme === 'light' ? '#1D4ED8' : C.blue, bg: 'rgba(59,130,246,0.12)' },
                  { label: 'Junior Gold', color: C.maroonBright, bg: sRgba(0.15) },
                  { label: 'D1 Target', color: C.goldOnLight, bg: goldRgba(0.12) },
                ].map((badge) => (
                  <span key={badge.label} style={{
                    display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100,
                    background: badge.bg, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9,
                    fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: badge.color,
                  }}>{badge.label}</span>
                ))}
              </div>
            </div>
            {/* Status pill top left */}
            <div style={{ position: 'absolute', top: 24, left: 48, zIndex: 2 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 100, padding: '5px 14px 5px 10px',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulseGreen 2s ease-in-out infinite', display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.green, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Actively Recruiting</span>
              </div>
            </div>
          </div>

          {/* Pull quote */}
          <Reveal>
            <div style={{
              maxWidth: 800, margin: '0 auto', padding: '56px 48px 40px', textAlign: 'center', position: 'relative',
            }}>
              <div style={{
                fontFamily: 'var(--font-exo2), sans-serif', fontSize: 64, color: C.goldOnLight, lineHeight: 0.5, marginBottom: 16,
                opacity: 0.6,
              }}>&ldquo;</div>
              <p style={{
                fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 'clamp(18px, 2.5vw, 26px)',
                fontStyle: 'italic', lineHeight: 1.6, color: C.textMuted, margin: 0,
              }}>
                {athlete.bio.split('.')[0]}.
              </p>
              <div style={{ width: 40, height: 2, background: C.goldOnLight, margin: '20px auto 0' }} />
            </div>
          </Reveal>

          {/* Stat circles row */}
          <Reveal>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 3vw, 40px)',
              padding: '0 48px 56px', flexWrap: 'wrap',
            }}>
              {[
                { label: 'Season Avg', value: athlete.stats.seasonAvg, highlight: true },
                { label: 'High Game', value: athlete.stats.highGame },
                { label: 'High Series', value: athlete.stats.highSeries },
                { label: 'Rev Rate', value: athlete.stats.revRate },
                { label: 'Ball Speed', value: athlete.stats.ballSpeed },
                { label: 'Spare %', value: athlete.stats.sparePct },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: '50%',
                    border: `2px solid ${s.highlight ? C.goldOnLight : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px',
                    background: theme === 'light' ? '#FFFFFF' : 'transparent',
                    boxShadow: s.highlight ? (theme === 'light' ? C.cardShadow : `0 0 20px ${goldRgba(0.2)}`) : (theme === 'light' ? C.cardShadow : 'none'),
                    animation: s.highlight ? 'ringPulse 3s ease-in-out infinite' : 'none',
                  }}>
                    <AnimatedNumber
                      value={s.value} C={C} isGold={s.highlight} goldRgba={goldRgba}
                      style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 800, fontSize: 30, lineHeight: 1 }}
                    />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Bio article */}
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 32px 56px' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 24, height: 3, background: C.goldOnLight, marginBottom: 10 }} />
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 700, textTransform: 'lowercase', color: C.text, letterSpacing: '0.02em',
                }}>the story</div>
              </div>
              <p style={{
                fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 16, lineHeight: 2,
                color: C.textMuted, margin: 0,
              }}>{athlete.bio}</p>
            </div>
          </Reveal>

          {/* Academics — minimalist list */}
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 32px 56px' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 24, height: 3, background: C.goldOnLight, marginBottom: 10 }} />
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 700, textTransform: 'lowercase', color: C.text, letterSpacing: '0.02em',
                }}>academics</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
                {[
                  { label: 'GPA', value: `${athlete.academics.gpa}` },
                  { label: 'ACT', value: `${athlete.academics.act}` },
                  { label: 'SAT', value: `${athlete.academics.sat}` },
                  { label: 'NCAA', value: athlete.academics.ncaa },
                  { label: 'Major', value: athlete.academics.major },
                  { label: 'Class', value: `${athlete.classYear}` },
                ].map((r) => (
                  <div key={r.label} style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    padding: '10px 0', borderBottom: `1px solid ${C.borderLight}`,
                  }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{r.label}</span>
                    <span style={{ flex: 1, borderBottom: `1px dotted ${C.border}`, marginBottom: 3 }} />
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, color: C.text, fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
              {/* Divisions & regions */}
              <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Division</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {athlete.divisions.map((d) => (
                      <span key={d.name} style={{
                        padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                        fontFamily: 'var(--font-exo2), sans-serif', textTransform: 'uppercase',
                        ...(d.active ? { background: C.maroon, color: '#fff' } : { background: C.card, color: C.textDim, border: `1px solid ${C.border}` }),
                      }}>{d.name}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Region</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {athlete.regions.map((r) => (
                      <span key={r.name} style={{
                        padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                        fontFamily: 'var(--font-exo2), sans-serif', textTransform: 'uppercase',
                        ...(r.active ? { background: C.maroon, color: '#fff' } : { background: C.card, color: C.textDim, border: `1px solid ${C.border}` }),
                      }}>{r.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Tournament timeline */}
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 32px 56px' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 24, height: 3, background: C.goldOnLight, marginBottom: 10 }} />
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 700, textTransform: 'lowercase', color: C.text, letterSpacing: '0.02em',
                }}>tournament results</div>
              </div>
              <div style={{ position: 'relative', paddingLeft: 32 }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute', left: 8, top: 8, bottom: 8, width: 2,
                  background: `linear-gradient(to bottom, ${C.goldOnLight}, ${C.border})`,
                }} />
                {athlete.tournaments.map((t, i) => (
                  <div key={i} style={{
                    position: 'relative', paddingBottom: i < athlete.tournaments.length - 1 ? 28 : 0,
                  }}>
                    {/* Dot */}
                    <div className="timeline-dot revealed" style={{
                      position: 'absolute', left: -28, top: 4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: t.place <= 3 ? C.goldOnLight : C.border,
                      border: `3px solid ${C.bg}`,
                      animationDelay: `${i * 200 + 300}ms`,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 15, fontWeight: 700, color: C.text }}>{t.name}</div>
                        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, marginTop: 2 }}>
                          {t.format} &bull; {t.date} &bull; <span style={{ color: t.place <= 3 ? C.goldOnLight : C.textMuted }}>#{t.place}</span>
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-exo2), sans-serif', fontSize: 24, fontWeight: 800,
                        color: C.goldOnLight, flexShrink: 0, marginLeft: 16,
                      }}>{t.avg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Arsenal — overlapping circles */}
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 32px 56px' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 24, height: 3, background: C.goldOnLight, marginBottom: 10 }} />
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 700, textTransform: 'lowercase', color: C.text, letterSpacing: '0.02em',
                }}>ball arsenal</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                {athlete.arsenal.map((ball, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    marginLeft: i > 0 ? -16 : 0, zIndex: athlete.arsenal.length - i,
                    position: 'relative',
                  }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: `radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18), ${sRgba(0.4)} 40%, rgba(26,21,36,0.9) 70%, #0d0a12)`,
                      boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 3px ${C.bg}`,
                      border: ball.primary ? `2px solid ${C.goldOnLight}` : `2px solid ${C.border}`,
                    }} />
                    <div style={{
                      marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap',
                    }}>
                      <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: C.text }}>{ball.name}</div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, color: C.textDim }}>{ball.brand}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Media — masonry grid */}
          <Reveal>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 56px' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 24, height: 3, background: C.goldOnLight, marginBottom: 10 }} />
                <div style={{
                  fontFamily: 'var(--font-exo2), sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 700, textTransform: 'lowercase', color: C.text, letterSpacing: '0.02em',
                }}>media</div>
              </div>
              <div style={{ columns: 3, columnGap: 14 }}>
                {athlete.videos.map((v, i) => {
                  const heights = [200, 260, 180, 240];
                  return (
                    <div key={i} className="editorial-masonry-item" style={{
                      breakInside: 'avoid', marginBottom: 14,
                      height: heights[i % heights.length],
                      background: theme === 'light' ? '#FFFFFF' : `linear-gradient(${135 + i * 20}deg, ${C.maroon}18, ${C.card})`,
                      border: theme === 'light' ? 'none' : `1px solid ${C.border}`, borderRadius: 12,
                      boxShadow: theme === 'light' ? C.cardShadow : 'none',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      padding: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    }}>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                        width: 40, height: 40, borderRadius: '50%', background: `${C.maroon}88`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                      <div style={{ fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: C.text, position: 'relative', zIndex: 1 }}>{v.title}</div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: C.textDim, position: 'relative', zIndex: 1 }}>{v.date} &middot; {v.views} views</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Contact & CTA */}
          <Reveal>
            <div style={{
              maxWidth: 680, margin: '0 auto', padding: '0 32px 56px', textAlign: 'center',
            }}>
              <div style={{ width: 40, height: 2, background: C.goldOnLight, margin: '0 auto 24px' }} />
              <div style={{
                fontFamily: 'var(--font-exo2), sans-serif', fontSize: 20, fontWeight: 700,
                textTransform: 'lowercase', color: C.text, marginBottom: 24,
              }}>get in touch</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
                {[
                  { title: 'Coach', name: athlete.coach.name, detail: athlete.coach.email, sub: athlete.coach.phone },
                  { title: 'Center', name: athlete.center.name, detail: athlete.center.city, sub: athlete.center.league },
                  { title: 'Pro Shop', name: athlete.proShop.name, detail: athlete.proShop.contact, sub: athlete.proShop.phone },
                ].map((c) => (
                  <div key={c.title} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, color: C.goldOnLight, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontFamily: 'var(--font-nunito-sans), sans-serif', fontSize: 14, fontWeight: 600, color: C.text }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>{c.detail}</div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim }}>{c.sub}</div>
                  </div>
                ))}
              </div>
              {!hideMessagingCta && (
                <button style={{
                  padding: '16px 48px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: '#000',
                  fontFamily: 'var(--font-exo2), sans-serif', fontWeight: 700, fontSize: 15,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  boxShadow: `0 4px 24px ${goldRgba(0.35)}`,
                }}>Recruit {athlete.firstName}</button>
              )}
            </div>
          </Reveal>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '40px 32px 48px', borderTop: `1px solid ${C.borderLight}`, position: 'relative', zIndex: 2 }}>
            <img src={theme === 'light' ? '/logo-maroon.png' : '/logo-white.png'} alt="Striking Showcase" style={{ height: 24, width: 'auto', margin: '0 auto 4px', opacity: 0.6 }} />
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.textDim, marginTop: 4 }}>strikingshowcase.com</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: C.green, letterSpacing: '0.06em', marginTop: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Profile
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default function AthletePreviewPage() {
  return (
    <ShowcasePortfolio
      sourceMode="me"
      hideMessagingCta
      showControls
      trackScrollSticky
    />
  );
}
