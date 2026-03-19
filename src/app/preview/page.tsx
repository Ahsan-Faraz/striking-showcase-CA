'use client';

import Link from 'next/link';

const pages = [
  {
    category: 'LANDING PAGES',
    items: [
      { name: 'Coach Landing Page', href: '/coach-landing.html', description: 'Public-facing page for college coaches — standalone HTML', external: true },
      { name: 'Athlete Landing Page', href: '/', description: 'Public-facing homepage for athletes considering the platform' },
    ],
  },
  {
    category: 'AUTH',
    items: [
      { name: 'Login', href: '/login', description: 'Sign in page with maroon gradient background' },
      { name: 'Register', href: '/register', description: 'Sign up with role selection (Athlete vs Coach)' },
    ],
  },
  {
    category: 'ATHLETE DASHBOARD',
    items: [
      { name: 'Dashboard', href: '/dashboard', description: 'Main dashboard with KPIs, activity feed, quick actions' },
      { name: 'Edit Profile', href: '/profile', description: 'Profile editing with tabs: Personal, Bowling, Academics, Preferences' },
      { name: 'Media', href: '/media', description: 'Photo and video upload management' },
      { name: 'Tournaments', href: '/tournaments', description: 'Tournament results tracker with leaderboard styling' },
      { name: 'Ball Arsenal', href: '/arsenal', description: 'Ball collection with coverstock type and Storm layout system' },
      { name: 'Messages', href: '/messages', description: 'Coach-athlete messaging with parent CC' },
      { name: 'Settings', href: '/settings', description: 'Theme, layout, notification preferences' },
    ],
  },
  {
    category: 'COACH DASHBOARD',
    items: [
      { name: 'Coach Dashboard', href: '/coach-dashboard', description: 'Watchlist management, roster status, messages, and athlete activity feed' },
    ],
  },
  {
    category: 'PUBLIC PORTFOLIOS',
    items: [
      { name: 'Athlete Portfolio (3 Layouts)', href: '/athlete/preview', description: 'The main product — 3 layout options (Classic, Spotlight, Editorial) with light/dark toggle' },
      { name: 'Coach Portfolio', href: '/coach/demo-coach', description: 'Public coach/program profile with roster status, achievements, and recruiting needs' },
    ],
  },
  {
    category: 'ADMIN',
    items: [
      { name: 'Admin Dashboard', href: '/admin', description: 'Platform stats, user management, reports, and audit log' },
    ],
  },
  {
    category: 'BRAND & DESIGN',
    items: [
      { name: 'Brand Book', href: '/brand-book.html', description: 'Complete brand guidelines — colors, typography, components, iconography', external: true },
    ],
  },
];

export default function PreviewIndexPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1A1524',
      padding: '60px 32px',
      fontFamily: 'var(--font-nunito-sans), Nunito Sans, sans-serif',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <img src="/logo-white.png" alt="Striking Showcase" style={{ height: 40, margin: '0 auto 24px' }} />
          <h1 style={{
            fontFamily: 'var(--font-exo2), Exo 2, sans-serif',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#E8E6ED',
            letterSpacing: '-0.01em',
            marginBottom: 12,
          }}>
            Application Preview
          </h1>
          <p style={{
            fontSize: 16,
            color: '#9A97A6',
            maxWidth: 500,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Navigate every page of the Striking Showcase platform. Click any page to preview it.
          </p>
        </div>

        {/* Page list */}
        {pages.map((section) => (
          <div key={section.category} style={{ marginBottom: 48 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
            }}>
              <span style={{
                fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
                fontSize: 11,
                color: '#C9A84C',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}>{section.category}</span>
              <div style={{
                flex: 1,
                height: 1,
                background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map((page) => {
                const isExternal = 'external' in page && page.external;
                const content = (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-exo2), Exo 2, sans-serif',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#E8E6ED',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        marginBottom: 4,
                      }}>{page.name}</div>
                      <div style={{
                        fontSize: 13,
                        color: '#6B687A',
                        lineHeight: 1.4,
                      }}>{page.description}</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B687A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                );

                if (isExternal) {
                  return <a key={page.name} href={page.href} target="_blank" rel="noopener noreferrer">{content}</a>;
                }
                return <Link key={page.name} href={page.href}>{content}</Link>;
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '48px 0 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: 32,
        }}>
          <img src="/logo-white.png" alt="Striking Showcase" style={{ height: 20, margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{
            fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
            fontSize: 11,
            color: '#6B687A',
            letterSpacing: '0.1em',
          }}>
            DEVELOPMENT PREVIEW — NOT FOR PUBLIC USE
          </p>
        </div>
      </div>
    </div>
  );
}
