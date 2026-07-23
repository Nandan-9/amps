'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, TriangleAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/4 backdrop-blur-2xl p-8 shadow-2xl shadow-black/60"
      >
        <h1
          style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.04em' }}
          className="text-2xl text-white mb-2"
        >
          ADMIN LOGIN
        </h1>
        <p className="text-sm text-white/40 mb-8 font-light leading-relaxed">
          Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/4 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:bg-white/6 transition-all"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="group relative w-full mt-2 px-6 py-4 rounded-xl bg-white text-black text-sm font-black tracking-widest uppercase overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_45px_rgba(139,92,246,0.3)] transition-shadow duration-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                <span className="relative z-10">Signing in...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 relative z-10 group-hover:text-white transition-colors" />
                <span className="relative z-10 group-hover:text-white transition-colors">Sign In</span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
