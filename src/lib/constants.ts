export const SITE_NAME = "Agent Henrik";
export const SITE_DESCRIPTION = "Global luxury underground travel curation. Bespoke journeys blending hidden culture, insider access, and storytelling.";
export const SITE_URL = "https://agenthenrik.com";

export const NAV_ITEMS = [
  { label: "Explore", href: "/explore" },
  { label: "Journeys", href: "/experiences" },
  { label: "Journal", href: "/journal" },
  { label: "Press", href: "/press" },
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
  ],
  legal: [
    { label: "Terms", href: "/legal/terms" },
    { label: "Data Protection", href: "/legal/data-protection" },
    { label: "Imprint", href: "/legal/imprint" },
  ],
} as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/agenthenrik",
  youtube: "https://youtube.com/@agenthenrik",
  linkedin: "https://linkedin.com/company/agenthenrik",
} as const;

export const INVESTMENT_LEVELS = [
  {
    value: "boutique",
    label: "Boutique",
    description: "Unique, stylish insider journeys",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Luxury, private access, tailored refinement",
  },
  {
    value: "ultra-exclusive",
    label: "Ultra-Exclusive",
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
  { slug: "city-spotlights", label: "City Spotlights" },
  { slug: "scene-reports", label: "Scene Reports" },
  { slug: "insider-interviews", label: "Insider Interviews" },
  { slug: "trend-watch", label: "Trend Watch" },
] as const;

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
