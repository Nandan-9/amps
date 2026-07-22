'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Loader2, TriangleAlert, Mail, MessageCircleQuestion } from 'lucide-react';
import { ThreeDMarquee } from '@/components/ui/3d-marquee';

const marqueeImages = [
  '/media/poster-01.jpg',
  '/media/poster-02.jpeg',
  '/media/poster-03.jpeg',
  '/media/poster-04.jpg',
  '/media/poster-05.jpg',
  '/media/poster-06.jpeg',
  '/media/poster-07.jpeg',
  '/media/poster-08.jpeg',
  '/media/poster-09.jpeg',
  '/media/poster-10.jpeg',
  '/media/poster-11.jpg',
  '/media/poster-12.jpeg',
  '/media/poster-13.jpeg',
  '/media/poster-14.jpg',
  '/media/poster-15.jpg',
  '/media/poster-16.jpg',
  '/media/poster-17.jpg',
  '/media/poster-18.jpg',
  '/media/poster-19.jpg',
  '/media/poster-20.jpeg',
];

export default function TicketPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${rollNumber.trim() || 'amps'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('idle');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5 relative overflow-hidden">
      <ThreeDMarquee images={marqueeImages} className="absolute inset-0 h-full w-full rounded-none" />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 80%)',
        }}
      />

      <Link href="/" className="absolute top-6 left-1/2 -translate-x-1/2 z-10 group">
        <Image src="/logo.png" alt="AMPS logo" width={480} height={480} className="h-24 w-24 sm:h-28 sm:w-28 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-lg" priority />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-24 sm:mt-28 w-full max-w-md rounded-3xl border border-white/10 bg-white/4 backdrop-blur-2xl p-8 md:p-10 shadow-2xl shadow-black/60"
      >
        <h1
          style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.04em' }}
          className="text-3xl text-white mb-2"
        >
          GET YOUR TICKET
        </h1>
        <p className="text-sm text-white/40 mb-8 font-light leading-relaxed">
          Enter your registered roll number and email to download your ticket.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rollNumber" className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-2">
              Roll Number
            </label>
            <input
              id="rollNumber"
              type="text"
              required
              autoComplete="off"
              placeholder="am.sc.u4cse26xxx"
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              className="w-full bg-white/4 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:bg-white/6 transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="off"
              placeholder="you@am.students.amrita.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
                <span className="relative z-10">Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 relative z-10 group-hover:text-white transition-colors" />
                <span className="relative z-10 group-hover:text-white transition-colors">Download Ticket</span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/8 space-y-3">
          <p className="flex items-center gap-2 text-xs text-white/35">
            <Mail className="w-3.5 h-3.5 shrink-0 text-white/25" />
            For support, contact us at{' '}
            <a href="mailto:amps@am.amrita.edu" className="text-purple-300 hover:text-purple-200 transition-colors">
              amps@am.amrita.edu
            </a>
          </p>
          <p className="flex items-center gap-2 text-xs text-white/35">
            <MessageCircleQuestion className="w-3.5 h-3.5 shrink-0 text-white/25" />
            Already registered and not able to download tickets?{' '}
            <a
              href="https://forms.gle/KjvTUyzNuKBiwz3c7"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 hover:text-cyan-200 transition-colors underline underline-offset-2"
            >
              Click here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
