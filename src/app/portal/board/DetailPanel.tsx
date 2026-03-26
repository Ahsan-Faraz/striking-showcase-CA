'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  type SerializedBoardEntry,
  type ColumnKey,
  COLUMN_ORDER,
  COLUMN_LABELS,
  COLUMN_COLORS,
} from './types';
import { updateBoardStatus, updateBoardNotes, removeFromBoard, sendQuickReply } from './actions';
import { RichTextEditor } from './RichTextEditor';

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
  return `${weeks} weeks ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const ACTION_LABELS: Record<string, string> = {
  added_to_tracking: 'Added to Tracking',
  added_to_contacted: 'Added to Contacted',
  added_to_visited: 'Added to Visited',
  added_to_offered: 'Added to Offered',
  added_to_committed: 'Added to Committed',
  added_to_passed: 'Added to Passed',
  moved_to_tracking: 'Moved to Tracking',
  moved_to_contacted: 'Moved to Contacted',
  moved_to_visited: 'Moved to Visited',
  moved_to_offered: 'Moved to Offered',
  moved_to_committed: 'Moved to Committed',
  moved_to_passed: 'Moved to Passed',
  message_sent: 'Message sent',
  note_updated: 'Notes updated',
  removed: 'Removed from board',
};

interface DetailPanelMessage {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  readAt: string | null;
}

interface DetailPanelProps {
  entry: SerializedBoardEntry;
  messages: DetailPanelMessage[];
  threadId: string | null;
  onClose: () => void;
  onStatusChange: (entryId: string, newStatus: ColumnKey) => void;
  onRemove: (entryId: string) => void;
}

export function DetailPanel({
  entry,
  messages,
  threadId,
  onClose,
  onStatusChange,
  onRemove,
}: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'notes' | 'activity' | 'messages'>('stats');
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const { athlete } = entry;

  useEffect(() => {
    setNotes(entry.notes ?? '');
    setConfirmRemove(false);
  }, [entry.id, entry.notes]);

  const handleStatusChange = useCallback(
    async (newStatus: ColumnKey) => {
      if (newStatus === entry.status) return;
      setStatusUpdating(true);
      try {
        const result = await updateBoardStatus(entry.id, newStatus);
        if (result.error) {
          console.error(result.error);
        } else {
          onStatusChange(entry.id, newStatus);
        }
      } finally {
        setStatusUpdating(false);
      }
    },
    [entry.id, entry.status, onStatusChange],
  );

  const handleNoteSave = useCallback(
    async (content: string) => {
      setNoteSaving(true);
      setNoteSaved(false);
      try {
        const result = await updateBoardNotes(entry.id, content);
        if (!result.error) {
          setNoteSaved(true);
          setTimeout(() => setNoteSaved(false), 2000);
        }
      } finally {
        setNoteSaving(false);
      }
    },
    [entry.id],
  );

  const handleReply = useCallback(async () => {
    if (!replyContent.trim()) return;
    setReplySending(true);
    try {
      const result = await sendQuickReply(athlete.id, replyContent);
      if (!result.error) {
        setReplyContent('');
      }
    } finally {
      setReplySending(false);
    }
  }, [athlete.id, replyContent]);

  const handleRemove = useCallback(async () => {
    const result = await removeFromBoard(entry.id);
    if (!result.error) {
      onRemove(entry.id);
    }
  }, [entry.id, onRemove]);

  const tabs = [
    { key: 'stats', label: 'Stats' },
    { key: 'notes', label: 'Notes' },
    { key: 'activity', label: 'Activity' },
    { key: 'messages', label: 'Messages' },
  ] as const;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {!confirmRemove ? (
              <button
                onClick={() => setConfirmRemove(true)}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleRemove}
                  className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmRemove(false)}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Athlete header */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-[var(--bg-tertiary)]">
            {athlete.profilePhotoUrl ? (
              <Image
                src={athlete.profilePhotoUrl}
                alt={`${athlete.firstName} ${athlete.lastName}`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-lg font-bold">
                {athlete.firstName[0]}{athlete.lastName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">
              {athlete.firstName} {athlete.lastName}
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">
              {athlete.school ?? 'Unknown'} &middot; Class of {athlete.classYear}
            </p>
            {athlete.slug && (
              <Link
                href={`/${athlete.slug}`}
                target="_blank"
                className="text-xs text-gold hover:text-gold-light transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                View Full Profile →
              </Link>
            )}
          </div>
        </div>

        {/* Status dropdown */}
        <div className="mt-3">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
            Board Status
          </label>
          <select
            value={entry.status}
            onChange={(e) => handleStatusChange(e.target.value as ColumnKey)}
            disabled={statusUpdating}
            className="input text-sm py-1.5 w-full"
          >
            {COLUMN_ORDER.map((col) => (
              <option key={col} value={col}>
                {COLUMN_LABELS[col]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-primary)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs font-semibold uppercase tracking-wider py-2.5 transition-colors ${
              activeTab === tab.key
                ? 'text-gold border-b-2 border-gold'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Season Avg" value={athlete.seasonAverage} />
              <StatCard label="High Game" value={athlete.highGame} />
              <StatCard label="Rev Rate" value={athlete.revRate} suffix=" RPM" />
              <StatCard label="Ball Speed" value={athlete.ballSpeed} suffix=" mph" />
              <StatCard label="GPA" value={athlete.gpa} />
              <StatCard label="Handed" value={athlete.dominantHand} />
            </div>
            {athlete.preferredDivisions.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                  Division Interest
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {athlete.preferredDivisions.map((div) => (
                    <span
                      key={div}
                      className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold"
                    >
                      {div}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {athlete.state && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                  State
                </p>
                <p className="text-sm text-[var(--text-primary)]">{athlete.state}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                Coach Notes
              </p>
              {noteSaving && (
                <span className="text-[10px] text-[var(--text-tertiary)]">Saving...</span>
              )}
              {noteSaved && (
                <span className="text-[10px] text-green-400">Saved ✓</span>
              )}
            </div>
            <RichTextEditor
              content={notes}
              onBlur={(content: string) => {
                setNotes(content);
                handleNoteSave(content);
              }}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            {entry.activities.length > 0 ? (
              entry.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-2 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[var(--text-secondary)]">
                      {ACTION_LABELS[activity.action] ?? activity.action}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] italic">
                No activity recorded yet.
              </p>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            {messages.length > 0 ? (
              <>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-sm ${
                        msg.senderRole === 'COACH'
                          ? 'bg-gold/10 ml-6'
                          : 'bg-white/5 mr-6'
                      }`}
                    >
                      <p className="text-[var(--text-primary)]">{msg.content}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                        {msg.senderRole === 'COACH' ? 'You' : 'Athlete'} &middot; {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
                {threadId && (
                  <Link
                    href={`/portal/messages/${threadId}`}
                    className="text-xs text-gold hover:text-gold-light transition-colors inline-flex items-center gap-1"
                  >
                    View Full Thread →
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] italic">
                No messages yet. Send the first message below.
              </p>
            )}

            {/* Quick reply */}
            <div className="border-t border-[var(--border-secondary)] pt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type a quick reply..."
                rows={3}
                className="input w-full text-sm resize-none"
                maxLength={5000}
              />
              <button
                onClick={handleReply}
                disabled={replySending || !replyContent.trim()}
                className="mt-2 w-full py-2 rounded-xl text-sm font-semibold bg-gold/20 text-gold hover:bg-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {replySending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
        {label}
      </p>
      <p className="font-mono text-lg font-medium text-[var(--text-primary)]">
        {value != null ? `${value}${suffix}` : '—'}
      </p>
    </div>
  );
}
