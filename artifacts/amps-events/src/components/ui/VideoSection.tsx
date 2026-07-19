'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';

// ─── HOW TO USE YOUR OWN VIDEO ───────────────────────────────────────────────
//
// OPTION A — YouTube / Vimeo (Easiest, no hosting needed):
//   Set VIDEO_TYPE = 'youtube'  and  VIDEO_SRC = 'YOUR_YOUTUBE_VIDEO_ID'
//   Example: VIDEO_SRC = 'dQw4w9WgXcQ'  (the part after ?v= in the URL)
//
// OPTION B — Your own video file (MP4):
//   1. Copy your .mp4 file into: amps-events/public/videos/trailer.mp4
//   2. Set VIDEO_TYPE = 'mp4'  and  VIDEO_SRC = '/videos/trailer.mp4'
//
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_TYPE: 'youtube' | 'mp4' | 'placeholder' = 'placeholder';
const VIDEO_SRC = '';  // ← Paste your YouTube Video ID or MP4 path here

interface VideoSectionProps {
  videoType?: 'youtube' | 'mp4' | 'placeholder';
  videoSrc?: string;
}

function YouTubePlayer({ videoId }: { videoId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThumb, setShowThumb] = useState(true);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
      {showThumb ? (
        <>
          {/* YouTube thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          {/* Big play button */}
          <button
            onClick={() => setShowThumb(false)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.4)] group-hover:bg-white/20 transition-all"
            >
              <Play className="w-8 h-8 text-white ml-1 fill-white" />
            </motion.div>
          </button>
        </>
      ) : (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title="AMPS Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

function MP4Player({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play(); setIsPlaying(true); }
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress((v.currentTime / v.duration) * 100);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  };

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        loop
        playsInline
        className="w-full h-full object-cover"
        onClick={toggle}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Play/pause overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={toggle}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:bg-white/20 transition-all">
              <Play className="w-8 h-8 text-white ml-1 fill-white" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3"
          >
            <button onClick={toggle} className="text-white hover:text-purple-300 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <button onClick={handleMute} className="text-white hover:text-purple-300 transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-purple-300 transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlaceholderPlayer() {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d0d1a] to-[#050508] border border-white/8 flex flex-col items-center justify-center gap-5">
      {/* Decorative film strip lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-px bg-white/4"
          style={{ top: `${12.5 * (i + 1)}%` }}
          animate={{ opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Film holes */}
      <div className="absolute top-3 left-0 right-0 flex justify-around">
        {[...Array(12)].map((_, i) => <div key={i} className="w-4 h-3 rounded bg-black/40 border border-white/8" />)}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-around">
        {[...Array(12)].map((_, i) => <div key={i} className="w-4 h-3 rounded bg-black/40 border border-white/8" />)}
      </div>

      <div className="relative z-10 text-center">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-white/20 ml-1" />
        </div>
        <p className="text-white/30 text-sm font-semibold tracking-widest uppercase mb-2">Your Trailer Here</p>
        <p className="text-white/15 text-xs max-w-xs mx-auto leading-relaxed">
          Set <code className="text-purple-400/60 bg-purple-500/10 px-1 rounded">VIDEO_TYPE</code> and <code className="text-cyan-400/60 bg-cyan-500/10 px-1 rounded">VIDEO_SRC</code> in VideoSection.tsx
        </p>
      </div>
    </div>
  );
}

export function VideoSection({
  videoType = VIDEO_TYPE,
  videoSrc = VIDEO_SRC,
}: VideoSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 relative z-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
          ref={ref}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Watch</span>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <h2
            className="text-white mb-3"
            style={{ fontFamily: 'var(--app-font-headline)', fontSize: 'clamp(36px, 6vw, 80px)', letterSpacing: '0.04em', lineHeight: 0.95 }}
          >
            WHO WE ARE
          </h2>
          <p className="text-white/35 text-sm max-w-sm mx-auto font-light tracking-wide">
            The story behind AMPS — told in our own words and frames.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Glowing border frame */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/30 via-purple-500/20 to-cyan-500/30 blur-sm" />
          <div className="relative rounded-2xl overflow-hidden">
            {videoType === 'youtube' && videoSrc ? (
              <YouTubePlayer videoId={videoSrc} />
            ) : videoType === 'mp4' && videoSrc ? (
              <MP4Player src={videoSrc} />
            ) : (
              <PlaceholderPlayer />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
