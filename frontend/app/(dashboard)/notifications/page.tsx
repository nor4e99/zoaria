'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, MessageSquare, Calendar, Syringe, AlertCircle,
  CheckCheck, Trash2, Dot, Settings
} from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

/* ─── Icon map ───────────────────────────────────────────────────────────── */
const NOTIF_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  message:      { icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-100' },
  appointment:  { icon: Calendar,      color: 'text-brand-600',  bg: 'bg-brand-100' },
  vaccination:  { icon: Syringe,       color: 'text-green-600',  bg: 'bg-green-100' },
  deworming:    { icon: AlertCircle,   color: 'text-amber-600',  bg: 'bg-amber-100' },
  consultation: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  system:       { icon: Bell,          color: 'text-obsidian-600', bg: 'bg-obsidian-100' },
};

function groupByDate(notifications: any[]) {
  const groups: Record<string, any[]> = {};
  for (const n of notifications) {
    const d = parseISO(n.created_at);
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }
  return groups;
}

function NotifItem({ notif, onRead }: { notif: any; onRead: (id: number) => void }) {
  const cfg = NOTIF_CONFIG[notif.notification_type] || NOTIF_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group',
        notif.read
          ? 'bg-white border-sage-100 hover:border-sage-200'
          : 'bg-brand-50/40 border-brand-200 hover:border-brand-300'
      )}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
        <Icon className={cn('w-5 h-5', cfg.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold',
            notif.read ? 'text-obsidian-700' : 'text-obsidian-900')}>
            {notif.title}
          </p>
          <span className="text-xs text-obsidian-400 shrink-0 mt-0.5">
            {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className={cn('text-sm mt-0.5 leading-relaxed',
          notif.read ? 'text-obsidian-400' : 'text-obsidian-600')}>
          {notif.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-1.5" />
      )}
    </motion.div>
  );
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { setNotifications, setUnreadCount, markRead, markAllRead } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-full'],
    queryFn: () => notificationsApi.list().then(r => r.data.results || r.data),
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  }, [data]);

  const markOneMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: (_, id) => {
      markRead(id);
      qc.invalidateQueries({ queryKey: ['notifications-full'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      markAllRead();
      qc.invalidateQueries({ queryKey: ['notifications-full'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifications = data || [];
  const unread = notifications.filter((n: any) => !n.read).length;
  const groups = groupByDate(notifications);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">Notifications</h1>
          <p className="text-obsidian-500 mt-1">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Unread', 'Messages', 'Appointments', 'Reminders'].map(f => (
          <button key={f}
            className="px-3 py-1.5 rounded-xl border border-sage-200 bg-white text-sm font-medium
                       text-obsidian-600 hover:border-brand-300 hover:text-brand-700 transition-all">
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-sage-400" />
          </div>
          <h3 className="font-semibold text-obsidian-900 mb-1">No notifications yet</h3>
          <p className="text-obsidian-500 text-sm">
            We'll notify you about appointments, messages, and reminders
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <p className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-3 px-1">
                {dateLabel}
              </p>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {items.map((notif: any) => (
                    <NotifItem
                      key={notif.id}
                      notif={notif}
                      onRead={(id) => markOneMutation.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
