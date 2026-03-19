'use client';

import { cn } from '@/lib/utils';

interface StatBlockProps {
  value: string | number;
  label: string;
  trend?: { value: number; positive: boolean };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatBlock({ value, label, trend, size = 'md', className }: StatBlockProps) {
  const sizes = {
    sm: { value: 'text-xl', label: 'text-[10px]', container: 'p-2 gap-0.5' },
    md: { value: 'text-3xl', label: 'text-xs', container: 'p-4 gap-1' },
    lg: { value: 'text-4xl', label: 'text-sm', container: 'p-6 gap-1.5' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex flex-col items-center', s.container, className)}>
      <span className={cn('font-heading font-bold text-gold', s.value)}>
        {value}
      </span>
      <span className={cn('uppercase tracking-wider text-[var(--text-secondary)]', s.label)}>
        {label}
      </span>
      {trend && (
        <span
          className={cn(
            'flex items-center gap-0.5 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full',
            trend.positive ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
          )}
        >
          <svg
            className={cn('w-3 h-3', !trend.positive && 'rotate-180')}
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M6 2l4 5H2l4-5z" />
          </svg>
          {trend.positive ? '+' : ''}{trend.value}
        </span>
      )}
    </div>
  );
}
