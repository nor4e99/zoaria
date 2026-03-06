'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Search, Users, ShieldCheck, UserCheck,
  UserX, Filter, Mail, Crown, PawPrint
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import { format, parseISO } from 'date-fns';

const ROLE_CONFIG = {
  owner: { label: 'Owner',   color: 'bg-sage-100 text-sage-700 border-sage-200',  icon: PawPrint },
  vet:   { label: 'Vet',     color: 'bg-brand-100 text-brand-700 border-brand-200', icon: ShieldCheck },
  admin: { label: 'Admin',   color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Crown },
};

const PLAN_CONFIG = {
  basic:    'bg-obsidian-100 text-obsidian-600',
  standard: 'bg-brand-100 text-brand-700',
  premium:  'bg-amber-100 text-amber-700',
};

function UserRow({ user, onToggle }: { user: any; onToggle: () => void }) {
  const roleCfg = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.owner;
  const RoleIcon = roleCfg.icon;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-sage-100 hover:bg-sage-50/50 transition-colors"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 shrink-0">
            {(user.name || user.email)?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-obsidian-900 text-sm truncate">
              {user.name || '—'}
            </p>
            <p className="text-xs text-obsidian-400 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <span className={cn('badge border flex items-center gap-1 w-fit', roleCfg.color)}>
          <RoleIcon className="w-3 h-3" />
          {roleCfg.label}
        </span>
      </td>

      <td className="py-3 px-4">
        {user.subscription_plan ? (
          <span className={cn('badge capitalize', PLAN_CONFIG[user.subscription_plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.basic)}>
            {user.subscription_plan}
          </span>
        ) : <span className="text-xs text-obsidian-400">—</span>}
      </td>

      <td className="py-3 px-4">
        <span className={cn('badge border',
          user.email_verified
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-amber-50 text-amber-600 border-amber-200'
        )}>
          {user.email_verified ? '✓ Verified' : '⏳ Pending'}
        </span>
      </td>

      <td className="py-3 px-4 text-xs text-obsidian-400">
        {user.date_joined ? format(parseISO(user.date_joined), 'MMM d, yyyy') : '—'}
      </td>

      <td className="py-3 px-4">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
            user.is_active
              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
          )}
        >
          {user.is_active
            ? <><UserX className="w-3.5 h-3.5" /> Deactivate</>
            : <><UserCheck className="w-3.5 h-3.5" /> Activate</>
          }
        </button>
      </td>
    </motion.tr>
  );
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => adminApi.users().then(r => r.data.results || r.data),
  });

  const toggle = useMutation({
    mutationFn: (id: number) => adminApi.toggleUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const filtered = (users as any[]).filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all:   (users as any[]).length,
    owner: (users as any[]).filter((u: any) => u.role === 'owner').length,
    vet:   (users as any[]).filter((u: any) => u.role === 'vet').length,
    admin: (users as any[]).filter((u: any) => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
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
          <h1 className="font-display text-2xl font-bold text-obsidian-900">User Management</h1>
          <p className="text-obsidian-500 mt-0.5">{counts.all} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 p-1 bg-sage-100 rounded-2xl">
          {[
            { key: 'all',   label: `All (${counts.all})` },
            { key: 'owner', label: `Owners (${counts.owner})` },
            { key: 'vet',   label: `Vets (${counts.vet})` },
            { key: 'admin', label: `Admins (${counts.admin})` },
          ].map(f => (
            <button key={f.key} onClick={() => setRoleFilter(f.key)}
              className={cn('px-3 py-2 rounded-xl text-sm font-semibold transition-all',
                roleFilter === f.key
                  ? 'bg-white text-brand-700 shadow-card'
                  : 'text-obsidian-500 hover:text-obsidian-700')}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="zoaria-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-200 bg-sage-50/60">
                {['User', 'Role', 'Plan', 'Email Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-obsidian-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-sage-100">
                    <td colSpan={6} className="py-3 px-4">
                      <div className="h-8 skeleton rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users className="w-10 h-10 text-obsidian-300 mx-auto mb-2" />
                    <p className="text-obsidian-500 text-sm">No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user: any) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onToggle={() => toggle.mutate(user.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-sage-100 bg-sage-50/40">
            <p className="text-xs text-obsidian-400">
              Showing {filtered.length} of {counts.all} users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
