'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Stethoscope, PawPrint, TrendingUp, Clock,
  CheckCircle, AlertTriangle, DollarSign, ArrowRight,
  BarChart2, ShieldCheck
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

/* ─── Stat card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="zoaria-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-obsidian-500">{label}</p>
          <p className="font-display text-3xl font-bold text-obsidian-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-obsidian-400 mt-1">{sub}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

const PIE_COLORS = ['#e5f2e5', '#14b8a6', '#0d9488'];
const PLAN_LABELS: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Guard: admin only
  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/dashboard');
  }, [user]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.analytics().then(r => r.data),
  });

  const { data: pendingVets = [] } = useQuery({
    queryKey: ['pending-vets'],
    queryFn: () => adminApi.pendingVets().then(r => r.data),
  });

  if (user?.role !== 'admin') return null;

  const subsData = analytics ? [
    { name: 'Basic',    value: analytics.subscriptions.basic    },
    { name: 'Standard', value: analytics.subscriptions.standard },
    { name: 'Premium',  value: analytics.subscriptions.premium  },
  ] : [];

  const userBarData = analytics ? [
    { name: 'Owners', value: analytics.users.owners },
    { name: 'Vets',   value: analytics.users.vets   },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">Platform Overview</h1>
          <p className="text-obsidian-500 mt-1">Real-time ZOARIA metrics</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/vets" className="btn-secondary flex items-center gap-2 text-sm">
            <Stethoscope className="w-4 h-4" />
            Manage Vets
            {pendingVets.length > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingVets.length}
              </span>
            )}
          </Link>
          <Link href="/admin/users" className="btn-secondary flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" /> Users
          </Link>
        </div>
      </div>

      {/* Pending vets alert */}
      {pendingVets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {pendingVets.length} veterinarian{pendingVets.length > 1 ? 's' : ''} awaiting approval
            </p>
            <p className="text-sm text-amber-700">Review license documents and approve or reject applications</p>
          </div>
          <Link href="/admin/vets" className="btn-primary text-sm py-2 px-4 bg-amber-500 hover:bg-amber-600 flex items-center gap-2">
            Review <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-3xl" />)}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users} label="Total Users"
            value={analytics.users.total.toLocaleString()}
            sub={`${analytics.users.owners} owners · ${analytics.users.vets} vets`}
            color="bg-brand-100 text-brand-600"
            delay={0}
          />
          <StatCard
            icon={Stethoscope} label="Veterinarians"
            value={analytics.vets.approved}
            sub={`${analytics.vets.pending} pending approval`}
            color="bg-sage-100 text-sage-600"
            delay={0.05}
          />
          <StatCard
            icon={PawPrint} label="Pets Registered"
            value={analytics.pets.toLocaleString()}
            color="bg-purple-100 text-purple-600"
            delay={0.1}
          />
          <StatCard
            icon={DollarSign} label="Total Revenue"
            value={`€${parseFloat(analytics.revenue.total).toLocaleString()}`}
            sub={`${analytics.revenue.transactions} transactions`}
            color="bg-amber-100 text-amber-600"
            delay={0.15}
          />
        </div>
      )}

      {/* Charts row */}
      {analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Subscriptions pie */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="zoaria-card"
          >
            <h3 className="font-semibold text-obsidian-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-500" />
              Subscription Distribution
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {subsData.map((_, i) => (
                      <Cell key={i} fill={['#e5f2e5','#14b8a6','#0d9488'][i]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span className="text-sm text-obsidian-600">{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5f2e5', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend with counts */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {subsData.map((s, i) => (
                <div key={s.name} className="text-center p-2.5 rounded-xl bg-sage-50">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: ['#e5f2e5','#14b8a6','#0d9488'][i] }} />
                  <p className="font-bold text-obsidian-900">{s.value}</p>
                  <p className="text-xs text-obsidian-500">{s.name}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* User types bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="zoaria-card"
          >
            <h3 className="font-semibold text-obsidian-900 mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" />
              User Breakdown
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5f2e5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#546161' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9aa3a3' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5f2e5', fontSize: 13 }}
                    cursor={{ fill: '#f4f9f4' }}
                  />
                  <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-sage-50 rounded-xl text-center">
                <p className="font-display text-2xl font-bold text-obsidian-900">{analytics.users.owners}</p>
                <p className="text-xs text-obsidian-500">Pet Owners</p>
              </div>
              <div className="p-3 bg-brand-50 rounded-xl text-center">
                <p className="font-display text-2xl font-bold text-obsidian-900">{analytics.users.vets}</p>
                <p className="text-xs text-obsidian-500">Veterinarians</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
