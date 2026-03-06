'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PawPrint, Calendar, Stethoscope, Search, Plus, Bell, TrendingUp, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { petsApi, calendarApi, notificationsApi } from '@/lib/api';
import { useT } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { BMIIndicator } from '@/components/pets/BMIIndicator';

const AVATARS: Record<string, string> = {
  dog: '🐕', cat: '🐈', horse: '🐎', rabbit: '🐇',
  guinea: '🐹', bird: '🦜', fish: '🐠', turtle: '🐢',
};

function PetCard({ pet }: { pet: any }) {
  const status = pet.weight_status;
  const statusStyles = {
    healthy:     'border-green-200 bg-green-50 text-green-700',
    overweight:  'border-amber-200 bg-amber-50 text-amber-700',
    underweight: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <Link href={`/pets/${pet.id}`}
      className="zoaria-card hover:shadow-card-hover transition-all group flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
        {pet.photo_url
          ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover rounded-2xl" />
          : AVATARS[pet.avatar_type] || '🐾'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-obsidian-900 truncate">{pet.name}</p>
        <p className="text-sm text-obsidian-400">{pet.species_name} {pet.breed_name && `· ${pet.breed_name}`}</p>
      </div>
      {status && (
        <span className={cn('badge border shrink-0 capitalize', statusStyles[status as keyof typeof statusStyles])}>
          {status}
        </span>
      )}
    </Link>
  );
}

function QuickAction({ icon: Icon, label, href, color }: {
  icon: any; label: string; href: string; color: string;
}) {
  return (
    <Link href={href}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-sage-200
                 hover:border-brand-300 hover:shadow-card transition-all group">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-colors', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-obsidian-600 text-center leading-tight">{label}</span>
    </Link>
  );
}

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${time}, ${name?.split(' ')[0] || 'there'}! 👋`;
}

const REMINDER_ICONS: Record<string, string> = {
  vaccination: '💉', deworming: '🐛', appointment: '📅', medication: '💊', custom: '📌',
};

export default function DashboardPage() {
  const t = useT();
  const { user } = useAuthStore();
  const { setNotifications, setUnreadCount } = useNotificationStore();

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsApi.list().then((r) => r.data.results || r.data),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => calendarApi.reminders().then((r) => r.data.results || r.data),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => calendarApi.appointments().then((r) => r.data.results || r.data),
  });

  // Load notifications
  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const [nRes, cRes] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(nRes.data.results || nRes.data);
      setUnreadCount(cRes.data.unread_count);
      return nRes.data;
    },
  });

  const upcomingReminders = reminders
    .filter((r: any) => !r.sent)
    .sort((a: any, b: any) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())
    .slice(0, 5);

  const upcomingAppts = appointments
    .filter((a: any) => a.status !== 'cancelled')
    .slice(0, 3);

  const plan = user?.subscription?.plan || 'basic';
  const canAddMorePets = plan === 'premium' || (plan === 'standard' && pets.length < 2) || (plan === 'basic' && pets.length < 1);

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn(0)} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">
            {greeting(user?.profile?.name || '')}
          </h1>
          <p className="text-obsidian-500 mt-1">
            {pets.length > 0
              ? `You have ${pets.length} pet${pets.length > 1 ? 's' : ''} in your care`
              : 'Start by adding your first pet'}
          </p>
        </div>
        <div className={cn('badge border capitalize px-3 py-1.5 text-sm',
          plan === 'premium' ? 'bg-amber-50 border-amber-300 text-amber-700' :
          plan === 'standard' ? 'bg-brand-50 border-brand-300 text-brand-700' :
          'bg-sage-100 border-sage-300 text-sage-700'
        )}>
          {plan} plan
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div {...fadeIn(0.05)}>
        <h2 className="text-sm font-semibold text-obsidian-500 uppercase tracking-wider mb-3">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          <QuickAction icon={Plus} label={t('dashboard.addPet')} href="/pets/new"
            color="bg-brand-100 text-brand-600 group-hover:bg-brand-500 group-hover:text-white" />
          <QuickAction icon={Calendar} label={t('dashboard.bookAppointment')} href="/appointments"
            color="bg-sage-100 text-sage-600 group-hover:bg-sage-500 group-hover:text-white" />
          <QuickAction icon={Search} label={t('dashboard.findVet')} href="/find-vet"
            color="bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" />
          <QuickAction icon={Activity} label={t('dashboard.viewRecords')} href="/pets"
            color="bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white" />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pets column */}
        <motion.div {...fadeIn(0.1)} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-obsidian-900 flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-brand-500" />
              {t('dashboard.yourPets')}
            </h2>
            {canAddMorePets && (
              <Link href="/pets/new" className="btn-ghost text-sm flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Link>
            )}
          </div>

          {petsLoading ? (
            <div className="space-y-3">
              {[1,2].map((i) => (
                <div key={i} className="h-20 skeleton rounded-3xl" />
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="zoaria-card text-center py-12 border-dashed">
              <div className="text-5xl mb-3">🐾</div>
              <h3 className="font-semibold text-obsidian-900 mb-1">{t('pets.noPets')}</h3>
              <p className="text-obsidian-500 text-sm mb-4">{t('pets.noPetsText')}</p>
              <Link href="/pets/new" className="btn-primary inline-flex items-center gap-2 text-sm py-2">
                <Plus className="w-4 h-4" /> {t('pets.addNew')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.map((pet: any) => <PetCard key={pet.id} pet={pet} />)}
              <Link href="/pets" className="block text-center text-sm text-brand-600 hover:text-brand-700 py-2 font-medium">
                {t('common.viewAll')} →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div {...fadeIn(0.15)} className="space-y-4">
          {/* Upcoming reminders */}
          <div className="zoaria-card">
            <h3 className="font-semibold text-obsidian-900 flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-brand-500" />
              {t('dashboard.upcomingReminders')}
            </h3>
            {upcomingReminders.length === 0 ? (
              <p className="text-sm text-obsidian-400 text-center py-4">{t('dashboard.noActivity')}</p>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sage-50">
                    <span className="text-lg">{REMINDER_ICONS[r.reminder_type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-obsidian-800 truncate">
                        {r.title || r.reminder_type}
                      </p>
                      <p className="text-xs text-obsidian-400">
                        {new Date(r.reminder_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming appointments */}
          {upcomingAppts.length > 0 && (
            <div className="zoaria-card">
              <h3 className="font-semibold text-obsidian-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-brand-500" />
                Appointments
              </h3>
              <div className="space-y-2">
                {upcomingAppts.map((a: any) => (
                  <div key={a.id} className="p-2.5 rounded-xl hover:bg-sage-50">
                    <p className="text-sm font-medium text-obsidian-800">{a.pet_name}</p>
                    <p className="text-xs text-obsidian-500">{a.vet_name} · {new Date(a.appointment_time).toLocaleDateString()}</p>
                    <span className={cn('badge mt-1 border capitalize',
                      a.status === 'confirmed' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-sage-100 border-sage-200 text-sage-600')}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade CTA for basic users */}
          {plan === 'basic' && (
            <div className="zoaria-card bg-gradient-to-br from-brand-500 to-brand-700 border-0 text-white">
              <h3 className="font-display font-bold text-lg mb-1">Upgrade to Premium</h3>
              <p className="text-brand-100 text-sm mb-4">
                Unlimited pets, vet chat, GPS tracking, and more.
              </p>
              <Link href="/account?tab=subscription"
                className="block text-center bg-white text-brand-700 font-semibold py-2 rounded-xl hover:bg-brand-50 transition-colors text-sm">
                View Plans
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
