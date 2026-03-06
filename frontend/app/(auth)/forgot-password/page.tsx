'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PawPrint, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/Toaster';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Could not send reset link. Check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8">
          <Link href="/login" className="p-2 rounded-xl hover:bg-sage-100 transition-colors mr-1">
            <ArrowLeft className="w-4 h-4 text-obsidian-500" />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold text-obsidian-900">ZOARIA</span>
        </div>

        {!sent ? (
          <>
            <h2 className="font-display text-3xl font-bold text-obsidian-900 mb-1">Reset password</h2>
            <p className="text-obsidian-500 mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-base">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading || !email}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Reset Link</>
                }
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-obsidian-900 mb-2">Check your inbox</h2>
            <p className="text-obsidian-500 mb-6">
              We sent a reset link to <strong className="text-obsidian-800">{email}</strong>
            </p>
            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
