'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── VIDEO SETUP ────────────────────────────────────────────────────────────
//
//  TO ADD YOUR VIDEO:
//  1. Place your .mp4 file inside:  amps-events/public/videos/intro.mp4
//  2. Change HAS_VIDEO to true below
//
// ─────────────────────────────────────────────────────────────────────────────
const HAS_VIDEO = true;              // ← set to true once you drop in the file
const VIDEO_SRC = '/videos/intro.mp4';

// Show intro only once per browser session (comment out to always show)
const SESSION_KEY = 'amps-intro-seen';

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing');
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  // Show skip button after 2 s
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Track video time for progress bar
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (v.duration) setProgress(v.currentTime / v.duration);
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, []);

  const dismiss = () => {
    if (phase !== 'playing') return;
    setPhase('fading');
    sessionStorage.setItem(SESSION_KEY, '1');
    setTimeout(onComplete, 900);
  };

  // If no video file yet — show a dramatic branded splash instead
  if (!HAS_VIDEO) {
    return (
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9990] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: '#030305' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'fading' ? 0 : 1 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          >
            {/* Animated background orbs */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[900px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] max-w-[500px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </motion.div>

            {/* Scan lines overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)',
                backgroundSize: '100% 4px',
              }}
            />

            {/* Center content */}
            <div className="relative z-10 text-center px-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
              >
                <div
                  className="text-[clamp(64px,14vw,160px)] font-normal text-white leading-none tracking-[0.12em]"
                  style={{ fontFamily: 'var(--app-font-headline)' }}
                >
                  AMPS
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="space-y-2 mb-12"
              >
                <div className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/30">
                  Amrita Motion Picture Society
                </div>
                <div className="h-px w-24 mx-auto bg-gradient-to-r from-violet-500 to-cyan-500" />
                <div className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/20">
                  Est. 2017 · Amritapuri Campus
                </div>
              </motion.div>

              {/* Relaunch text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="mb-12"
              >
                <span
                  className="text-sm font-bold uppercase tracking-[0.4em] bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  — We're Back —
                </span>
              </motion.div>

              {/* Enter button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                <motion.button
                  onClick={dismiss}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-12 py-4 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-xs font-bold uppercase tracking-[0.4em] transition-colors backdrop-blur-sm bg-white/4"
                >
                  Enter Site
                </motion.button>
                <motion.div
                  className="mt-4 text-[9px] text-white/20 uppercase tracking-widest"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Press any key to continue
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom note about video */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
            >
              <p className="text-[9px] text-white/15 uppercase tracking-widest">
                Add your trailer to <code className="text-purple-400/40">public/videos/intro.mp4</code>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── Real video intro ──────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="video-intro"
          className="fixed inset-0 z-[9990] bg-black overflow-hidden flex items-center justify-center cursor-pointer"
          animate={{ opacity: phase === 'fading' ? 0 : 1 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          onClick={dismiss}
        >
          {/* Full screen video */}
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            muted={muted}
            playsInline
            onEnded={dismiss}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
          />

          {/* Top bar — AMPS wordmark */}
          <motion.div
            className="absolute top-6 left-8 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span
              className="text-2xl font-normal text-white/70 tracking-[0.15em]"
              style={{ fontFamily: 'var(--app-font-headline)' }}
            >
              AMPS
            </span>
          </motion.div>

          {/* Unmute button */}
          <motion.button
            className="absolute top-6 right-24 z-10 flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/60 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) videoRef.current.muted = !muted;
              setMuted(!muted);
            }}
          >
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </motion.button>

          {/* Skip button */}
          <AnimatePresence>
            {showSkip && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss();
                }}
                className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/60 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-all"
              >
                Skip →
              </motion.button>
            )}
          </AnimatePresence>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Key-press to dismiss
if (typeof window !== 'undefined') {
  // handled in component via useEffect below
}
