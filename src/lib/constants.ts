export const SITE_KEY = "henrik";
export const SITE_NAME = "Agent Henrik";
export const SITE_DESCRIPTION = "Global luxury underground travel curation. Bespoke journeys blending hidden culture, insider access, and storytelling.";
export const SITE_URL = "https://agenthenrik.com";

export const NAV_ITEMS = [
  { label: "Explore", href: "/explore" },
  { label: "Experiences", href: "/experiences" },
  { label: "Storytellers", href: "/storytellers" },
  { label: "AH Concierge", href: "/liv" },
  { label: "Journal", href: "/journal" },
  { label: "Press & Media", href: "/press" },
  { label: "Our Story", href: "/about/story" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_COLUMNS = {
  explore: [
    { label: "Storyworld Map", href: "/explore" },
    { label: "Experiences", href: "/experiences" },
    { label: "Storytellers", href: "/storytellers" },
    { label: "Journal", href: "/journal" },
    { label: "Design with AH", href: "/liv" },
  ],
  about: [
    { label: "Our Story", href: "/about/story" },
    { label: "Our Team", href: "/about/team" },
    { label: "Our Services", href: "/about/services" },
    { label: "Booking Process", href: "/about/booking-process" },
    { label: "Pricing & FAQ", href: "/about/pricing-faq" },
    { label: "Press & Media", href: "/press" },
  ],
  legal: [
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Data Protection", href: "/legal/data-protection" },
    { label: "Imprint", href: "/legal/imprint" },
  ],
} as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/agenthenrik",
  youtube: "https://youtube.com/@berlinagenten",
  linkedin: "https://linkedin.com/company/agenthenrik",
} as const;

export const INVESTMENT_LEVELS = [
  {
    value: "comfort",
    label: "Comfort",
    description: "Unique, stylish insider journeys",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Luxury, private access, tailored refinement",
  },
  {
    value: "ultra",
    label: "Ultra",
    description: "Rare encounters, yachts, money-can't-buy access",
  },
] as const;

export const THEME_SLUGS = [
  "authentic-stories",
  "culture-creativity",
  "culinary-journeys",
  "insider-access",
  "celebration-nightlife",
  "adventure-nature",
  "transformation",
  "wellbeing-longevity",
  "innovation-future",
  "epic-moments",
] as const;

export const JOURNAL_CATEGORIES = [
  { slug: "client-journeys", label: "Client Journeys" },
  { slug: "destination-reports", label: "Destination Reports" },
  { slug: "travel-trends", label: "Travel Trends" },
  { slug: "insider-interviews", label: "Insider Interviews" },
] as const;

export const CATEGORY_CONFIG = [
  { slug: "city-town", label: "City & Town" },
  { slug: "village-rural", label: "Village & Rural" },
  { slug: "beach-island", label: "Beach & Island" },
  { slug: "nature-mountain", label: "Nature & Mountain" },
  { slug: "desert-wilderness", label: "Desert & Wilderness" },
  { slug: "cultural-hotspot", label: "Cultural Hotspot" },
  { slug: "hidden-gem", label: "Hidden Gem" },
  { slug: "storyteller", label: "Storytellers" },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "city-town": "#ffffff",
  "village-rural": "#86efac",
  "beach-island": "#38bdf8",
  "nature-mountain": "#a5f3fc",
  "desert-wilderness": "#fcd34d",
  "cultural-hotspot": "#f472b6",
  "hidden-gem": "#c084fc",
  storyteller: "#fbbf24",
};

export const MAP_CONFIG = {
  center: [30, 0] as [number, number],
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
  tileUrl: {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  },
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
} as const;
