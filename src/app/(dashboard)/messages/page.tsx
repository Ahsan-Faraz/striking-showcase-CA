'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThreadList } from '@/components/messages/ThreadList';
import { Conversation } from '@/components/messages/Conversation';

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

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  readAt: string | null;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real user ID from auth — no hardcoded placeholder
    fetch('/api/athletes/me')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCurrentUserId(data.athlete?.userId ?? null))
      .catch(() => setCurrentUserId(null));
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch {
      // Empty state
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      setMessages([]);
    }
  }, []);

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    fetchMessages(threadId);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 animate-in">
        <p className="section-label mb-1">Communication</p>
        <h1 className="font-heading text-4xl font-bold">Messages</h1>
      </div>

      <div className="glass-card overflow-hidden border-t-2 border-t-gold/30" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Thread List */}
          <div className="w-80 border-r border-[var(--border-primary)] overflow-y-auto bg-[var(--bg-secondary)]/30">
            <div className="p-3 border-b border-[var(--border-primary)]">
              <input className="input" placeholder="Search conversations..." />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" />
              </div>
            ) : (
              <ThreadList
                threads={threads}
                activeThreadId={activeThreadId || undefined}
                currentUserId={currentUserId || ''}
                onSelectThread={handleSelectThread}
              />
            )}
          </div>

          {/* Conversation */}
          <div className="flex-1">
            {activeThreadId && activeThread ? (
              <Conversation
                messages={messages}
                currentUserId={currentUserId || ''}
                threadId={activeThreadId}
                otherPartyName={activeThread.otherParty.name}
                onSendMessage={handleSendMessage}
                sending={sending}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">Your Messages</h3>
                <p className="text-sm text-[var(--text-tertiary)] max-w-sm">
                  Select a conversation to view messages, or wait for a coach to reach out to you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
