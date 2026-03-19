'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, description, disabled = false, size = 'md' }: ToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  };

  const s = sizes[size];

  return (
    <label className={cn('flex items-center gap-3', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200',
          s.track,
          checked ? 'bg-[var(--accent-bright)]' : 'bg-[var(--bg-tertiary)]'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200',
            s.thumb,
            'mt-0.5 ml-0.5',
            checked ? s.translate : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>}
          {description && <span className="text-xs text-[var(--text-tertiary)]">{description}</span>}
        </div>
      )}
    </label>
  );
}
