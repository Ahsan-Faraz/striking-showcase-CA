'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  pointerWithin,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  type SerializedBoardEntry,
  type ColumnKey,
  type SerializedBoardColumns,
  COLUMN_ORDER,
  COLUMN_LABELS,
} from './types';
import { KanbanColumn } from './KanbanColumn';
import { AthleteCard } from './AthleteCard';
import { DetailPanel } from './DetailPanel';
import { updateBoardStatus, exportBoardCSV } from './actions';

interface KanbanBoardProps {
  initialColumns: SerializedBoardColumns;
  coachId: string;
}

interface DetailPanelMessage {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  readAt: string | null;
}

export function KanbanBoard({ initialColumns, coachId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<SerializedBoardColumns>(initialColumns);
  const [activeCard, setActiveCard] = useState<SerializedBoardEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SerializedBoardEntry | null>(null);
  const [detailMessages, setDetailMessages] = useState<DetailPanelMessage[]>([]);
  const [detailThreadId, setDetailThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterColumn, setFilterColumn] = useState<ColumnKey | 'ALL'>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [searchName, setSearchName] = useState('');

  // CSV export
  const [exporting, setExporting] = useState(false);

  // Configure drag sensors with activation constraints to prevent accidental drags
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // Filtered columns
  const filteredColumns = useMemo(() => {
    const result: SerializedBoardColumns = {
      TRACKING: [],
      CONTACTED: [],
      VISITED: [],
      OFFERED: [],
      COMMITTED: [],
      PASSED: [],
    };

    for (const col of COLUMN_ORDER) {
      if (filterColumn !== 'ALL' && filterColumn !== col) continue;

      result[col] = columns[col].filter((entry) => {
        // Year filter
        if (filterYear !== 'ALL' && entry.athlete.classYear !== parseInt(filterYear)) {
          return false;
        }
        // Name search
        if (searchName.trim()) {
          const name = `${entry.athlete.firstName} ${entry.athlete.lastName}`.toLowerCase();
          if (!name.includes(searchName.toLowerCase().trim())) {
            return false;
          }
        }
        return true;
      });
    }

    return result;
  }, [columns, filterColumn, filterYear, searchName]);

  const visibleColumns = useMemo(
    () =>
      filterColumn === 'ALL'
        ? COLUMN_ORDER
        : COLUMN_ORDER.filter((col) => col === filterColumn),
    [filterColumn],
  );

  // Total count
  const totalOnBoard = useMemo(
    () => COLUMN_ORDER.reduce((sum, col) => sum + columns[col].length, 0),
    [columns],
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const entry = event.active.data.current?.entry as SerializedBoardEntry | undefined;
    setActiveCard(entry ?? null);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveCard(null);
      const { active, over } = event;
      if (!over) return;

      const entry = active.data.current?.entry as SerializedBoardEntry | undefined;
      if (!entry) return;

      // Determine target column
      let targetColumn: ColumnKey | null = null;

      // Check if dropped on a column directly
      if (COLUMN_ORDER.includes(over.id as ColumnKey)) {
        targetColumn = over.id as ColumnKey;
      }
      // Check if dropped on another card - use that card's column
      else if (over.data.current?.entry) {
        targetColumn = (over.data.current.entry as SerializedBoardEntry).status as ColumnKey;
      }

      if (!targetColumn) return;
      if (targetColumn === entry.status) return;

      // RULE: Cannot drag into PASSED — must use dropdown
      if (targetColumn === 'PASSED') {
        setError('Use the status dropdown to move athletes to "Passed"');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Optimistic update
      const prevColumns = { ...columns };
      setColumns((prev) => {
        const newCols = { ...prev };
        const sourceCol = entry.status as ColumnKey;

        // Remove from source
        newCols[sourceCol] = newCols[sourceCol].filter((e) => e.id !== entry.id);

        // Add to target
        const updatedEntry = { ...entry, status: targetColumn as string };
        newCols[targetColumn as ColumnKey] = [...newCols[targetColumn as ColumnKey], updatedEntry];

        return newCols;
      });

      // Also update selected entry if it's the one being moved
      if (selectedEntry?.id === entry.id) {
        setSelectedEntry((prev) => prev ? { ...prev, status: targetColumn as string } : null);
      }

      // API call
      try {
        const result = await updateBoardStatus(entry.id, targetColumn);
        if (result.error) {
          // Revert
          setColumns(prevColumns);
          setError(result.error);
          setTimeout(() => setError(null), 3000);
        }
      } catch {
        setColumns(prevColumns);
        setError('Failed to update status');
        setTimeout(() => setError(null), 3000);
      }
    },
    [columns, selectedEntry],
  );

  // Handle card click — open detail panel
  const handleCardClick = useCallback(async (entry: SerializedBoardEntry) => {
    setSelectedEntry(entry);
    setDetailMessages([]);
    setDetailThreadId(null);

    // Fetch detail data from API
    try {
      const res = await fetch(`/api/portal/board/${entry.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.thread) {
          setDetailMessages(data.thread.messages ?? []);
          setDetailThreadId(data.thread.id);
        }
      }
    } catch {
      // Detail loading failed — panel still shows with existing data
    }
  }, []);

  // Handle status change from detail panel
  const handleDetailStatusChange = useCallback(
    (entryId: string, newStatus: ColumnKey) => {
      setColumns((prev) => {
        const newCols = { ...prev };
        let entry: SerializedBoardEntry | null = null;

        // Find and remove from current column
        for (const col of COLUMN_ORDER) {
          const idx = newCols[col].findIndex((e) => e.id === entryId);
          if (idx !== -1) {
            entry = { ...newCols[col][idx], status: newStatus };
            newCols[col] = newCols[col].filter((_, i) => i !== idx);
            break;
          }
        }

        // Add to new column
        if (entry) {
          newCols[newStatus] = [...newCols[newStatus], entry];
        }

        return newCols;
      });

      if (selectedEntry?.id === entryId) {
        setSelectedEntry((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    },
    [selectedEntry],
  );

  // Handle remove from detail panel
  const handleDetailRemove = useCallback(
    (entryId: string) => {
      setColumns((prev) => {
        const newCols = { ...prev };
        for (const col of COLUMN_ORDER) {
          newCols[col] = newCols[col].filter((e) => e.id !== entryId);
        }
        return newCols;
      });
      setSelectedEntry(null);
    },
    [],
  );

  // CSV export
  const handleExportCSV = useCallback(async () => {
    setExporting(true);
    try {
      const result = await exportBoardCSV();
      if (result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `striking-showcase-board-${date}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Recruiting Board
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            {totalOnBoard} athlete{totalOnBoard !== 1 ? 's' : ''} on your board
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting || totalOnBoard === 0}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gold/20 text-gold hover:bg-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
        {/* Column filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Column
          </label>
          <select
            value={filterColumn}
            onChange={(e) => setFilterColumn(e.target.value as ColumnKey | 'ALL')}
            className="input text-xs py-1 px-2"
          >
            <option value="ALL">All</option>
            {COLUMN_ORDER.map((col) => (
              <option key={col} value={col}>
                {COLUMN_LABELS[col]}
              </option>
            ))}
          </select>
        </div>

        {/* Grad year filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Grad Year
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="input text-xs py-1 px-2"
          >
            <option value="ALL">All</option>
            {[2025, 2026, 2027, 2028, 2029].map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Name search */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Search
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name..."
            className="input text-xs py-1 px-2 flex-1"
          />
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Kanban columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {visibleColumns.map((col) => (
            <KanbanColumn
              key={col}
              columnKey={col}
              entries={filteredColumns[col]}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard ? (
            <div className="opacity-90 rotate-2 scale-105">
              <AthleteCard
                entry={activeCard}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {totalOnBoard === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Your board is empty
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            Search for athletes and add them to start building your recruiting pipeline.
          </p>
          <a
            href="/portal/search"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search Athletes
          </a>
        </div>
      )}

      {/* Detail panel overlay */}
      {selectedEntry && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedEntry(null)}
          />
          <DetailPanel
            entry={selectedEntry}
            messages={detailMessages}
            threadId={detailThreadId}
            onClose={() => setSelectedEntry(null)}
            onStatusChange={handleDetailStatusChange}
            onRemove={handleDetailRemove}
          />
        </>
      )}
    </div>
  );
}
