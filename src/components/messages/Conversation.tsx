'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeTime } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  readAt: string | null;
}

interface ConversationProps {
  messages: Message[];
  currentUserId: string;
  threadId: string;
  otherPartyName: string;
  onSendMessage: (content: string) => void;
  sending?: boolean;
}

export function Conversation({
  messages,
  currentUserId,
  threadId,
  otherPartyName,
  onSendMessage,
  sending = false,
}: ConversationProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Group messages by date
  let lastDate = '';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <span className="text-xs font-heading font-bold text-[var(--text-tertiary)]">
            {otherPartyName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{otherPartyName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--text-tertiary)]">Start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          const messageDate = new Date(msg.createdAt).toLocaleDateString();
          const showDateSeparator = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                    {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              <div className={cn('flex mb-2', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    isMine
                      ? 'bg-[var(--accent-primary)] text-white rounded-br-md'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-bl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
                    <span className={cn('text-[10px]', isMine ? 'text-white/60' : 'text-[var(--text-tertiary)]')}>
                      {formatRelativeTime(msg.createdAt)}
                    </span>
                    {isMine && msg.readAt && (
                      <svg className="w-3 h-3 text-white/60" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.354 4.354a.5.5 0 00-.708-.708L5 10.293 2.354 7.646a.5.5 0 10-.708.708l3 3a.5.5 0 00.708 0l7-7z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="input resize-none min-h-[44px] max-h-32"
            style={{ height: 'auto' }}
          />
          <Button type="submit" variant="primary" size="sm" loading={sending} disabled={!input.trim()}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  );
}
