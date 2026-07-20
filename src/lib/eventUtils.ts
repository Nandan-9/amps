import Fuse from 'fuse.js';
import { format } from 'date-fns';
import type { Event, EventCategory, EventStatus } from '@/types/event';

export const getCategoryColor = (category: EventCategory): string => {
  const map: Record<EventCategory, string> = {
    'Workshop': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Photography': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    'Videography': 'text-pink-400 bg-pink-400/10 border-pink-400/30',
    'Editing': 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    'Film Making': 'text-pink-400 bg-pink-400/10 border-pink-400/30',
    'Competition': 'text-red-400 bg-red-400/10 border-red-400/30',
    'Launch Event': 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    'Anime Event': 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    'Film Quiz': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    'Movie Screening': 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  };
  return map[category] || 'text-gray-400 bg-gray-400/10 border-gray-400/30';
};

export const getStatusColor = (status: EventStatus): string => {
  if (status === 'upcoming') return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  if (status === 'live' || status === 'ongoing') return 'text-red-400 bg-red-500/10 border-red-400/30';
  return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'TBA';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return 'TBA';
  }
};

export const formatDateShort = (dateString?: string): string => {
  if (!dateString) return 'TBA';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return 'TBA';
  }
};

export const getTimeRemaining = (targetDate?: string) => {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  if (isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
};

export const filterEvents = (
  events: Event[],
  query: string,
  category: string,
  statuses: EventStatus[]
): Event[] => {
  let filtered = events;

  if (statuses.length > 0) {
    filtered = filtered.filter(e => statuses.includes(e.status));
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(e => e.category === category);
  }
  if (query.trim()) {
    const fuse = new Fuse(filtered, {
      keys: ['title', 'tagline', 'category', 'tags', 'venue', 'speakers.name'],
      threshold: 0.4,
    });
    filtered = fuse.search(query).map(r => r.item);
  }
  return filtered;
};

export const sortEvents = (events: Event[], sortBy: string): Event[] => {
  const sorted = [...events];
  switch (sortBy) {
    case 'newest': return sorted.sort((a, b) => new Date(b.startDate || b.createdAt || 0).getTime() - new Date(a.startDate || a.createdAt || 0).getTime());
    case 'oldest': return sorted.sort((a, b) => new Date(a.startDate || a.createdAt || 0).getTime() - new Date(b.startDate || b.createdAt || 0).getTime());
    case 'alphabetical': return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'deadline': return sorted.sort((a, b) => new Date(a.registrationDeadline || 0).getTime() - new Date(b.registrationDeadline || 0).getTime());
    default: return sorted;
  }
};
