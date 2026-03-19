'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn, getInitials } from '@/lib/utils';

interface AthleteCardProps {
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    classYear: number;
    state?: string | null;
    school?: string | null;
    profilePhotoUrl?: string | null;
    seasonAverage?: number | null;
    highGame?: number | null;
    highSeries?: number | null;
    dominantHand?: string | null;
    style?: string | null;
    gpa?: number | null;
    isActivelyRecruiting?: boolean;
    usbcVerified?: boolean;
  };
  className?: string;
}

export function AthleteCard({ athlete, className }: AthleteCardProps) {
  return (
    <Link href={`/profile/${athlete.id}`}>
      <Card variant="glass" padding="none" hoverable className={cn('group overflow-hidden', className)}>
        {/* Header with photo */}
        <div className="relative h-32 bg-gradient-to-br from-maroon-dark via-[var(--accent-primary)] to-[var(--accent-bright)] overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-card)]" />
        </div>

        {/* Avatar */}
        <div className="relative px-4 -mt-10">
          <div className="w-20 h-20 rounded-full border-[3px] border-[var(--bg-secondary)] overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center shadow-glass-sm ring-2 ring-maroon/20 group-hover:ring-gold/30 transition-all duration-300">
            {athlete.profilePhotoUrl ? (
              <img src={athlete.profilePhotoUrl} alt={`${athlete.firstName} ${athlete.lastName}`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-heading font-bold text-[var(--text-tertiary)]">
                {getInitials(athlete.firstName, athlete.lastName)}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-gold transition-colors duration-300">
                {athlete.firstName} {athlete.lastName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Class of {athlete.classYear} {athlete.state && `\u00B7 ${athlete.state}`}
              </p>
              {athlete.school && (
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{athlete.school}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {athlete.isActivelyRecruiting && <Badge variant="recruit">Recruiting</Badge>}
            {athlete.usbcVerified && <Badge variant="verified">USBC</Badge>}
            {athlete.dominantHand && <Badge variant="outline">{athlete.dominantHand === 'LEFT' ? 'Lefty' : 'Righty'}</Badge>}
            {athlete.style && (
              <Badge variant="outline">{athlete.style === 'TWO_HANDED' ? '2-Hand' : '1-Hand'}</Badge>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[var(--border-secondary)]">
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-gold">
                {athlete.seasonAverage?.toFixed(1) || '--'}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Average</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-[var(--text-primary)]">
                {athlete.highGame || '--'}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">High Game</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-[var(--text-primary)]">
                {athlete.gpa?.toFixed(1) || '--'}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">GPA</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
