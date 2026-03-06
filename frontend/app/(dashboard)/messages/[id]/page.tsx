'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, Paperclip, Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

interface ChatMessage {
  id: number;
  sender_id: number;
  sender_email: string;
  text: string;
  file_url?: string;
  timestamp: string;
}

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout>();

  const { data: conversation } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => chatApi.conversations().then((r) => {
      const convs = r.data.results || r.data;
      return convs.find((c: any) => String(c.id) === id);
    }),
  });

  // WebSocket connection
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/ws/chat/${id}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === 'typing') {
        setIsTyping(data.is_typing);
        if (data.is_typing) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    return () => ws.close();
  }, [id]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendTyping = useCallback((typing: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: typing }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTyping(false), 1500);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'message', text }));
    setInput('');
    sendTyping(false);
  };

  const isOwner = user?.role === 'owner';
  const otherName = conversation
    ? (isOwner ? `Dr. ${conversation.vet_name}` : conversation.owner_name)
    : 'Loading...';

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-sage-200">
        <Link href="/messages" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
          <span className="font-bold text-brand-700">{otherName?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-obsidian-900">{otherName}</p>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', connected ? 'bg-green-400' : 'bg-obsidian-300')} />
            <p className="text-xs text-obsidian-500">{connected ? 'Connected' : 'Connecting...'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && connected && (
          <div className="text-center py-12 text-obsidian-400">
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === user?.id;
          const showSender = i === 0 || messages[i-1]?.sender_id !== msg.sender_id;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
            >
              <div className={cn('max-w-[75%]', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                {!isMe && showSender && (
                  <span className="text-xs text-obsidian-400 px-1">{msg.sender_email}</span>
                )}
                <div className={cn(
                  'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  isMe
                    ? 'bg-brand-500 text-white rounded-br-sm'
                    : 'bg-white border border-sage-200 text-obsidian-800 rounded-bl-sm'
                )}>
                  {msg.text}
                  {msg.file_url && (
                    <a href={msg.file_url} target="_blank" className={cn('block mt-1 underline text-xs', isMe ? 'text-brand-100' : 'text-brand-600')}>
                      📎 Attachment
                    </a>
                  )}
                </div>
                <span className={cn('text-xs text-obsidian-400 px-1', isMe ? 'text-right' : '')}>
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-sage-200 rounded-2xl px-4 py-2.5 flex gap-1 items-center">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-obsidian-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-sage-200">
        <div className="flex gap-3 items-center">
          <button className="p-2.5 rounded-xl hover:bg-sage-50 text-obsidian-400 hover:text-obsidian-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="input-base flex-1"
            disabled={!connected}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected}
            className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
