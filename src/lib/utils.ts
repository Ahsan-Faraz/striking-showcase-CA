import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateProfileCompletion(profile: Record<string, unknown>): number {
  const fields = [
    'firstName', 'lastName', 'classYear', 'state', 'school', 'gender',
    'dominantHand', 'style', 'bio', 'profilePhotoUrl',
    'gpa', 'seasonAverage', 'highGame', 'highSeries',
    'revRate', 'ballSpeed',
  ];
  const filled = fields.filter((f) => {
    const val = profile[f];
    return val !== null && val !== undefined && val !== '';
  });
  return Math.round((filled.length / fields.length) * 100);
}

export function getD1Benchmark(stat: string): number | null {
  const benchmarks: Record<string, number> = {
    seasonAverage: 200,
    highGame: 280,
    highSeries: 750,
    revRate: 350,
    ballSpeed: 17.5,
    gpa: 3.5,
    spareConversion: 85,
  };
  return benchmarks[stat] ?? null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '...';
}
