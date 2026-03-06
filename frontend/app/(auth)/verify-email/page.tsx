'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

// useSearchParams must live inside a component wrapped by <Suspense>
function Inner() {
  const token = useSearchParams().get('token');
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('No token in URL.'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((e: any) => { setStatus('error'); setMsg(e.response?.data?.error || 'Link expired.'); });
  }, [token]);

  if (status === 'loading') return <><Loader2 className="w-10 h-10 text-brand-500 mx-auto mb-3 animate-spin" /><p className="text-obsidian-500 text-center">Verifying…</p></>;
  if (status === 'success') return <div className="text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><h2 className="font-display text-2xl font-bold text-obsidian-900 mb-2">Email verified!</h2><p className="text-obsidian-500 mb-6">Your account is active.</p><Link href="/login" className="btn-primary inline-flex">Sign In →</Link></div>;
  return <div className="text-center"><XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="font-display text-2xl font-bold text-obsidian-900 mb-2">Verification failed</h2><p className="text-obsidian-500 mb-6">{msg}</p><Link href="/login" className="btn-secondary inline-flex">Back to Login</Link></div>;
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="zoaria-card max-w-md w-full py-12">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-10 h-10 text-brand-500 animate-spin" /></div>}>
          <Inner />
        </Suspense>
      </div>
    </div>
  );
}
