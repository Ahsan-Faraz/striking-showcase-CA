'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-white.png" alt="Striking Showcase" className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              Pricing
            </Link>
            <Link href="#coaches" className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              For Coaches
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[var(--text-secondary)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn('md:hidden overflow-hidden transition-all duration-300', mobileOpen ? 'max-h-64 pb-4' : 'max-h-0')}>
          <div className="flex flex-col gap-3 pt-2">
            <Link href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] py-2 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] py-2 transition-colors">
              Pricing
            </Link>
            <Link href="#coaches" className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] py-2 transition-colors">
              For Coaches
            </Link>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
