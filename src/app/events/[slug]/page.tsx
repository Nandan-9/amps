'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import ReactPlayer from 'react-player';
import Masonry from 'react-masonry-css';

import {
  CalendarDays, MapPin, Clock, Users, ArrowLeft, Share2,
  ChevronDown, Trophy, FileText, Star, Link as LinkIcon,
  PlayCircle, Maximize2, ExternalLink
} from 'lucide-react';

import { events } from '@/data/events';
import { formatDate, getCategoryColor, getStatusColor } from '@/lib/eventUtils';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CountdownTimer } from '@/components/events/CountdownTimer';
import { EventCard } from '@/components/events/EventCard';

const Player = ReactPlayer as unknown as React.ComponentType<{
  url: string; width: string; height: string; className?: string; controls?: boolean; light?: boolean;
}>;

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const event = events.find(e => e.slug === slug || e.id === slug);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 250]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center text-center p-4">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/60 mb-8">This event has vanished into the cosmos.</p>
        <Link href="/events" className="px-6 py-3 glass rounded-full hover:bg-white/10 transition-colors">
          Return to Events
        </Link>
      </div>
    );
  }

  const isLive = event.status === 'live' || event.status === 'ongoing';
  const isPast = event.status === 'completed';
  const isUpcoming = event.status === 'upcoming';

  const banner = event.banner || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80';
  const description = event.description || '';
  const venue = event.venue || 'TBA';
  const address = event.address || '';
  const seats = event.seats ?? 0;
  const seatsRemaining = event.seatsRemaining ?? 0;
  const registrationFee = event.registrationFee ?? 'Free';
  const registrationDeadline = event.registrationDeadline || '';
  const registrationLink = event.registrationLink || '#';
  const highlights = event.highlights || [];
  const agenda = event.agenda || [];
  const speakers = event.speakers || [];
  const organizers = event.organizers || [];
  const gallery = event.gallery || [];
  const faq = event.faq || [];
  const resources = event.resources || [];
  const relatedEventIds = event.relatedEventIds || [];
  const screenedMovies = event.screenedMovies || [];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const masonryBreakpoints = {
    default: 3,
    1024: 2,
    640: 1
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white">

      {/* Sticky Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/events" className="p-2 rounded-full glass hover:bg-white/10 transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="hidden md:flex items-center gap-2 text-sm text-white/60 font-medium">
              <Link href="/events" className="hover:text-white transition-colors">Events</Link>
              <span>/</span>
              <span className="text-white truncate max-w-[200px]">{event.title}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/70">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            {screenedMovies.length > 0 && <a href="#screenings" className="hover:text-white transition-colors">Screenings</a>}
            {agenda.length > 0 && <a href="#schedule" className="hover:text-white transition-colors">Schedule</a>}
            {speakers.length > 0 && <a href="#speakers" className="hover:text-white transition-colors">Speakers</a>}
            {gallery.length > 0 && <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>}
            {faq.length > 0 && <a href="#faq" className="hover:text-white transition-colors">FAQ</a>}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={copyLink} className="p-2 rounded-full glass hover:bg-white/10 transition-colors" title="Copy Link">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <section className="relative h-[80vh] min-h-[600px] flex flex-col justify-end pb-24 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 w-full pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${getStatusColor(event.status)} flex items-center gap-1.5`}>
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                {event.status}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl drop-shadow-lg">
              {event.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-8 font-medium drop-shadow-md">
              {event.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-white/90 glass w-fit px-6 py-4 rounded-2xl border-white/20">
              {event.startDate && (
                <>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-purple-400" />
                    {formatDate(event.startDate)}
                  </div>
                  <div className="w-px h-5 bg-white/20 hidden sm:block" />
                </>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                {venue}
              </div>
              {(isPast || seats > 0) && (
                <>
                  <div className="w-px h-5 bg-white/20 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-fuchsia-400" />
                    {isPast ? `${event.participantCount || 100}+ Attendees` : `${seats} Seats`}
                  </div>
                </>
              )}
            </div>

            {(isLive || isUpcoming) && event.startDate && (
              <div className="mt-8 flex items-center gap-6">
                <CountdownTimer targetDate={event.startDate} isLive={isLive} />
                {isLive && event.streamingLink && (
                  <a href={event.streamingLink} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 transition-colors animate-pulse">
                    <PlayCircle className="w-5 h-5" /> Join Live Stream
                  </a>
                )}
              </div>
            )}

            {event.liveAnnouncement && (
              <div className="mt-6 inline-block glass px-4 py-2 border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-sm font-medium animate-pulse">
                  <span className="mr-2">🔔</span> {event.liveAnnouncement}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 relative">

        {/* Left Column - Content */}
        <div className="w-full lg:w-2/3 space-y-24">

          {/* About */}
          {description && (
            <section id="about" className="scroll-mt-32">
              <AnimatedSection>
                <SectionHeading title="About This Event" />
                <div className="prose prose-invert prose-lg prose-p:text-white/70 prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                  </ReactMarkdown>
                </div>
              </AnimatedSection>

              {highlights.length > 0 && (
                <AnimatedSection delay={0.2}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                    {highlights.map((highlight, i) => (
                      <div key={i} className="glass p-5 rounded-2xl border-white/5 hover:border-purple-500/30 transition-colors flex items-start gap-3">
                        <Star className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-white/90">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              )}
            </section>
          )}

          {/* Screened Movies */}
          {screenedMovies.length > 0 && (
            <section id="screenings" className="scroll-mt-32">
              <AnimatedSection>
                <SectionHeading title="Featured Screenings" subtitle={`${screenedMovies.length} cinematic masterpieces curated for this event.`} />
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  {screenedMovies.map((movie, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.03] transition-all duration-300 flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{movie}</div>
                        <div className="text-xs text-white/40 uppercase">Screened Title</div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </section>
          )}

          {/* Schedule */}
          {agenda.length > 0 && (
            <section id="schedule" className="scroll-mt-32">
              <AnimatedSection>
                <SectionHeading title="Schedule" />
                <div className="relative pl-6 sm:pl-8 border-l-2 border-white/10 space-y-12">
                  {agenda.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-5 h-5 rounded-full bg-[#050508] border-4 border-purple-500 z-10" />
                      <div className="mb-2 text-cyan-400 font-mono text-sm font-semibold tracking-wider">{item.time}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      {item.description && <p className="text-white/60">{item.description}</p>}
                      {item.speaker && (
                        <div className="mt-3 inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs text-white/80">
                          <Users className="w-3 h-3" /> By {item.speaker}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </section>
          )}

          {/* Speakers */}
          {speakers.length > 0 && (
            <section id="speakers" className="scroll-mt-32">
              <AnimatedSection>
                <SectionHeading title="Speakers & Mentors" />
                <div className="grid sm:grid-cols-2 gap-6">
                  {speakers.map(speaker => (
                    <div key={speaker.id} className="glass p-6 rounded-3xl border-white/5 hover:bg-white/[0.08] transition-colors group">
                      <div className="flex gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={speaker.photo} alt={speaker.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500/20 group-hover:ring-purple-500 transition-all" />
                        <div>
                          <h4 className="text-lg font-bold text-white">{speaker.name}</h4>
                          <p className="text-sm text-cyan-400 font-medium mb-1">{speaker.role}</p>
                          <p className="text-xs text-white/50">{speaker.organization}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-white/70 line-clamp-3">{speaker.bio}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </section>
          )}

          {/* Winners */}
          {event.winners && event.winners.length > 0 && (
            <section>
              <AnimatedSection>
                <SectionHeading title="🏆 Hall of Fame" subtitle="The champions of this event." />
                <div className="grid md:grid-cols-3 gap-6 mt-8 items-end">
                  {[
                    event.winners.find(w => w.position === 2),
                    event.winners.find(w => w.position === 1),
                    event.winners.find(w => w.position === 3)
                  ].filter(Boolean).map((winner) => {
                    if (!winner) return null;
                    const isFirst = winner.position === 1;
                    const colors = {
                      1: 'from-amber-500/20 to-orange-500/5 border-amber-500/50 text-amber-400',
                      2: 'from-gray-300/20 to-gray-500/5 border-gray-400/50 text-gray-300',
                      3: 'from-amber-700/20 to-orange-900/5 border-amber-700/50 text-amber-600'
                    };
                    return (
                      <div key={winner.position} className={`glass rounded-t-3xl rounded-b-xl border-t-2 bg-gradient-to-b ${colors[winner.position as 1 | 2 | 3]} ${isFirst ? 'md:-translate-y-8 p-8 pb-12' : 'p-6 pb-8'} flex flex-col items-center text-center relative`}>
                        <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#050508] border-2 flex items-center justify-center font-bold text-xl" style={{ borderColor: 'inherit' }}>
                          {winner.position}
                        </div>
                        <Trophy className={`w-10 h-10 mb-4 ${isFirst ? 'scale-125 mb-6' : 'opacity-80'}`} style={{ color: 'inherit' }} />
                        <h4 className="text-xl font-bold text-white mb-2">{winner.teamName}</h4>
                        <div className="text-xs text-white/60 mb-4">{winner.members.join(', ')}</div>
                        <div className="mt-auto px-4 py-2 bg-black/50 rounded-lg text-sm font-semibold w-full border" style={{ borderColor: 'inherit', color: 'inherit' }}>
                          {winner.prize}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedSection>
            </section>
          )}

          {/* Aftermovie */}
          {event.afterMovie && (
            <section>
              <AnimatedSection>
                <SectionHeading title="Aftermovie" />
                <div className="glass rounded-3xl overflow-hidden border-white/10 p-2">
                  <div className="relative pt-[56.25%] w-full rounded-2xl overflow-hidden bg-black">
                    <Player
                      url={event.afterMovie}
                      width="100%"
                      height="100%"
                      className="absolute top-0 left-0"
                      controls
                      light
                    />
                  </div>
                </div>
              </AnimatedSection>
            </section>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <section id="gallery" className="scroll-mt-32">
              <AnimatedSection>
                <SectionHeading title="Gallery" />
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="flex w-auto -ml-4"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {gallery.map((img, i) => (
                    <div key={img.id} className="mb-4 relative group cursor-pointer overflow-hidden rounded-2xl glass" onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Maximize2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ))}
                </Masonry>
              </AnimatedSection>
            </section>
          )}

          {/* Venue & Map */}
          {address && (
            <section>
              <AnimatedSection>
                <SectionHeading title="Venue" />
                <div className="glass rounded-3xl overflow-hidden flex flex-col md:flex-row border-white/10">
                  <div className="p-8 md:w-1/3 flex flex-col justify-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white mb-2">{venue}</h3>
                    <p className="text-white/60 mb-6 flex items-start gap-2">
                      <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
                      {address}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-cyan-400 transition-colors w-fit"
                    >
                      Open in Maps <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="md:w-2/3 h-64 md:h-auto bg-white/5 relative">
                    <iframe
                      title="Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU3ao&q=${encodeURIComponent(address)}`}
                      className="absolute inset-0 grayscale contrast-125 opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                    />
                  </div>
                </div>
              </AnimatedSection>
            </section>
          )}

          {/* FAQ */}
          {faq.length > 0 && (
            <section id="faq" className="scroll-mt-32">
              <AnimatedSection>
                <SectionHeading title="Frequently Asked Questions" />
                <div className="space-y-4">
                  {faq.map((item, i) => (
                    <div key={i} className="glass rounded-2xl border-white/5 overflow-hidden">
                      <button
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="font-semibold text-lg pr-8">{item.question}</span>
                        <ChevronDown className={`w-5 h-5 text-white/50 shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 text-white/60 leading-relaxed border-t border-white/5 mt-2">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </section>
          )}
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="w-full lg:w-1/3 hidden lg:block">
          <div className="sticky top-24 space-y-8">

            {/* Main CTA Card */}
            <div className="glass rounded-3xl p-1 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
              <div className="bg-[#0A0E1A]/80 backdrop-blur-xl rounded-[22px] p-6 md:p-8">

                <h3 className="text-xl font-bold text-white mb-6 pr-8">{event.title}</h3>

                <div className="flex items-baseline gap-2 mb-8 border-b border-white/10 pb-6">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    {typeof registrationFee === 'number' ? `₹${registrationFee}` : registrationFee}
                  </span>
                  {typeof registrationFee === 'number' && <span className="text-sm text-white/40">per person</span>}
                </div>

                {!isPast ? (
                  <div className="space-y-6 mb-8">
                    {seats > 0 && (
                      <div>
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="text-white/60">Availability</span>
                          <span className={seatsRemaining < 10 ? 'text-red-400' : 'text-cyan-400'}>
                            {seatsRemaining} seats left
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${seatsRemaining < 10 ? 'bg-red-500' : 'bg-cyan-500'}`}
                            style={{ width: `${((seats - seatsRemaining) / seats) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {registrationDeadline && (
                      <div className="flex items-start gap-3 text-sm text-white/70 bg-white/5 p-4 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white mb-1">Registration Closes</div>
                          <div>{formatDate(registrationDeadline)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-white/5 rounded-xl text-center text-white/60 font-medium border border-white/10">
                    This event has concluded.
                  </div>
                )}

                {(isUpcoming || isLive) && registrationLink && registrationLink !== '#' ? (
                  <a
                    href={registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`block w-full py-4 rounded-xl text-center font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      seatsRemaining === 0 && seats > 0
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25'
                    }`}
                    onClick={(e) => { if (seatsRemaining === 0 && seats > 0) e.preventDefault(); }}
                  >
                    {seatsRemaining === 0 && seats > 0 ? 'Sold Out' : 'Register Now'}
                  </a>
                ) : null}

                {/* Share Row */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 text-center">Share this event</div>
                  <div className="flex justify-center gap-3">
                    <button onClick={copyLink} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors group" title="Copy Link">
                      <LinkIcon className="w-4 h-4 text-white/60 group-hover:text-white" />
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${event.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-[#25D366]/20 transition-colors group">
                      <div className="w-4 h-4 text-white/60 group-hover:text-[#25D366] font-bold">W</div>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(`Check out ${event.title} by AMPS!`)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors group">
                      <div className="w-4 h-4 text-white/60 group-hover:text-white font-bold">X</div>
                    </a>
                    <a href={`https://linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors group">
                      <div className="w-4 h-4 text-white/60 group-hover:text-[#0A66C2] font-bold">in</div>
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Organizers */}
            {organizers.length > 0 && (
              <div className="glass rounded-3xl p-6 border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Organized By</h4>
                <div className="space-y-4">
                  {organizers.map(org => (
                    <div key={org.id} className="flex items-center gap-3">
                      {org.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={org.photo} alt={org.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-80" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                          {org.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white text-sm">{org.name}</div>
                        <div className="text-xs text-white/50">{org.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div className="glass rounded-3xl p-6 border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Resources</h4>
                <div className="space-y-3">
                  {resources.map((res, i) => (
                    <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                      <FileText className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{res.title}</div>
                        <div className="text-xs text-white/40 uppercase">{res.type}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Related Events */}
      {relatedEventIds.length > 0 && (
        <section className="py-24 bg-[#030305] border-t border-white/5">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <AnimatedSection>
              <SectionHeading title="You Might Also Like" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {events.filter(e => relatedEventIds.includes(e.id)).slice(0, 4).map(related => (
                  <EventCard key={related.id} event={related} />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Mobile Registration Bar */}
      {!isPast && registrationLink && registrationLink !== '#' && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-white/10 p-4 bg-[#0A0E1A]/90 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-white">
                {typeof registrationFee === 'number' ? `₹${registrationFee}` : registrationFee}
              </div>
              {seats > 0 && (
                <div className={`text-xs ${seatsRemaining < 10 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {seatsRemaining} seats left
                </div>
              )}
            </div>
            <a
              href={registrationLink}
              target="_blank"
              rel="noreferrer"
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                seatsRemaining === 0 && seats > 0
                  ? 'bg-white/10 text-white/40'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white active:scale-95'
              }`}
              onClick={(e) => { if (seatsRemaining === 0 && seats > 0) e.preventDefault(); }}
            >
              {seatsRemaining === 0 && seats > 0 ? 'Sold Out' : 'Register Now'}
            </a>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={gallery.map(img => ({ src: img.url, alt: img.alt }))}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
      />
    </div>
  );
}
