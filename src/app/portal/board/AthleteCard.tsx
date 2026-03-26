'use client';

import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type SerializedBoardEntry, type ColumnKey, COLUMN_COLORS } from './types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface AthleteCardProps {
  entry: SerializedBoardEntry;
  onClick: () => void;
}

export function AthleteCard({ entry, onClick }: AthleteCardProps) {
  const columnKey = entry.status as ColumnKey;
  const colors = COLUMN_COLORS[columnKey] ?? COLUMN_COLORS.TRACKING;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: entry.id,
    data: { entry, column: entry.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { athlete } = entry;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group cursor-pointer rounded-xl border-l-[3px] ${colors.border}
        bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]
        p-3 transition-all duration-200 hover:shadow-lg
        ${isDragging ? 'shadow-xl ring-2 ring-gold/30 z-50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[var(--bg-tertiary)]">
          {athlete.profilePhotoUrl ? (
            <Image
              src={athlete.profilePhotoUrl}
              alt={`${athlete.firstName} ${athlete.lastName}`}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-sm font-bold">
              {athlete.firstName[0]}{athlete.lastName[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {athlete.firstName} {athlete.lastName}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] truncate">
            {athlete.school ?? 'Unknown School'} &middot; {athlete.classYear}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-2 flex items-center gap-3 text-xs">
        {athlete.seasonAverage != null && (
          <span className="text-[var(--text-secondary)]">
            <span className="text-[var(--text-tertiary)]">AVG</span>{' '}
            <span className="font-mono font-medium">{athlete.seasonAverage}</span>
          </span>
        )}
        {athlete.revRate != null && (
          <span className="text-[var(--text-secondary)]">
            <span className="text-[var(--text-tertiary)]">REV</span>{' '}
            <span className="font-mono font-medium">{athlete.revRate}</span>
          </span>
        )}
      </div>

      {/* Bottom row: days inactive + last message */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
        <span>
          {entry.daysInactive === 0
            ? 'Active today'
            : `${timeAgo(entry.updatedAt)}`}
        </span>
        {entry.lastMessage && (
          <span className="truncate ml-2">
            💬 {timeAgo(entry.lastMessage.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
