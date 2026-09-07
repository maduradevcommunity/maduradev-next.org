export type UserRole = "admin" | "core_team";

export type EventFormat = "webinar" | "workshop" | "bootcamp" | "bincang-bincang" | "hackathon";

export interface UserProfile {
  id: string;
  role: UserRole;
  can_manage_events?: boolean;
  can_manage_media?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  format: EventFormat;
  description_small: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  url: string | null;
  is_online: boolean;
  is_new: boolean;
  is_published: boolean;
  rsvp_enabled: boolean;
  max_attendees: number | null;
  type: "internal" | "partner" | null;
  price: number | null;
  author_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CoreTeam {
  id: string;
  name: string;
  position: string;
  description: string | null;
  avatar_url: string | null;
  instagram: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  order_index: number;
  is_active: boolean;
  user_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  instagram: string | null;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  region: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MediaPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string | null;
  type: "kabar" | "blog";
  status: "published" | "draft";
  author_id: string | null;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}
