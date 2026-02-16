export interface Theme {
  id: string;
  slug: string;
  title: string;
  definition: string | null;
  tagline: string | null;
  includes: string[] | null;
  activities: string[] | null;
  purpose: string | null;
  arrival_elements: string[] | null;
  immersion_elements: string[] | null;
  climax_elements: string[] | null;
  reflection_elements: string[] | null;
  tone_keywords: string[] | null;
  emphasize: string[] | null;
  avoid: string[] | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

export interface Storyworld {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  atmosphere: string | null;
  arrival_mood: string | null;
  immersion_zones: string[] | null;
  climax_moments: string[] | null;
  reflection_moments: string[] | null;
  suggested_theme_ids: string[] | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  latitude: number | null;
  longitude: number | null;
  published: boolean;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
}

export interface Storyteller {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  portrait_url: string | null;
  signature_experiences: string[] | null;
  linked_storyworld_ids: string[] | null;
  linked_theme_ids: string[] | null;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

export interface PressItem {
  id: string;
  title: string;
  source: string;
  quote: string | null;
  published_at: string | null;
  pdf_url: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  hero_image_url: string | null;
  content: string | null;
  excerpt: string | null;
  published_at: string | null;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  service_type: string | null;
  region_availability: string[] | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  destination: string | null;
  travel_dates: string | null;
  group_size: number | null;
  investment_level: string | null;
  preferences: string | null;
  notes: string | null;
  ai_draft_itinerary: string | null;
  source_storyworld_id: string | null;
  source_theme_id: string | null;
  status: "new" | "contacted" | "qualified" | "converted" | "closed";
  created_at: string;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  note: string;
  created_at: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConciergeSession {
  id: string;
  session_id: string;
  messages: ConversationMessage[];
  message_count: number;
  last_user_message: string | null;
  source_theme_id: string | null;
  source_storyworld_id: string | null;
  source_storyteller_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageMeta {
  id: string;
  page_path: string;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}
