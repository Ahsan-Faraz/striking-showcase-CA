'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type SerializedBoardEntry, type ColumnKey, COLUMN_LABELS, COLUMN_COLORS } from './types';
import { AthleteCard } from './AthleteCard';

interface KanbanColumnProps {
  columnKey: ColumnKey;
  entries: SerializedBoardEntry[];
  onCardClick: (entry: SerializedBoardEntry) => void;
}

export function KanbanColumn({ columnKey, entries, onCardClick }: KanbanColumnProps) {
  const colors = COLUMN_COLORS[columnKey];

  const { setNodeRef, isOver } = useDroppable({
    id: columnKey,
    data: { column: columnKey },
  });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full shrink-0">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-xl ${colors.bg}`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
          {COLUMN_LABELS[columnKey]}
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
          {entries.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[200px] p-2 space-y-2 rounded-b-xl transition-colors duration-200
          border border-[var(--border-secondary)] border-t-0
          ${isOver ? 'bg-gold/5 border-gold/30' : 'bg-[var(--bg-secondary)]/50'}
        `}
      >
        <SortableContext
          items={entries.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {entries.map((entry) => (
            <AthleteCard
              key={entry.id}
              entry={entry}
              onClick={() => onCardClick(entry)}
            />
          ))}
        </SortableContext>

        {entries.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-[var(--text-tertiary)] italic">
            {columnKey === 'PASSED'
              ? 'Use status dropdown to move here'
              : 'Drag athletes here'}
          </div>
        )}
      </div>
    </div>
  );
}
