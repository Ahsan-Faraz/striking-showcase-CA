'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface PhotoFrameProps {
  src?: string | null;
  alt?: string;
  onUpload?: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
  label?: string;
  className?: string;
}

export function PhotoFrame({
  src,
  alt = 'Photo',
  onUpload,
  size = 'md',
  shape = 'circle',
  label = 'Upload Photo',
  className,
}: PhotoFrameProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
  };

  const handleClick = () => {
    if (onUpload) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!onUpload}
        className={cn(
          'relative flex items-center justify-center overflow-hidden transition-all duration-200',
          sizes[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
          src
            ? 'border-2 border-[var(--accent-primary)]'
            : 'border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--accent-primary)]',
          !src && 'bg-[var(--bg-card)]',
          onUpload && 'cursor-pointer group'
        )}
      >
        {src ? (
          <>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
            {onUpload && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--text-tertiary)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m9 8H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </button>
      {!src && label && (
        <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      )}
      {onUpload && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      )}
    </div>
  );
}
