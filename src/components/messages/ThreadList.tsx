'use client';

import { cn, formatRelativeTime, getInitials } from '@/lib/utils';

interface Thread {
  id: string;
  lastMessageAt: string;
  otherParty: {
    name: string;
    school?: string;
    photoUrl?: string | null;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    readAt: string | null;
  };
  unreadCount: number;
}

interface ThreadListProps {
  threads: Thread[];
  activeThreadId?: string;
  currentUserId: string;
  onSelectThread: (threadId: string) => void;
}

export function ThreadList({ threads, activeThreadId, currentUserId, onSelectThread }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <svg className="w-12 h-12 text-[var(--text-tertiary)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <p className="text-sm text-[var(--text-secondary)] text-center">No messages yet</p>
        <p className="text-xs text-[var(--text-tertiary)] text-center mt-1">
          Messages from coaches will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {threads.map((thread) => {
        const isActive = thread.id === activeThreadId;
        const hasUnread = thread.unreadCount > 0;

        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[var(--border-secondary)]',
              isActive ? 'bg-[var(--accent-primary)]/10' : 'hover:bg-[var(--bg-card)]'
            )}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
                {thread.otherParty.photoUrl ? (
                  <img src={thread.otherParty.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-heading font-bold text-[var(--text-tertiary)]">
                    {thread.otherParty.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                )}
              </div>
              {hasUnread && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--accent-bright)] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{thread.unreadCount}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm truncate', hasUnread ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-primary)]')}>
                  {thread.otherParty.name}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 ml-2">
                  {formatRelativeTime(thread.lastMessageAt)}
                </span>
              </div>
              {thread.otherParty.school && (
                <p className="text-[10px] text-[var(--text-tertiary)]">{thread.otherParty.school}</p>
              )}
              {thread.lastMessage && (
                <p className={cn('text-xs truncate mt-0.5', hasUnread ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]')}>
                  {thread.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                  {thread.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
