'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, XCircle, FileText, Mail,
  Stethoscope, Clock, Search, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

/* ─── Reject modal ────────────────────────────────────────────────────────── */
function RejectModal({ vetId, vetName, onClose }: { vetId: number; vetName: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.rejectVet(vetId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-vets'] });
      toast.success(`${vetName}'s application rejected`);
      onClose();
    },
    onError: () => toast.error('Failed to reject application'),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl shadow-card-hover w-full max-w-md p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-obsidian-900">Reject Application</h3>
            <p className="text-sm text-obsidian-500">Dr. {vetName}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="label-base">Reason for rejection</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
            placeholder="Please provide a clear reason so the applicant can address the issue..."
            className="input-base resize-none"
          />
          <p className="text-xs text-obsidian-400 mt-1.5">
            This message will be sent to the applicant via notification.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !reason.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-3 rounded-2xl
                       transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Vet card ───────────────────────────────────────────────────────────── */
function VetPendingCard({ vet }: { vet: any }) {
  const qc = useQueryClient();
  const [showReject, setShowReject] = useState(false);

  const approve = useMutation({
    mutationFn: () => adminApi.approveVet(vet.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-vets'] });
      toast.success(`Dr. ${vet.name || vet.email} approved!`);
    },
    onError: () => toast.error('Failed to approve vet'),
  });

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="zoaria-card border-l-4 border-l-amber-400"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700 shrink-0">
            {(vet.name || vet.email)?.[0]?.toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h3 className="font-display font-bold text-obsidian-900 text-lg">
                Dr. {vet.name || 'Unknown'}
              </h3>
              <span className="badge bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending Review
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
              <div className="flex items-center gap-2 text-sm text-obsidian-600">
                <Mail className="w-3.5 h-3.5 text-obsidian-400 shrink-0" />
                <span className="truncate">{vet.email}</span>
              </div>
              {vet.specialization && (
                <div className="flex items-center gap-2 text-sm text-obsidian-600">
                  <Stethoscope className="w-3.5 h-3.5 text-obsidian-400 shrink-0" />
                  <span>{vet.specialization}</span>
                </div>
              )}
              {vet.clinic_name && (
                <div className="flex items-center gap-2 text-sm text-obsidian-600">
                  <Stethoscope className="w-3.5 h-3.5 text-obsidian-400 shrink-0" />
                  <span>{vet.clinic_name}</span>
                </div>
              )}
            </div>

            {/* License */}
            {vet.license_document ? (
              <a
                href={vet.license_document}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-sage-50 hover:bg-brand-50
                           border border-sage-200 hover:border-brand-300 rounded-xl text-sm text-obsidian-700
                           hover:text-brand-700 transition-all"
              >
                <FileText className="w-4 h-4" />
                View License Document
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                No license document uploaded
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => approve.mutate()}
              disabled={approve.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600
                         text-white font-semibold rounded-2xl transition-all text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approve.isPending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-600
                         hover:bg-red-50 font-semibold rounded-2xl transition-all text-sm"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showReject && (
          <RejectModal
            vetId={vet.id}
            vetName={vet.name || vet.email}
            onClose={() => setShowReject(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function AdminVetsPage() {
  const [search, setSearch] = useState('');

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-vets'],
    queryFn: () => adminApi.pendingVets().then(r => r.data),
  });

  const filtered = (pending as any[]).filter(v =>
    !search ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Admin</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">Vet Applications</h1>
          <p className="text-obsidian-500 mt-0.5">
            {pending.length} pending review
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-44 skeleton rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-sage-200 border-dashed">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold text-obsidian-900 mb-1">All clear!</h3>
          <p className="text-sm text-obsidian-500">No pending vet applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(vet => (
              <VetPendingCard key={vet.id} vet={vet} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
