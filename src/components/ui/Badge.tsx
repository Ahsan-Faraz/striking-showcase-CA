'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'verified' | 'recruit' | 'sponsor' | 'division' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)]',
    verified: 'badge-verified',
    recruit: 'badge-recruit shadow-glow-maroon/30',
    sponsor: 'badge-sponsor',
    division: 'badge-division',
    outline: 'bg-transparent border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-maroon/40 transition-colors',
  };

  return (
    <span className={cn('badge', variants[variant], className)} {...props}>
      {variant === 'verified' && (
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm3.78 5.22a.75.75 0 00-1.06 0L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06z" />
        </svg>
      )}
      {children}
    </span>
  );
}
