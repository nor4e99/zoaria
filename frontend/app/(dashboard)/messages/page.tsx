'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Clock } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.conversations().then((r) => r.data.results || r.data),
  });

  const isOwner = user?.role === 'owner';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-obsidian-900">Messages</h1>
        <p className="text-obsidian-500 mt-1">Your consultations and conversations</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-obsidian-300 mx-auto mb-4" />
          <h3 className="font-semibold text-obsidian-900 mb-2">No conversations yet</h3>
          <p className="text-obsidian-500 text-sm mb-4">
            {isOwner ? 'Find a veterinarian to start chatting' : 'Waiting for owners to contact you'}
          </p>
          {isOwner && (
            <Link href="/find-vet" className="btn-primary inline-flex items-center gap-2 text-sm">
              Find a Vet
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any, i: number) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-sage-200
                           hover:border-brand-300 hover:shadow-card transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-brand-700">
                    {(isOwner ? conv.vet_name : conv.owner_name)?.[0]?.toUpperCase() || 'Z'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-obsidian-900">
                    {isOwner ? `Dr. ${conv.vet_name}` : conv.owner_name}
                  </p>
                  {conv.last_message && (
                    <p className="text-sm text-obsidian-500 truncate">{conv.last_message.text}</p>
                  )}
                </div>
                {conv.last_message && (
                  <div className="flex items-center gap-1 text-xs text-obsidian-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(conv.last_message.timestamp), { addSuffix: true })}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
