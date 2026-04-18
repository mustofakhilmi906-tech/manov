'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
};

type Props = {
  consultationId: string;
  initialMessages: Message[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  isResolved: boolean;
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
function formatDay(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export default function ChatWindow({
  consultationId, initialMessages, currentUserId, currentUserName, currentUserRole, isResolved,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef<string>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].createdAt : new Date(0).toISOString()
  );

  // Scroll to bottom
  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollBottom(); }, [messages]);

  // Polling every 3 seconds
  useEffect(() => {
    if (isResolved) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat?consultationId=${consultationId}&since=${encodeURIComponent(lastTimestamp.current)}`);
        if (!res.ok) return;
        const newMsgs: Message[] = await res.json();
        if (newMsgs.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map(m => m.id));
            const added = newMsgs.filter(m => !ids.has(m.id));
            return [...prev, ...added];
          });
          lastTimestamp.current = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch {}
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [consultationId, isResolved]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    const text = input.trim();
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId, content: text }),
      });
      if (res.ok) {
        const saved: Message = await res.json();
        setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...saved, createdAt: saved.createdAt } : m));
        lastTimestamp.current = saved.createdAt;
      }
    } finally { setSending(false); }
  };

  // Group messages by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const day = formatDay(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === day) last.msgs.push(m);
    else grouped.push({ date: day, msgs: [m] });
  });

  const ROLE_COLOR: Record<string, string> = {
    MAHASISWA: 'var(--teal)', PUSTAKAWAN: 'var(--amber)', PAKAR: '#7c3aed', ADMIN: '#be123c',
  };

  return (
    <div className="card flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e8e4d8' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: isResolved ? '#94a3b8' : '#22c55e', boxShadow: isResolved ? 'none' : '0 0 0 3px rgba(34,197,94,0.2)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {isResolved ? 'Konsultasi Selesai' : 'Percakapan Langsung'}
          </span>
        </div>
        {!isResolved && (
          <span className="text-xs" style={{ color: 'var(--slate)' }}>🔄 Refresh otomatis tiap 3 detik</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Mulai percakapan</p>
            <p className="text-xs mt-1" style={{ color: 'var(--slate)' }}>Tulis pesanmu di bawah</p>
          </div>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: '#e8e4d8' }} />
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--parchment-dark)', color: 'var(--slate)' }}>{date}</span>
              <div className="flex-1 h-px" style={{ background: '#e8e4d8' }} />
            </div>

            {msgs.map((m, i) => {
              const isMine = m.senderId === currentUserId;
              const showName = i === 0 || msgs[i - 1].senderId !== m.senderId;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div style={{ maxWidth: '75%' }}>
                    {showName && !isMine && (
                      <p className="text-xs font-semibold mb-1 ml-1" style={{ color: ROLE_COLOR[m.senderRole] || 'var(--teal)' }}>
                        {m.senderName}
                      </p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                      style={isMine
                        ? { background: 'var(--teal)', color: 'white' }
                        : { background: 'white', color: 'var(--ink)', border: '1px solid #e8e4d8' }}>
                      {m.content}
                    </div>
                    <p className={`text-xs mt-0.5 ${isMine ? 'text-right' : 'text-left'} ml-1`} style={{ color: 'var(--slate)' }}>
                      {formatTime(m.createdAt)}
                      {m.id.startsWith('opt-') && ' · Mengirim...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isResolved ? (
        <div className="p-4 border-t text-center text-sm" style={{ borderColor: '#e8e4d8', color: 'var(--slate)' }}>
          Konsultasi ini sudah ditutup.
        </div>
      ) : (
        <div className="p-4 border-t" style={{ borderColor: '#e8e4d8' }}>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tulis pesan... (Enter untuk kirim)"
              className="input-base flex-1"
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="btn-primary px-5 disabled:opacity-50"
              style={{ whiteSpace: 'nowrap' }}>
              {sending ? '...' : 'Kirim'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
