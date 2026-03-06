'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Clock, ChevronLeft, ChevronRight, Plus, X,
  CheckCircle, XCircle, AlertCircle, Stethoscope, PawPrint
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, addMonths, subMonths,
  startOfWeek, endOfWeek, parseISO
} from 'date-fns';
import { calendarApi, vetsApi, petsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Appointment {
  id: number;
  vet: number;
  vet_name: string;
  pet: number;
  pet_name: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400',  icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-400',  icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-sage-100 text-sage-600 border-sage-200',      dot: 'bg-sage-400',   icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600 border-red-200',         dot: 'bg-red-400',    icon: XCircle },
};

/* ─── Book Appointment Modal ─────────────────────────────────────────────── */
function BookModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    vet: '',
    pet: '',
    appointment_time: '',
    notes: '',
  });

  const { data: vets = [] } = useQuery({
    queryKey: ['vets-list'],
    queryFn: () => vetsApi.list().then(r => r.data.results || r.data),
  });
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsApi.list().then(r => r.data.results || r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => calendarApi.createAppointment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked!');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to book appointment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vet || !form.pet || !form.appointment_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate({
      vet: Number(form.vet),
      pet: Number(form.pet),
      appointment_time: form.appointment_time,
      notes: form.notes,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-card-hover w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-100">
          <div>
            <h2 className="font-display text-xl font-bold text-obsidian-900">Book Appointment</h2>
            <p className="text-sm text-obsidian-500 mt-0.5">Schedule a vet visit</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-sage-100 transition-colors">
            <X className="w-5 h-5 text-obsidian-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vet select */}
          <div>
            <label className="label-base flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-brand-500" /> Veterinarian *
            </label>
            <select value={form.vet} onChange={e => setForm({ ...form, vet: e.target.value })}
              className="input-base">
              <option value="">Select a veterinarian</option>
              {vets.map((v: any) => (
                <option key={v.id} value={v.id}>Dr. {v.name} {v.specialization ? `— ${v.specialization}` : ''}</option>
              ))}
            </select>
          </div>

          {/* Pet select */}
          <div>
            <label className="label-base flex items-center gap-2">
              <PawPrint className="w-3.5 h-3.5 text-brand-500" /> Pet *
            </label>
            <select value={form.pet} onChange={e => setForm({ ...form, pet: e.target.value })}
              className="input-base">
              <option value="">Select your pet</option>
              {pets.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.species_name})</option>
              ))}
            </select>
          </div>

          {/* Date & time */}
          <div>
            <label className="label-base flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-500" /> Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.appointment_time}
              onChange={e => setForm({ ...form, appointment_time: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="input-base"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label-base">Notes <span className="text-obsidian-400 font-normal">(optional)</span></label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3} placeholder="Describe your concern or reason for visit..."
              className="input-base resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {mutation.isPending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus className="w-4 h-4" />}
              Book
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Mini Calendar ──────────────────────────────────────────────────────── */
function MiniCalendar({
  current, onNavigate, appointments, onSelectDay, selectedDay,
}: {
  current: Date;
  onNavigate: (d: Date) => void;
  appointments: Appointment[];
  onSelectDay: (d: Date) => void;
  selectedDay: Date | null;
}) {
  const monthStart = startOfMonth(current);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd     = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });
  const WEEKDAYS   = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const apptDays = useMemo(() =>
    new Set(appointments.map(a => format(parseISO(a.appointment_time), 'yyyy-MM-dd'))),
    [appointments]
  );

  return (
    <div className="zoaria-card select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onNavigate(subMonths(current, 1))}
          className="p-1.5 rounded-lg hover:bg-sage-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-obsidian-500" />
        </button>
        <span className="font-display font-semibold text-obsidian-900">
          {format(current, 'MMMM yyyy')}
        </span>
        <button onClick={() => onNavigate(addMonths(current, 1))}
          className="p-1.5 rounded-lg hover:bg-sage-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-obsidian-500" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-obsidian-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map(day => {
          const key     = format(day, 'yyyy-MM-dd');
          const hasAppt = apptDays.has(key);
          const today   = isToday(day);
          const current_ = isSameMonth(day, current);
          const selected = selectedDay && isSameDay(day, selectedDay);

          return (
            <button
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                'relative flex flex-col items-center justify-center w-8 h-8 mx-auto rounded-xl text-sm transition-all',
                !current_ && 'text-obsidian-300',
                current_ && !today && !selected && 'text-obsidian-700 hover:bg-sage-100',
                today && !selected && 'font-bold text-brand-600 bg-brand-50',
                selected && 'bg-brand-500 text-white font-bold shadow-glow',
              )}
            >
              {format(day, 'd')}
              {hasAppt && (
                <span className={cn(
                  'absolute bottom-0.5 w-1 h-1 rounded-full',
                  selected ? 'bg-white' : 'bg-brand-400'
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Appointment Card ───────────────────────────────────────────────────── */
function AppointmentCard({ appt, onUpdate }: { appt: Appointment; onUpdate: () => void }) {
  const qc = useQueryClient();
  const cfg = STATUS[appt.status] || STATUS.pending;
  const StatusIcon = cfg.icon;

  const cancel = useMutation({
    mutationFn: () => calendarApi.updateAppointment(appt.id, { status: 'cancelled' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Appointment cancelled'); },
    onError: () => toast.error('Failed to cancel'),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-sage-200 p-4 hover:shadow-card transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Time block */}
          <div className="shrink-0 w-14 text-center bg-brand-50 rounded-xl p-2">
            <p className="text-xs text-brand-500 font-semibold leading-none">
              {format(parseISO(appt.appointment_time), 'MMM')}
            </p>
            <p className="font-display text-xl font-bold text-brand-700 leading-tight">
              {format(parseISO(appt.appointment_time), 'd')}
            </p>
            <p className="text-xs text-brand-500 font-medium">
              {format(parseISO(appt.appointment_time), 'HH:mm')}
            </p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-obsidian-900">Dr. {appt.vet_name}</p>
            <p className="text-sm text-obsidian-500 flex items-center gap-1 mt-0.5">
              <PawPrint className="w-3 h-3" /> {appt.pet_name}
            </p>
            {appt.notes && (
              <p className="text-xs text-obsidian-400 mt-1 truncate">{appt.notes}</p>
            )}
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn('badge border flex items-center gap-1 text-xs', cfg.color)}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
          {(appt.status === 'pending' || appt.status === 'confirmed') && (
            <button
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => calendarApi.appointments().then(r => r.data.results || r.data),
  });

  const filtered = useMemo(() => {
    let list = [...appointments] as Appointment[];
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    if (selectedDay) list = list.filter(a => isSameDay(parseISO(a.appointment_time), selectedDay));
    return list.sort((a, b) =>
      new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()
    );
  }, [appointments, statusFilter, selectedDay]);

  const upcoming = useMemo(() =>
    (appointments as Appointment[])
      .filter(a => a.status !== 'cancelled' && new Date(a.appointment_time) >= new Date())
      .length,
    [appointments]
  );

  const isVet = user?.role === 'vet';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">Appointments</h1>
          <p className="text-obsidian-500 mt-1">
            {upcoming > 0 ? `${upcoming} upcoming appointment${upcoming > 1 ? 's' : ''}` : 'No upcoming appointments'}
          </p>
        </div>
        {!isVet && (
          <button onClick={() => setShowBookModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS).map(([key, cfg]) => {
          const count = (appointments as Appointment[]).filter(a => a.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all',
                statusFilter === key ? cfg.color + ' border-current' : 'bg-white border-sage-200 hover:border-sage-300'
              )}
            >
              <p className={cn('text-2xl font-display font-bold',
                statusFilter === key ? '' : 'text-obsidian-900')}>{count}</p>
              <p className={cn('text-xs font-semibold mt-1',
                statusFilter === key ? '' : 'text-obsidian-500')}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Calendar */}
        <div className="space-y-4">
          <MiniCalendar
            current={currentMonth}
            onNavigate={setCurrentMonth}
            appointments={appointments as Appointment[]}
            onSelectDay={d => setSelectedDay(isSameDay(d, selectedDay || new Date(0)) ? null : d)}
            selectedDay={selectedDay}
          />

          {selectedDay && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-obsidian-700">
                {format(selectedDay, 'EEEE, MMM d')}
              </p>
              <button onClick={() => setSelectedDay(null)}
                className="text-xs text-obsidian-400 hover:text-obsidian-600">
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-obsidian-600">
              {selectedDay
                ? `${filtered.length} appointment${filtered.length !== 1 ? 's' : ''} on ${format(selectedDay, 'MMM d')}`
                : `All appointments (${filtered.length})`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-sage-200 border-dashed">
              <Calendar className="w-10 h-10 text-obsidian-300 mx-auto mb-3" />
              <p className="font-semibold text-obsidian-900 mb-1">No appointments found</p>
              <p className="text-sm text-obsidian-500">
                {selectedDay ? 'No appointments on this day' : 'Book your first appointment'}
              </p>
              {!isVet && !selectedDay && (
                <button onClick={() => setShowBookModal(true)}
                  className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Book Now
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onUpdate={() => qc.invalidateQueries({ queryKey: ['appointments'] })} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book modal */}
      <AnimatePresence>
        {showBookModal && (
          <BookModal
            onClose={() => setShowBookModal(false)}
            onSuccess={() => setShowBookModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
