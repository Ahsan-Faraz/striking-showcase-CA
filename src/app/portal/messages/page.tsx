"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ThreadList } from "@/components/messages/ThreadList";
import { Conversation } from "@/components/messages/Conversation";

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
  athleteSlug?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  senderName?: string;
  senderLabel?: string | null;
  createdAt: string;
  readAt: string | null;
}

export default function CoachMessagesPage() {
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get("thread");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialThreadId,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const threadPollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch coach user info once on mount
  useEffect(() => {
    // userId is returned by the threads endpoint — set from first fetch
  }, []);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.userId) setCurrentUserId(data.userId);
        const mapped: Thread[] = (data.threads || []).map(
          (t: Record<string, any>) => ({
            id: t.id,
            lastMessageAt: t.lastMessageAt,
            otherParty: {
              name: t.athlete?.name || "Athlete",
              school: t.athlete?.school || undefined,
              photoUrl: t.athlete?.photoUrl || null,
            },
            lastMessage: t.lastMessage || undefined,
            unreadCount: t.unreadCount ?? 0,
            athleteSlug: t.athlete?.slug || undefined,
          }),
        );
        setThreads(mapped);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    threadPollRef.current = setInterval(fetchThreads, 8000);
    return () => {
      if (threadPollRef.current) clearInterval(threadPollRef.current);
    };
  }, [fetchThreads]);

  // Auto-load thread from URL param
  useEffect(() => {
    if (initialThreadId && threads.length > 0 && !activeThreadId) {
      setActiveThreadId(initialThreadId);
      fetchMessages(initialThreadId);
    }
  }, [initialThreadId, threads]);

  // Auto-poll active thread
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeThreadId) {
      pollRef.current = setInterval(
        () => fetchMessages(activeThreadId, true),
        4000,
      );
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeThreadId]);

  const fetchMessages = async (threadId: string, silent = false) => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const newMsgs = data.messages || [];
          if (
            prev.length === newMsgs.length &&
            prev[prev.length - 1]?.id === newMsgs[newMsgs.length - 1]?.id
          ) {
            return prev;
          }
          return newMsgs;
        });
      }
    } catch {
      if (!silent) setMessages([]);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    fetchMessages(threadId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId || !currentUserId) return;

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      content,
      senderId: currentUserId,
      senderRole: "COACH",
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessageAt: new Date().toISOString(),
              lastMessage: { content, senderId: currentUserId, readAt: null },
            }
          : t,
      ),
    );

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? msg : m)),
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const filteredThreads = searchQuery
    ? threads.filter((t) =>
        t.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : threads;
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 animate-in">
        <p className="section-label mb-1">Communication</p>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-4xl font-bold">Messages</h1>
          {totalUnread > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold">
              {totalUnread}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Conversations with athletes you&apos;re recruiting
        </p>
      </div>

      <div
        className="glass-card overflow-hidden border-t-2 border-t-gold/30"
        style={{ height: "calc(100vh - 240px)" }}
      >
        <div className="flex h-full">
          {/* Thread List */}
          <div className="w-80 border-r border-[var(--border-primary)] overflow-y-auto bg-[var(--bg-secondary)]/30">
            <div className="p-3 border-b border-[var(--border-primary)]">
              <input
                className="input"
                placeholder="Search athletes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" />
              </div>
            ) : (
              <ThreadList
                threads={filteredThreads}
                activeThreadId={activeThreadId || undefined}
                currentUserId={currentUserId || ""}
                onSelectThread={handleSelectThread}
              />
            )}
          </div>

          {/* Conversation */}
          <div className="flex-1">
            {activeThreadId && activeThread ? (
              <Conversation
                messages={messages}
                currentUserId={currentUserId || ""}
                threadId={activeThreadId}
                otherPartyName={activeThread.otherParty.name}
                onSendMessage={handleSendMessage}
                sending={sending}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mb-5">
                  <svg
                    className="w-10 h-10 text-gold/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Your Recruiting Messages
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] max-w-sm">
                  Select a conversation or visit an athlete&apos;s profile and
                  click &quot;Message Athlete&quot; to start recruiting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
