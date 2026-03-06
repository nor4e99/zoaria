'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PawPrint, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, setTokens } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/hooks/useTranslation';
import { toast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      const { access, refresh, user } = res.data;
      setAuth(user, access, refresh);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-obsidian-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract nature texture */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="g1" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="g2" cx="70%" cy="70%">
                <stop offset="0%" stopColor="#4d944d" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g1)" />
            <rect width="100%" height="100%" fill="url(#g2)" />
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx={Math.random() * 600} cy={Math.random() * 800}
                r={40 + Math.random() * 80} fill="none"
                stroke="#14b8a6" strokeWidth="0.5" opacity="0.3" />
            ))}
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold text-white">ZOARIA</span>
        </div>

        {/* Headline */}
        <div className="relative space-y-4">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Your pet's health,<br />
            <em className="text-brand-400 not-italic">always in reach.</em>
          </h1>
          <p className="text-obsidian-300 text-lg leading-relaxed max-w-sm">
            Track health, book consultations, and connect with trusted veterinarians — all in one place.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Pet owners', value: '12k+' },
            { label: 'Veterinarians', value: '800+' },
            { label: 'Consultations', value: '50k+' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-brand-400 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-obsidian-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream-50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold text-obsidian-900">ZOARIA</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-obsidian-900">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-obsidian-500 mt-2">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label-base">{t('auth.email')}</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={cn('input-base', errors.email && 'border-red-400 focus:ring-red-400')}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label-base mb-0">{t('auth.password')}</label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('input-base pr-11', errors.password && 'border-red-400 focus:ring-red-400')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input {...register('rememberMe')} type="checkbox" id="remember"
                className="w-4 h-4 rounded border-sage-300 text-brand-500 focus:ring-brand-400" />
              <label htmlFor="remember" className="text-sm text-obsidian-600">{t('auth.rememberMe')}</label>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('auth.loginBtn')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-obsidian-500 mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="text-brand-600 hover:text-brand-700 font-semibold">
              {t('nav.register')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
