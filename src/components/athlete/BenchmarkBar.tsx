'use client';

import { cn } from '@/lib/utils';

interface BenchmarkBarProps {
  label: string;
  value: number;
  benchmark: number;
  unit?: string;
  className?: string;
}

export function BenchmarkBar({ label, value, benchmark, unit = '', className }: BenchmarkBarProps) {
  const percentage = Math.min((value / benchmark) * 100, 120);
  const meetsD1 = value >= benchmark;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-mono font-bold', meetsD1 ? 'text-green-400' : 'text-gold')}>
            {value}{unit}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">/ {benchmark}{unit}</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
        {/* D1 benchmark line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gold/80 z-10"
          style={{ left: `${Math.min((benchmark / (benchmark * 1.2)) * 100, 100)}%` }}
        />
        {/* Value bar - maroon to green gradient */}
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: meetsD1
              ? 'linear-gradient(90deg, #660033 0%, #880044 25%, #C9A84C 55%, #22C55E 100%)'
              : 'linear-gradient(90deg, #660033 0%, #880044 50%, #C9A84C 100%)',
          }}
        />
      </div>
      <div className="flex items-center justify-end gap-1">
        {meetsD1 ? (
          <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm3.78 5.22a.75.75 0 00-1.06 0L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06z" />
            </svg>
            Meets D1 Benchmark
          </span>
        ) : (
          <span className="text-[10px] text-gold/80 font-medium">
            {(benchmark - value).toFixed(value % 1 !== 0 ? 1 : 0)}{unit} to D1
          </span>
        )}
      </div>
    </div>
  );
}
