'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StatStripItem {
  label: string;
  value: number | string;
  suffix?: string;
  highlight?: boolean;
}

interface StatStripProps {
  stats: StatStripItem[];
  className?: string;
  animate?: boolean;
}

function AnimatedNumber({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isFloat = numValue % 1 !== 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 1000;
          const steps = 30;
          const increment = numValue / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numValue) {
              setDisplay(numValue);
              clearInterval(timer);
            } else {
              setDisplay(current);
            }
          }, duration / steps);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numValue]);

  return (
    <span ref={ref}>
      {isFloat ? display.toFixed(1) : Math.round(display)}
      {suffix}
    </span>
  );
}

export function StatStrip({ stats, className, animate = true }: StatStripProps) {
  return (
    <div className={cn('flex items-center justify-around py-5 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)]', className)}>
      {stats.map((stat, i) => (
        <div key={stat.label} className="relative flex flex-col items-center gap-1.5 px-4">
          <span className={cn(
            'font-heading font-bold text-3xl',
            stat.highlight ? 'text-gold' : 'text-[var(--text-primary)]'
          )}>
            {animate && typeof stat.value === 'number' ? (
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            ) : (
              <>{stat.value}{stat.suffix}</>
            )}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">{stat.label}</span>
          {i < stats.length - 1 && (
            <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-[var(--border-primary)]" />
          )}
        </div>
      ))}
    </div>
  );
}
