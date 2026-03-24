'use client';

import { useState, useEffect, useRef } from 'react';

/** Animated counter that triggers on scroll into view */
export function Counter({
  target,
  prefix = '',
  suffix = '',
}: {
  target: number;
  prefix?: string;
  suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const duration = 2000;
          const update = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Collapsible FAQ item */
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-primary)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-6 flex items-center justify-between gap-4 group"
      >
        <span className="font-heading text-lg font-semibold text-[var(--text-primary)] group-hover:text-gold transition-colors">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-[var(--text-tertiary)] shrink-0 transition-transform duration-300 ${open ? 'rotate-45 text-gold' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-400"
        style={{ maxHeight: open ? '200px' : '0' }}
      >
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed pb-6">{answer}</p>
      </div>
    </div>
  );
}

/** Sticky CTA bars that appear on scroll */
export function StickyBars() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop sticky bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-primary)] backdrop-blur-xl transition-transform duration-400 hidden md:block"
        style={{
          background: 'rgba(10,10,15,0.92)',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Start Your Free Month — <span className="text-gold font-semibold">First month free</span>, then $17.99/mo
          </p>
          <a href="/register" className="btn-primary text-xs px-5 py-2 rounded-lg">
            Start Free Month
          </a>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3 border-t border-[var(--border-primary)] backdrop-blur-xl md:hidden transition-transform duration-400"
        style={{
          background: 'rgba(10,10,15,0.95)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <a href="/register" className="btn-primary w-full text-center block py-3 text-sm font-bold rounded-lg">
          Start Your Free Month
        </a>
      </div>
    </>
  );
}
