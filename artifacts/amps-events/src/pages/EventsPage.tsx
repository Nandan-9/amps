'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, stagger, animate } from 'framer-motion';
import {
  Search, ChevronDown, SearchX, ArrowRight,
  Film, X, Zap, Users, CalendarDays, MapPin
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { events } from '@/data/events';
import { filterEvents, sortEvents } from '@/utils/eventUtils';
import type { Event, EventCategory, EventStatus } from '@/types/event';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { EventCard } from '@/components/events/EventCard';
import { CountdownTimer } from '@/components/events/CountdownTimer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Magnetic } from '@/components/ui/Magnetic';
import { ParticleField } from '@/components/ui/ParticleField';
import { IntroVideo } from '@/components/ui/IntroVideo';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

const CATEGORIES: (EventCategory | 'All')[] = [
  'All', 'Workshop', 'Photography', 'Videography', 'Editing', 'Film Making',
  'Competition', 'Launch Event', 'Anime Event', 'Film Quiz', 'Movie Screening'
];

const MARQUEE_ITEMS = [
  '🎬 AMPS × AMRITA', '📽️ CREATIVITY WORKSHOP', '🚀 PROJECT HAIL MARY',
  '🎭 SHORT FLICK FEST', '🏆 DA VINCI CLUE', '🎌 OTAKU CHALLENGE',
  '🎥 FILM SCREENINGS', '✨ AMRITA UNIVERSITY', '🌟 JOIN THE COMMUNITY',
  '🎬 AMPS × AMRITA', '📽️ CREATIVITY WORKSHOP', '🚀 PROJECT HAIL MARY',
  '🎭 SHORT FLICK FEST', '🏆 DA VINCI CLUE', '🎌 OTAKU CHALLENGE',
  '🎥 FILM SCREENINGS', '✨ AMRITA UNIVERSITY', '🌟 JOIN THE COMMUNITY',
];

// ─── Word-by-word reveal animation ─────────────────────────────────────────
function WordReveal({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block overflow-hidden"
          style={{ marginRight: '0.25em' }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
}

// ─── Upcoming carousel strip ────────────────────────────────────────────────
function UpcomingStrip({ events: ev }: { events: Event[] }) {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );
  return (
    <div className="-mx-4 md:-mx-10 px-4 md:px-10 overflow-hidden" ref={emblaRef}>
      <div className="flex gap-5 touch-pan-y">
        {ev.map(e => (
          <div key={e.id} className="flex-[0_0_85%] sm:flex-[0_0_55%] md:flex-[0_0_38%] lg:flex-[0_0_28%] min-w-0">
            <EventCard event={e} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Spotlight hover section wrapper ────────────────────────────────────────
function SpotlightSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className={`relative ${className}`}
      id={id}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(400px circle at ${x}px ${y}px, rgba(139,92,246,0.06) 0%, transparent 80%)`
          ),
        }}
      />
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function EventsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro unless already seen this session
    try { return !sessionStorage.getItem('amps-intro-seen'); } catch { return true; }
  });
  const dismissIntro = () => setShowIntro(false);
  const { scrollY } = useScroll();

  // Multi-layer hero parallax
  const heroLayer1Y = useTransform(scrollY, [0, 700], [0, 120]);
  const heroLayer2Y = useTransform(scrollY, [0, 700], [0, 80]);
  const heroLayer3Y = useTransform(scrollY, [0, 700], [0, 40]);

  // Mouse-tracking parallax for hero
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const heroSpringX = useSpring(heroMouseX, { stiffness: 60, damping: 20 });
  const heroSpringY = useSpring(heroMouseY, { stiffness: 60, damping: 20 });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatuses, setActiveStatuses] = useState<EventStatus[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showNavJoinDropdown, setShowNavJoinDropdown] = useState(false);
  const [showFooterJoinDropdown, setShowFooterJoinDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Any key press also dismisses the intro
  useEffect(() => {
    if (!showIntro) return;
    const handler = (e: KeyboardEvent) => { if (e.key) dismissIntro(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showIntro]);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    heroMouseX.set((e.clientX - cx) / cx);
    heroMouseY.set((e.clientY - cy) / cy);
  };

  const [liveEvents, setLiveEvents] = useState<Event[]>(events);
  useEffect(() => {
    const fetchLiveRegistrations = async () => {
      try {
        const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        const res = await fetch(`${apiBase}/api/events/registrations`);
        if (res.ok) {
          const registrations: Record<string, number> = await res.json();
          setLiveEvents(prev => prev.map(event => {
            const key = event.slug || event.id;
            const count = registrations[key] || registrations[event.id] || 0;
            if (count > 0) {
              return {
                ...event,
                seatsRemaining: event.seats ? Math.max(0, (event.seatsRemaining ?? event.seats) - count) : 0,
                participantCount: (event.participantCount ?? 0) + count,
              };
            }
            return event;
          }));
        }
      } catch {}
    };
    fetchLiveRegistrations();
  }, []);

  const featuredEvent = liveEvents.find(e => e.featured);
  const upcomingEvents = liveEvents.filter(e => e.status === 'upcoming' || e.status === 'live');
  const gridEvents = sortEvents(filterEvents(liveEvents, searchQuery, activeCategory, activeStatuses), sortBy);

  const toggleStatus = (status: EventStatus) =>
    setActiveStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);

  return (
    <div
      className="min-h-screen bg-[#030305] text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden"
      style={{ cursor: 'none' }}
    >
      {/* ── Intro overlay — shown on first visit each session ── */}
      {showIntro && <IntroVideo onComplete={dismissIntro} />}

      {/* ── Global interactive overlays ── */}
      <CustomCursor />
      <ScrollProgress />

      {/* ─────────── NAV ─────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#030305]/90 backdrop-blur-xl border-b border-white/8 py-3 shadow-2xl shadow-black/50'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-[0.15em] text-white transition-colors group-hover:text-purple-300"
              style={{ fontFamily: 'var(--app-font-headline)' }}>
              AMPS
            </span>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors tracking-widest">
              EVENTS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest">
            <a href="#about" className="text-white/40 hover:text-white transition-colors">ABOUT</a>
            <div className="relative">
              <Magnetic strength={0.25}>
                <button
                  onClick={() => setShowNavJoinDropdown(!showNavJoinDropdown)}
                  onBlur={() => setTimeout(() => setShowNavJoinDropdown(false), 200)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/12 hover:border-purple-500/50 bg-white/4 hover:bg-purple-500/10 text-white/60 hover:text-white transition-all"
                >
                  JOIN AMPS <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </Magnetic>
              <AnimatePresence>
                {showNavJoinDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0a0a12]/97 backdrop-blur-xl border border-white/10 p-2 shadow-2xl"
                  >
                    <a href="https://forms.gle/wgh2muV9d5pRzMt3A" target="_blank" rel="noreferrer"
                      className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-white/8 text-white transition-colors">
                      General Registration
                    </a>
                    <a href="https://forms.gle/HHX5vBfuo46Q82Le8" target="_blank" rel="noreferrer"
                      className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-white/8 text-cyan-400 transition-colors mt-1">
                      Biotech Students
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ─────────── HERO ─────────── */}
      <section
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
        onMouseMove={handleHeroMouseMove}
      >
        {/* Layered parallax backgrounds */}
        <motion.div style={{ y: heroLayer1Y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#030305]" />
          {/* Grid dots */}
          <div className="absolute inset-0 grid-dots opacity-50" />
        </motion.div>

        {/* Orbs that track mouse (subtle) */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ y: heroLayer2Y }}
        >
          <motion.div
            className="absolute top-[10%] left-[5%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
              x: useTransform(heroSpringX, v => v * -40),
              y: useTransform(heroSpringY, v => v * -20),
            }}
          />
          <motion.div
            className="absolute bottom-[5%] right-[0%] w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
              x: useTransform(heroSpringX, v => v * 30),
              y: useTransform(heroSpringY, v => v * 15),
            }}
          />
        </motion.div>

        {/* Interactive particle field — fills hero */}
        <motion.div style={{ y: heroLayer3Y }} className="absolute inset-0 z-0">
          <ParticleField count={90} />
        </motion.div>

        {/* Floating film frame decoration — shifts with mouse */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            x: useTransform(heroSpringX, v => v * 15),
            y: useTransform(heroSpringY, v => v * 8),
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-white/5 rounded"
              style={{
                width: 60 + i * 18,
                height: 40 + i * 10,
                left: `${[8, 74, 18, 62, 33, 82][i]}%`,
                top: `${[18, 12, 62, 72, 42, 52][i]}%`,
              }}
              animate={{ opacity: [0, 0.3, 0], y: [0, -25, 0] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.8, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        {/* Hero text — shifts slightly with mouse (parallax) */}
        <motion.div
          className="relative z-10 text-center px-5 max-w-[1100px] mx-auto pt-24"
          style={{
            x: useTransform(heroSpringX, v => v * -10),
            y: useTransform(heroSpringY, v => v * -5),
          }}
        >
          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 inline-flex items-center px-6 py-2.5 rounded-full border border-purple-500/35 bg-gradient-to-r from-purple-500/12 to-cyan-500/12 shadow-[0_0_35px_rgba(139,92,246,0.22)] backdrop-blur-md"
          >
            <span className="text-xs font-black uppercase tracking-[0.35em] bg-gradient-to-r from-violet-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">
              Amrita Motion Picture Society
            </span>
          </motion.div>

          {/* Main headline — massive Bebas Neue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h1
              style={{ fontFamily: 'var(--app-font-headline)', lineHeight: 0.92, letterSpacing: '0.04em' }}
              className="text-[clamp(72px,14vw,200px)] font-normal text-white leading-none mb-6 select-none"
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                DISCOVER
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                CREATE
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                INSPIRE
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-base md:text-lg text-white/40 max-w-xl mx-auto mb-12 font-light tracking-wide leading-relaxed"
          >
            Cinematic workshops, screenings, competitions & unforgettable experiences — curated by the creative heart of campus.
          </motion.p>

          {/* CTA buttons with magnetic effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Magnetic strength={0.3}>
              <button
                onClick={() => document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-10 py-4 rounded-full bg-white text-black text-sm font-black tracking-widest uppercase overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:shadow-[0_0_60px_rgba(139,92,246,0.3)] transition-shadow duration-500"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Explore Events</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
              </button>
            </Magnetic>

            {featuredEvent && (
              <Magnetic strength={0.25}>
                <button
                  onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-4 rounded-full border border-white/12 text-white/60 hover:text-white text-sm font-bold tracking-widest uppercase hover:bg-white/6 hover:border-white/30 transition-all"
                >
                  Featured Event
                </button>
              </Magnetic>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.span
            className="text-[9px] uppercase tracking-[0.4em] text-white/25"
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll
          </motion.span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent origin-top"
            animate={{ scaleY: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ─────────── MARQUEE TICKER ─────────── */}
      <div className="relative border-y border-white/6 bg-white/[0.015] overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 mx-6 text-[11px] font-bold tracking-[0.25em] text-white/25 uppercase">
              {item}
              <span className="w-1 h-1 rounded-full bg-purple-500/50 shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ─────────── FEATURED EVENT ─────────── */}
      {featuredEvent && (
        <SpotlightSection className="py-10 md:py-14" id="featured">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10">
            <AnimatedSection>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-gradient-to-r from-amber-400 to-orange-500" />
                <span className="text-2xl font-bold uppercase tracking-[0.3em] text-amber-400">Featured Event</span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              <motion.div
                whileHover={{ scale: 1.005 }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className="relative rounded-3xl overflow-hidden border border-white/8"
                style={{ background: 'linear-gradient(135deg,rgba(20,10,40,0.97) 0%,rgba(5,5,15,0.99) 100%)' }}
              >
                {/* Banner bg */}
                <div className="absolute inset-0 overflow-hidden">
                  <img src={featuredEvent.banner} alt={featuredEvent.title}
                    className="w-full h-full object-cover opacity-18 scale-105 transition-transform duration-[2s] hover:scale-110 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/85 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent" />
                </div>

                <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 p-8 md:p-14 items-start">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black">★ Featured</span>
                      <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border border-purple-500/40 text-purple-300 bg-purple-500/10">{featuredEvent.category}</span>
                      {(featuredEvent.status === 'upcoming' || featuredEvent.status === 'live') && (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
                          {featuredEvent.status === 'live' ? '🔴 Live Now' : '⚡ Upcoming'}
                        </span>
                      )}
                    </div>

                    <h2
                      className="text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-none"
                      style={{ fontFamily: 'var(--app-font-headline)', letterSpacing: '0.04em' }}
                    >
                      <WordReveal text={featuredEvent.title} delay={0.1} />
                    </h2>
                    <p className="text-base md:text-lg text-white/55 mb-8 leading-relaxed font-light">
                      {featuredEvent.tagline}
                    </p>

                    <div className="flex flex-wrap gap-5 mb-8 text-sm text-white/45">
                      {featuredEvent.startDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-purple-400" />
                          <span>{new Date(featuredEvent.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {featuredEvent.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          <span>{featuredEvent.venue}</span>
                        </div>
                      )}
                      {featuredEvent.seats && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400" />
                          <span>{featuredEvent.seats - (featuredEvent.seatsRemaining ?? 0)}/{featuredEvent.seats} registered</span>
                        </div>
                      )}
                    </div>

                    {featuredEvent.seats && featuredEvent.seats > 0 && (
                      <div className="mb-8 max-w-sm">
                        <div className="flex justify-between text-xs text-white/35 mb-2">
                          <span>Seats filling up</span>
                          <span className={(featuredEvent.seatsRemaining ?? 0) === 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                            {(featuredEvent.seatsRemaining ?? 0) === 0 ? 'FULL' : `${featuredEvent.seatsRemaining} remaining`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, ((featuredEvent.seats - (featuredEvent.seatsRemaining ?? 0)) / featuredEvent.seats) * 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <Magnetic strength={0.2}>
                        <a
                          href={featuredEvent.registrationLink} target="_blank" rel="noreferrer"
                          className="group/btn relative inline-block px-8 py-3.5 rounded-xl bg-white text-black text-sm font-bold tracking-wide uppercase overflow-hidden hover:scale-105 transition-transform"
                        >
                          <span className="relative z-10 group-hover/btn:text-black transition-colors">Register Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-cyan-400 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </a>
                      </Magnetic>
                      <Magnetic strength={0.15}>
                        <Link
                          href={`/events/${featuredEvent.id}`}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/12 text-white text-sm font-bold tracking-wide uppercase hover:bg-white/6 hover:border-white/25 transition-all"
                        >
                          Event Details <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Magnetic>
                    </div>
                  </div>

                  {featuredEvent.startDate && (
                    <div className="lg:self-center">
                      <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm p-6 min-w-[180px] text-center">
                        <div className="text-[9px] uppercase tracking-[0.35em] text-white/35 mb-3">Counting Down</div>
                        <CountdownTimer targetDate={featuredEvent.startDate} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </SpotlightSection>
      )}

      {/* ─────────── UPCOMING EVENTS ─────────── */}
      {upcomingEvents.length > 0 && (
        <section className="py-10 md:py-14 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10">
            <AnimatedSection>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-3"
                  >
                    <div className="w-8 h-px bg-gradient-to-r from-cyan-400 to-blue-500" />
                    <span className="text-2xl font-bold uppercase tracking-[0.3em] text-cyan-400">Don't Miss</span>
                  </motion.div>
                  <h2 style={{ fontFamily: 'var(--app-font-headline)', fontSize: 'clamp(36px,5vw,72px)', letterSpacing: '0.04em', lineHeight: 0.95 }} className="text-white">
                    <WordReveal text="UPCOMING EVENTS" delay={0.05} />
                  </h2>
                </div>
                <Magnetic strength={0.2}>
                  <button
                    onClick={() => document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hidden md:flex items-center gap-2 text-xs font-bold text-white/35 hover:text-white transition-colors uppercase tracking-widest group"
                  >
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Magnetic>
              </div>
              <UpcomingStrip events={upcomingEvents} />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ─────────── ALL EVENTS GRID ─────────── */}
      <SpotlightSection id="events-grid" className="py-10 md:py-14">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-5 md:px-10">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 mb-3"
                >
                  <div className="w-8 h-px bg-gradient-to-r from-purple-400 to-violet-500" />
                  <span className="text-2xl font-bold uppercase tracking-[0.3em] text-purple-400">Browse</span>
                </motion.div>
                <h2 style={{ fontFamily: 'var(--app-font-headline)', fontSize: 'clamp(36px,5vw,72px)', letterSpacing: '0.04em', lineHeight: 0.95 }} className="text-white">
                  <WordReveal text="ALL EVENTS" delay={0.05} />
                </h2>
              </div>
              <div className="text-right hidden md:block">
                <motion.div
                  key={gridEvents.length}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-white/15"
                  style={{ fontFamily: 'var(--app-font-headline)' }}
                >
                  {gridEvents.length}
                </motion.div>
                <div className="text-[10px] uppercase tracking-widest text-white/25">Results</div>
              </div>
            </div>
          </AnimatedSection>

          {/* Filter bar */}
          <div className="sticky top-14 z-40 mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 bg-[#030305]/92 backdrop-blur-2xl p-4 shadow-2xl shadow-black/60"
            >
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    type="text"
                    placeholder="Search events, venues..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/40 focus:bg-white/6 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {(['upcoming', 'live', 'completed'] as EventStatus[]).map(status => (
                    <motion.button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        activeStatuses.includes(status)
                          ? status === 'live'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                          : 'bg-white/4 border border-white/8 text-white/35 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {status === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1.5" />}
                      {status}
                    </motion.button>
                  ))}
                  <div className="hidden md:block w-px h-6 bg-white/8 mx-1" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="hidden md:block bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-[11px] text-white/50 focus:outline-none appearance-none cursor-pointer hover:bg-white/7 transition-colors"
                  >
                    <option value="newest" className="bg-[#0a0a12]">Newest</option>
                    <option value="oldest" className="bg-[#0a0a12]">Oldest</option>
                    <option value="deadline" className="bg-[#0a0a12]">Deadline</option>
                    <option value="alphabetical" className="bg-[#0a0a12]">A–Z</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all font-bold tracking-wide ${
                      activeCategory === cat ? 'text-white' : 'text-white/35 hover:text-white/65'
                    }`}
                  >
                    {activeCategory === cat && (
                      <motion.div
                        layoutId="activeCat"
                        className="absolute inset-0 rounded-full bg-white/8 border border-white/15"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Events Grid */}
          <AnimatePresence mode="popLayout">
            {gridEvents.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {gridEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.045, 0.45) }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-28 rounded-3xl border border-dashed border-white/6"
              >
                <SearchX className="w-12 h-12 text-white/12 mb-4" />
                <h3 className="text-base font-bold text-white/45 mb-2">No events found</h3>
                <p className="text-sm text-white/25 mb-6">Try adjusting your filters or search query.</p>
                <Magnetic strength={0.2}>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveStatuses([]); }}
                    className="px-6 py-2.5 rounded-full border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/25 transition-all"
                  >
                    Clear Filters
                  </button>
                </Magnetic>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SpotlightSection>

      {/* ─────────── ABOUT ─────────── */}
      <section id="about" className="py-16 md:py-20 relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <AnimatedSection>
            {/* Eyebrow + heading */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/25">About AMPS</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/10" />
              </div>
              <h2
                style={{ fontFamily: 'var(--app-font-headline)', fontSize: 'clamp(40px,7vw,90px)', letterSpacing: '0.04em', lineHeight: 0.95, color: 'white' }}
                className="mb-4"
              >
                MORE THAN
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  ENTERTAINMENT
                </span>
              </h2>
              <p className="text-base md:text-lg text-white/40 leading-relaxed font-light max-w-2xl mx-auto">
                At AMPS, we believe cinema is more than entertainment — it's a powerful force for inspiring ideas,
                sparking meaningful conversations, and driving positive change.
              </p>
            </div>

            {/* 3-pillar cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {[
                {
                  icon: '🎬',
                  title: 'Cinematic Vision',
                  desc: 'We curate screenings, workshops, and experiences that push the boundaries of film appreciation and production.',
                  color: 'from-violet-500/20 to-purple-600/10',
                  border: 'border-violet-500/20',
                  tag: 'Film Culture'
                },
                {
                  icon: '🤝',
                  title: 'Community First',
                  desc: 'From freshers to final years, AMPS is a space where every story matters and every creator belongs.',
                  color: 'from-cyan-500/20 to-blue-600/10',
                  border: 'border-cyan-500/20',
                  tag: 'Inclusion'
                },
                {
                  icon: '✨',
                  title: 'Creative Growth',
                  desc: 'Learn editing, cinematography, scriptwriting and storytelling — hands-on, collaborative, and always evolving.',
                  color: 'from-pink-500/20 to-rose-600/10',
                  border: 'border-pink-500/20',
                  tag: 'Learning'
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className={`relative rounded-2xl p-6 border ${item.border} overflow-hidden group`}
                  style={{ background: `linear-gradient(135deg, ${item.color.split(' ')[0].replace('from-', '').replace('/20', '')}20, transparent)` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2">{item.tag}</div>
                    <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'var(--app-font-display)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quote strip */}
            <div className="relative rounded-2xl overflow-hidden border border-white/6 p-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5" />
              <blockquote className="relative z-10">
                <p className="text-xl md:text-2xl font-light text-white/60 italic leading-relaxed max-w-3xl mx-auto">
                  &ldquo;Together, we celebrate the magic of storytelling while building a community that learns, connects, and creates a more compassionate world through film.&rdquo;
                </p>
                <cite className="block mt-5 text-[10px] uppercase tracking-[0.4em] text-white/25 not-italic">— AMPS Mission</cite>
              </blockquote>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─────────── FOOTER CTA ─────────── */}
      <footer className="relative py-28 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid-dots opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-10 text-center">
          <AnimatedSection>
            <h2
              className="mb-4 text-white"
              style={{ fontFamily: 'var(--app-font-headline)', fontSize: 'clamp(52px,9vw,120px)', letterSpacing: '0.04em', lineHeight: 0.95 }}
            >
              <WordReveal text="JOIN THE" className="block" delay={0} />
              <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                <WordReveal text="COMMUNITY" delay={0.1} />
              </span>
            </h2>
            <p className="text-sm text-white/35 mb-12 max-w-md mx-auto font-light tracking-wide leading-relaxed">
              Become a part of Amrita's most vibrant creative community. Learn, build, and grow with AMPS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <div className="relative">
                <Magnetic strength={0.3}>
                  <button
                    onClick={() => setShowFooterJoinDropdown(!showFooterJoinDropdown)}
                    onBlur={() => setTimeout(() => setShowFooterJoinDropdown(false), 200)}
                    className="group px-10 py-4 rounded-full bg-white text-black text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.12)] flex items-center gap-2"
                  >
                    Join AMPS <ChevronDown className="w-4 h-4" />
                  </button>
                </Magnetic>
                <AnimatePresence>
                  {showFooterJoinDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 rounded-xl bg-[#0a0a12]/97 backdrop-blur-xl border border-white/10 p-2 shadow-2xl"
                    >
                      <a href="https://forms.gle/wgh2muV9d5pRzMt3A" target="_blank" rel="noreferrer"
                        className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-white/8 text-white transition-colors">
                        General Registration
                      </a>
                      <a href="https://forms.gle/HHX5vBfuo46Q82Le8" target="_blank" rel="noreferrer"
                        className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-white/8 text-cyan-400 transition-colors mt-1">
                        Biotech Students
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Magnetic strength={0.25}>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-10 py-4 rounded-full border border-white/10 text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-white/25 transition-all"
                >
                  Back to Top
                </button>
              </Magnetic>
            </div>

            <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-white/18 uppercase tracking-widest">
              <div>
                <span style={{ fontFamily: 'var(--app-font-headline)', letterSpacing: '0.15em' }} className="text-white/35 text-sm">AMPS</span>
                <span className="ml-2">© {new Date().getFullYear()} Amrita Motion Picture Society</span>
              </div>
              <div>All Rights Reserved · Amritapuri Campus</div>
            </div>
          </AnimatedSection>
        </div>
      </footer>
    </div>
  );
}