'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';

export interface SearchAthleteResult {
  id: string;
  slug: string | null;
  firstName: string;
  lastName: string;
  classYear: number;
  state: string | null;
  school: string | null;
  profilePhotoUrl: string | null;
  seasonAverage: number | null;
  highGame: number | null;
  highSeries: number | null;
  revRate: number | null;
  dominantHand: string | null;
  style: string | null;
  gpa: number | null;
  preferredDivisions: string[];
  isActivelyRecruiting: boolean;
  usbcVerified: boolean;
  updatedAt: string;
  hasVideo: boolean;
  boardStatus: string | null;
}

interface SearchAthleteCardProps {
  athlete: SearchAthleteResult;
  onAddToBoard: (athleteId: string, status: string) => void;
  isCoachVerified: boolean;
}

const BOARD_STATUSES = [
  { value: 'TRACKING', label: 'Tracking' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'VISITED', label: 'Visited' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'COMMITTED', label: 'Committed' },
  { value: 'PASSED', label: 'Passed' },
];

const STATUS_COLORS: Record<string, string> = {
  TRACKING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONTACTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  VISITED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  OFFERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMMITTED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PASSED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function SearchAthleteCard({ athlete, onAddToBoard, isCoachVerified }: SearchAthleteCardProps) {
  const profileUrl = athlete.slug ? `/${athlete.slug}` : `/athlete/${athlete.id}`;

  return (
    <Card variant="glass" padding="none" hoverable className="group overflow-hidden relative">
      {/* Board status badge */}
      {athlete.boardStatus && (
        <div className="absolute top-2 right-2 z-10">
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border', STATUS_COLORS[athlete.boardStatus] || STATUS_COLORS.TRACKING)}>
            {athlete.boardStatus}
          </span>
        </div>
      )}

      {/* Header with photo */}
      <Link href={profileUrl}>
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
      </Link>

      {/* Info */}
      <div className="px-4 pb-4 pt-2">
        <Link href={profileUrl}>
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
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {athlete.isActivelyRecruiting && <Badge variant="recruit">Recruiting</Badge>}
          {athlete.usbcVerified && <Badge variant="verified">USBC</Badge>}
          {athlete.hasVideo && <Badge variant="outline">Video</Badge>}
          {athlete.dominantHand && <Badge variant="outline">{athlete.dominantHand === 'LEFT' ? 'Lefty' : 'Righty'}</Badge>}
          {athlete.preferredDivisions.slice(0, 2).map((d) => (
            <Badge key={d} variant="division">{d}</Badge>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-[var(--border-secondary)]">
          <div className="text-center">
            <p className="text-base font-heading font-bold text-gold">
              {athlete.seasonAverage?.toFixed(1) || '--'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">Avg</p>
          </div>
          <div className="text-center">
            <p className="text-base font-heading font-bold text-[var(--text-primary)]">
              {athlete.highGame || '--'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">High</p>
          </div>
          <div className="text-center">
            <p className="text-base font-heading font-bold text-[var(--text-primary)]">
              {athlete.revRate || '--'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">Rev</p>
          </div>
          <div className="text-center">
            <p className="text-base font-heading font-bold text-[var(--text-primary)]">
              {athlete.gpa?.toFixed(1) || '--'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">GPA</p>
          </div>
        </div>

        {/* Add to Board / Board Status */}
        <div className="mt-3 pt-3 border-t border-[var(--border-secondary)]">
          {athlete.boardStatus ? (
            <select
              className="input py-1.5 text-xs w-full"
              value={athlete.boardStatus}
              onChange={(e) => onAddToBoard(athlete.id, e.target.value)}
              disabled={!isCoachVerified}
            >
              {BOARD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          ) : (
            <select
              className="input py-1.5 text-xs w-full"
              value=""
              onChange={(e) => {
                if (e.target.value) onAddToBoard(athlete.id, e.target.value);
              }}
              disabled={!isCoachVerified}
            >
              <option value="">+ Add to Board</option>
              {BOARD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </Card>
  );
}

/** List/table view row for search results */
export function AthleteListRow({ athlete, onAddToBoard, isCoachVerified }: SearchAthleteCardProps) {
  const profileUrl = athlete.slug ? `/${athlete.slug}` : `/athlete/${athlete.id}`;

  return (
    <tr className="border-b border-[var(--border-secondary)] hover:bg-[var(--bg-secondary)]/50 transition-colors">
      <td className="py-3 px-4">
        <Link href={profileUrl} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-tertiary)] flex-shrink-0 flex items-center justify-center">
            {athlete.profilePhotoUrl ? (
              <img src={athlete.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-heading font-bold text-[var(--text-tertiary)]">
                {getInitials(athlete.firstName, athlete.lastName)}
              </span>
            )}
          </div>
          <div>
            <p className="font-heading font-bold text-[var(--text-primary)] group-hover:text-gold transition-colors text-sm">
              {athlete.firstName} {athlete.lastName}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {athlete.school} {athlete.state && `\u00B7 ${athlete.state}`}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-3 px-3 text-center text-sm text-[var(--text-secondary)]">{athlete.classYear}</td>
      <td className="py-3 px-3 text-center text-sm font-bold text-gold">{athlete.seasonAverage?.toFixed(1) || '--'}</td>
      <td className="py-3 px-3 text-center text-sm text-[var(--text-secondary)]">{athlete.highGame || '--'}</td>
      <td className="py-3 px-3 text-center text-sm text-[var(--text-secondary)]">{athlete.revRate || '--'}</td>
      <td className="py-3 px-3 text-center text-sm text-[var(--text-secondary)]">{athlete.gpa?.toFixed(1) || '--'}</td>
      <td className="py-3 px-3 text-center">
        {athlete.dominantHand && (
          <span className="text-xs text-[var(--text-tertiary)]">{athlete.dominantHand === 'LEFT' ? 'L' : 'R'}</span>
        )}
      </td>
      <td className="py-3 px-3 text-center">
        <div className="flex justify-center gap-1 flex-wrap">
          {athlete.isActivelyRecruiting && <Badge variant="recruit">R</Badge>}
          {athlete.usbcVerified && <Badge variant="verified">U</Badge>}
          {athlete.hasVideo && <Badge variant="outline">V</Badge>}
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        {athlete.boardStatus ? (
          <select
            className="input py-1 px-2 text-xs"
            value={athlete.boardStatus}
            onChange={(e) => onAddToBoard(athlete.id, e.target.value)}
            disabled={!isCoachVerified}
          >
            {BOARD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        ) : (
          <select
            className="input py-1 px-2 text-xs"
            value=""
            onChange={(e) => {
              if (e.target.value) onAddToBoard(athlete.id, e.target.value);
            }}
            disabled={!isCoachVerified}
          >
            <option value="">+ Board</option>
            {BOARD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
      </td>
    </tr>
  );
}
