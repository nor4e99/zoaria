'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Eye, EyeOff, Stethoscope, Heart, ArrowRight, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useT } from '@/hooks/useTranslation';
import { toast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
  specialization: z.string().optional(),
  clinic_name: z.string().optional(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});
type FormData = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars',   ok: password.length >= 8 },
    { label: 'Uppercase',  ok: /[A-Z]/.test(password) },
    { label: 'Number',     ok: /[0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-brand-400'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300',
            i < strength ? colors[strength - 1] : 'bg-sage-200')} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={cn('text-xs flex items-center gap-1',
            c.ok ? 'text-brand-600' : 'text-obsidian-400')}>
            <Check className="w-3 h-3" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const [role, setRole] = useState<'owner' | 'vet'>('owner');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (role === 'owner') {
        await authApi.registerOwner({
          email: data.email,
          password: data.password,
          confirm_password: data.confirm_password,
          name: data.name,
        });
      } else {
        await authApi.registerVet({
          email: data.email,
          password: data.password,
          confirm_password: data.confirm_password,
          name: data.name,
          specialization: data.specialization || '',
          clinic_name: data.clinic_name || '',
        });
      }
      setRegisteredEmail(data.email);
      setDone(true);
    } catch (err: any) {
      const d = err.response?.data;
      const msg = d?.email?.[0] || d?.password?.[0] || d?.detail || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full zoaria-card text-center py-12"
        >
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-obsidian-900 mb-2">
            {t('auth.verifyEmailTitle')}
          </h2>
          <p className="text-obsidian-500">
            {t('auth.verifyEmailText')}{' '}
            <strong className="text-obsidian-800">{registeredEmail}</strong>
          </p>
          {role === 'vet' && (
            <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-800">
              Your vet account also requires admin approval after email verification.
            </div>
          )}
          <Link href="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold text-obsidian-900">ZOARIA</span>
          </Link>
        </div>

        <h2 className="font-display text-3xl font-bold text-obsidian-900 mb-1">
          {t('auth.registerTitle')}
        </h2>
        <p className="text-obsidian-500 mb-6">{t('auth.registerSubtitle')}</p>

        {/* Role toggle */}
        <div className="flex gap-3 mb-6 p-1 bg-sage-100 rounded-2xl">
          {(['owner', 'vet'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                role === r
                  ? 'bg-white text-brand-700 shadow-card'
                  : 'text-obsidian-500 hover:text-obsidian-700'
              )}
            >
              {r === 'owner' ? <Heart className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
              {r === 'owner' ? t('auth.asOwner') : t('auth.asVet')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label-base">{t('auth.name')}</label>
            <input {...register('name')} type="text" placeholder="John Doe"
              className={cn('input-base', errors.name && 'border-red-400')} autoComplete="name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label-base">{t('auth.email')}</label>
            <input {...register('email')} type="email" placeholder="you@example.com"
              className={cn('input-base', errors.email && 'border-red-400')} autoComplete="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Vet-only fields */}
          <AnimatePresence>
            {role === 'vet' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="label-base">Specialization</label>
                  <input {...register('specialization')} type="text" placeholder="e.g. Small Animals, Exotic"
                    className="input-base" />
                </div>
                <div>
                  <label className="label-base">Clinic Name</label>
                  <input {...register('clinic_name')} type="text" placeholder="City Vet Clinic"
                    className="input-base" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <div>
            <label className="label-base">{t('auth.password')}</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn('input-base pr-11', errors.password && 'border-red-400')}
                autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="label-base">{t('auth.confirmPassword')}</label>
            <input {...register('confirm_password')} type="password" placeholder="••••••••"
              className={cn('input-base', errors.confirm_password && 'border-red-400')}
              autoComplete="new-password" />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 text-base mt-2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t('auth.registerBtn')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-obsidian-500 mt-5">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
            {t('nav.login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
