'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, ArrowRight, Users } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Event } from '@/types/event';
import { formatDateShort } from '@/lib/eventUtils';
import { CountdownTimer } from './CountdownTimer';

interface EventCardProps {
  event: Event;
  className?: string;
}

const CATEGORY_ACCENT: Record<string, { bar: string; text: string; rgb: string }> = {
  'Workshop':        { bar: 'from-purple-500 to-violet-600',   text: 'text-purple-300',  rgb: '168,85,247' },
  'Photography':     { bar: 'from-orange-400 to-amber-500',    text: 'text-orange-300',  rgb: '251,146,60' },
  'Videography':     { bar: 'from-blue-500 to-indigo-600',     text: 'text-blue-300',    rgb: '59,130,246' },
  'Editing':         { bar: 'from-teal-400 to-emerald-500',    text: 'text-teal-300',    rgb: '20,184,166' },
  'Film Making':     { bar: 'from-red-500 to-rose-600',        text: 'text-red-300',     rgb: '239,68,68' },
  'Competition':     { bar: 'from-yellow-400 to-amber-500',    text: 'text-yellow-300',  rgb: '234,179,8' },
  'Launch Event':    { bar: 'from-pink-500 to-fuchsia-600',    text: 'text-pink-300',    rgb: '236,72,153' },
  'Anime Event':     { bar: 'from-indigo-400 to-violet-500',   text: 'text-indigo-300',  rgb: '99,102,241' },
  'Film Quiz':       { bar: 'from-cyan-400 to-sky-500',        text: 'text-cyan-300',    rgb: '6,182,212' },
  'Movie Screening': { bar: 'from-lime-400 to-green-500',      text: 'text-lime-300',    rgb: '132,204,22' },
};

export function EventCard({ event, className = '' }: EventCardProps) {
  const accent = CATEGORY_ACCENT[event.category] || {
    bar: 'from-purple-500 to-violet-600', text: 'text-purple-300', rgb: '139,92,246'
  };
  const isCompleted = event.status === 'completed';
  const isLive = event.status === 'live' || event.status === 'ongoing';

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 25, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <Link href={`/events/${event.slug}`} className={`group relative block ${className}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 800,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02, z: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-2xl h-full cursor-pointer"
      >
        <div className={`h-[3px] w-full bg-gradient-to-r ${accent.bar}`} />

        <motion.div
          className="absolute inset-0 pointer-events-none z-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.06) 0%, transparent 60%)`,
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `0 0 30px 0 rgba(${accent.rgb}, 0.25), inset 0 0 30px 0 rgba(${accent.rgb}, 0.05)` }}
        />

        <div
          className="absolute inset-0 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />

        <div className="relative h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.banner || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isCompleted ? 'grayscale-[30%] saturate-75' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/50 to-transparent" />

          <div className="absolute top-3 right-3 z-10">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/50 text-red-300 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                LIVE
              </span>
            ) : isCompleted ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/8 border border-white/10 text-white/35 backdrop-blur-sm uppercase tracking-wide">
                Past
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 backdrop-blur-sm uppercase tracking-wide">
                Upcoming
              </span>
            )}
          </div>

          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 bg-black/50 ${accent.text}`}>
              {event.category}
            </span>
          </div>

          {event.status === 'upcoming' && event.startDate && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
              <CountdownTimer targetDate={event.startDate} compact />
            </div>
          )}
        </div>

        <div className="relative z-10 p-5" style={{ transform: 'translateZ(10px)' }}>
          <h3
            className="text-[17px] font-bold text-white mb-1.5 line-clamp-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {event.title}
          </h3>
          <p className="text-sm text-white/45 mb-4 line-clamp-2 min-h-[36px] leading-relaxed">
            {event.tagline}
          </p>

          <div className="flex flex-col gap-1.5 mb-4">
            {event.startDate && (
              <div className="flex items-center gap-2 text-xs text-white/45">
                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-white/25" />
                <span>{formatDateShort(event.startDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-white/45">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-white/25" />
              <span className="truncate">{event.venue || 'TBA'}</span>
            </div>
            {event.participantCount !== undefined && event.participantCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/45">
                <Users className="w-3.5 h-3.5 shrink-0 text-white/25" />
                <span>{event.participantCount}{event.seats ? `/${event.seats}` : ''} registered</span>
              </div>
            )}
          </div>

          {event.seats && event.seats > 0 && event.status === 'upcoming' && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                <span>{event.seats - (event.seatsRemaining ?? 0)} filled</span>
                <span>{event.seatsRemaining ?? 0} left</span>
              </div>
              <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${accent.bar} rounded-full`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, ((event.seats - (event.seatsRemaining ?? 0)) / event.seats) * 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className={`text-[11px] font-bold uppercase tracking-widest ${accent.text} opacity-70`}>
              {event.category}
            </span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${accent.text} group-hover:gap-2 transition-all duration-200`}>
              <span>Details</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
