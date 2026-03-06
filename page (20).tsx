'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stethoscope, Star, MapPin, DollarSign, Calendar,
  MessageSquare, Edit, Save, X, Clock, CheckCircle,
  TrendingUp, Users, Award
} from 'lucide-react';
import { vetsApi, calendarApi, chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import { format, parseISO } from 'date-fns';

/* ─── Star rating display ─────────────────────────────────────────────────── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const w = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={cn(w,
          s <= Math.round(rating)
            ? 'fill-amber-400 text-amber-400'
            : 'text-obsidian-200')} />
      ))}
    </div>
  );
}

/* ─── Profile edit form ───────────────────────────────────────────────────── */
function ProfileEditor({ profile, onSave, onCancel }: { profile: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    specialization:    profile.specialization || '',
    clinic_name:       profile.clinic_name || '',
    clinic_address:    profile.clinic_address || '',
    consultation_price: profile.consultation_price || '',
    years_experience:  profile.years_experience || '',
    bio:               profile.bio || '',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="zoaria-card space-y-4 border-brand-300 border-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-obsidian-900">Edit Profile</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-sage-100">
          <X className="w-4 h-4 text-obsidian-500" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-base">Specialization</label>
          <input value={form.specialization}
            onChange={e => setForm({ ...form, specialization: e.target.value })}
            className="input-base" placeholder="e.g. Small Animals, Exotic" />
        </div>
        <div>
          <label className="label-base">Years of Experience</label>
          <input type="number" value={form.years_experience}
            onChange={e => setForm({ ...form, years_experience: e.target.value })}
            className="input-base" placeholder="5" min="0" />
        </div>
        <div>
          <label className="label-base">Clinic Name</label>
          <input value={form.clinic_name}
            onChange={e => setForm({ ...form, clinic_name: e.target.value })}
            className="input-base" placeholder="City Vet Clinic" />
        </div>
        <div>
          <label className="label-base">Consultation Price (€)</label>
          <input type="number" value={form.consultation_price}
            onChange={e => setForm({ ...form, consultation_price: e.target.value })}
            className="input-base" placeholder="45.00" min="0" step="0.01" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-base">Clinic Address</label>
          <input value={form.clinic_address}
            onChange={e => setForm({ ...form, clinic_address: e.target.value })}
            className="input-base" placeholder="123 Main Street, Sofia" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-base">Bio</label>
          <textarea value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={3} className="input-base resize-none"
            placeholder="Describe your experience and approach to veterinary care..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={() => onSave(form)} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Vet Dashboard ──────────────────────────────────────────────────── */
export default function VetDashboardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['vet-profile'],
    queryFn: () => vetsApi.myProfile().then(r => r.data),
    enabled: user?.role === 'vet',
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['vet-appointments'],
    queryFn: () => calendarApi.appointments().then(r => r.data.results || r.data),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['vet-conversations'],
    queryFn: () => chatApi.conversations().then(r => r.data.results || r.data),
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => vetsApi.updateMyProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet-profile'] });
      toast.success('Profile updated!');
      setEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const updateAppt = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      calendarApi.updateAppointment(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet-appointments'] });
      toast.success('Appointment updated');
    },
  });

  if (user?.role !== 'vet') return (
    <div className="text-center py-24 text-obsidian-500">
      This page is only for veterinarians.
    </div>
  );

  if (profileLoading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
    </div>
  );

  const pending = (appointments as any[]).filter(a => a.status === 'pending');
  const upcoming = (appointments as any[]).filter(
    a => a.status === 'confirmed' && new Date(a.appointment_time) >= new Date()
  );

  const isApproved = profile?.approved;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-5 h-5 text-brand-500" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Vet Dashboard</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">
            Welcome, Dr. {user?.profile?.name?.split(' ')[0] || 'Doctor'}
          </h1>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Approval status banner */}
      {!isApproved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200"
        >
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Account under review</p>
            <p className="text-sm text-amber-700">
              An admin is reviewing your license documents. You'll be notified when approved.
            </p>
          </div>
        </motion.div>
      )}

      {/* Profile card */}
      {!editing ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="zoaria-card">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-3xl bg-brand-100 flex items-center justify-center text-3xl font-bold text-brand-700 shrink-0">
              {user?.profile?.name?.[0]?.toUpperCase() || 'V'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-xl font-bold text-obsidian-900">
                  Dr. {user?.profile?.name}
                </h2>
                {isApproved
                  ? <span className="badge bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  : <span className="badge bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                }
              </div>

              {profile?.specialization && (
                <p className="text-brand-600 font-semibold mt-1">{profile.specialization}</p>
              )}

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
                {profile?.clinic_name && (
                  <span className="flex items-center gap-1.5 text-sm text-obsidian-600">
                    <Stethoscope className="w-3.5 h-3.5 text-obsidian-400" />
                    {profile.clinic_name}
                  </span>
                )}
                {profile?.clinic_address && (
                  <span className="flex items-center gap-1.5 text-sm text-obsidian-600">
                    <MapPin className="w-3.5 h-3.5 text-obsidian-400" />
                    {profile.clinic_address}
                  </span>
                )}
                {profile?.consultation_price && (
                  <span className="flex items-center gap-1.5 text-sm text-obsidian-600">
                    <DollarSign className="w-3.5 h-3.5 text-obsidian-400" />
                    €{profile.consultation_price}/session
                  </span>
                )}
                {profile?.years_experience && (
                  <span className="flex items-center gap-1.5 text-sm text-obsidian-600">
                    <Award className="w-3.5 h-3.5 text-obsidian-400" />
                    {profile.years_experience} years experience
                  </span>
                )}
              </div>

              {profile?.rating != null && (
                <div className="flex items-center gap-2 mt-3">
                  <Stars rating={profile.rating} />
                  <span className="text-sm font-semibold text-obsidian-700">
                    {Number(profile.rating).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {profile?.bio && (
            <p className="text-sm text-obsidian-600 mt-4 leading-relaxed border-t border-sage-100 pt-4">
              {profile.bio}
            </p>
          )}
        </motion.div>
      ) : (
        <ProfileEditor
          profile={profile || {}}
          onSave={data => updateProfile.mutate(data)}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Calendar,      label: 'Pending',   value: pending.length,        color: 'bg-amber-100 text-amber-600' },
          { icon: TrendingUp,    label: 'Upcoming',  value: upcoming.length,       color: 'bg-green-100 text-green-600' },
          { icon: MessageSquare, label: 'Chats',     value: conversations.length,  color: 'bg-brand-100 text-brand-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="zoaria-card text-center p-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-display text-2xl font-bold text-obsidian-900">{value}</p>
            <p className="text-xs text-obsidian-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending appointments */}
      {pending.length > 0 && (
        <div className="zoaria-card">
          <h3 className="font-semibold text-obsidian-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Appointments ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((appt: any) => (
              <div key={appt.id}
                className="flex items-center gap-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="w-12 h-12 rounded-xl bg-white border border-amber-200 flex flex-col items-center justify-center shrink-0">
                  <p className="text-xs font-bold text-amber-600">
                    {format(parseISO(appt.appointment_time), 'MMM')}
                  </p>
                  <p className="text-lg font-display font-bold text-amber-700 leading-none">
                    {format(parseISO(appt.appointment_time), 'd')}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-obsidian-900 text-sm">{appt.owner_name || 'Patient'}</p>
                  <p className="text-xs text-obsidian-500">
                    {appt.pet_name} · {format(parseISO(appt.appointment_time), 'HH:mm')}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-obsidian-400 truncate mt-0.5">{appt.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => updateAppt.mutate({ id: appt.id, status: 'confirmed' })}
                    className="p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                    title="Confirm"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateAppt.mutate({ id: appt.id, status: 'cancelled' })}
                    className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <div className="zoaria-card">
          <h3 className="font-semibold text-obsidian-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            Active Conversations
          </h3>
          <div className="space-y-2">
            {(conversations as any[]).slice(0, 5).map((conv: any) => (
              <a key={conv.id} href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-sage-50 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 shrink-0">
                  {(conv.owner_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-obsidian-900 truncate">{conv.owner_name}</p>
                  {conv.last_message && (
                    <p className="text-xs text-obsidian-400 truncate">{conv.last_message.text}</p>
                  )}
                </div>
                <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                  Open →
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
