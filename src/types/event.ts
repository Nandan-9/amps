export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
  photo: string;
  linkedin?: string;
  website?: string;
}

export interface Organizer {
  id: string;
  name: string;
  position: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  instagram?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  website: string;
  tier: 'title' | 'gold' | 'silver' | 'community' | 'media';
}

export interface Winner {
  position: 1 | 2 | 3;
  teamName: string;
  members: string[];
  prize: string;
  photo?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Testimonial {
  id: string;
  name: string;
  college: string;
  rating: number;
  comment: string;
  photo?: string;
}

export interface Resource {
  title: string;
  type: 'brochure' | 'rulebook' | 'poster' | 'schedule' | 'certificate' | 'slides';
  url: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export type EventCategory =
  | 'Workshop'
  | 'Photography'
  | 'Videography'
  | 'Editing'
  | 'Film Making'
  | 'Competition'
  | 'Launch Event'
  | 'Anime Event'
  | 'Film Quiz'
  | 'Movie Screening';

export type EventStatus = 'upcoming' | 'live' | 'completed' | 'ongoing';

export interface Event {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  banner?: string;
  gallery?: GalleryImage[];
  featured?: boolean;
  category: EventCategory;
  tags?: string[];
  status: EventStatus;
  venue?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  registrationLink?: string;
  registrationFee?: number | 'Free' | 'TBA';
  seats?: number;
  seatsRemaining?: number;
  eligibility?: string;
  highlights?: string[];
  agenda?: AgendaItem[];
  speakers?: Speaker[];
  organizers?: Organizer[];
  faq?: FAQ[];
  sponsors?: Sponsor[];
  resources?: Resource[];
  afterMovie?: string;
  testimonials?: Testimonial[];
  winners?: Winner[];
  participantCount?: number;
  createdAt?: string;
  relatedEventIds?: string[];
  streamingLink?: string;
  liveAnnouncement?: string;
  screenedMovies?: string[];
}
