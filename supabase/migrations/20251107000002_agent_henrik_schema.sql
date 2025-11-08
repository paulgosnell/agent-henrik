-- ==========================================
-- Agent Henrik Schema Extensions
-- ==========================================
-- Creates new tables for Agent Henrik's global luxury travel platform:
-- - services (replaces themes for global service types)
-- - press_items (media coverage and press recognition)
-- - corporate_inquiries (for corporate/brand experience requests)
-- - Enhances destinations table with region, video_url, press_featured
-- ==========================================

-- ==========================================
-- 1. SERVICES TABLE (Replaces themes for Agent Henrik)
-- ==========================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'underground',      -- Underground Luxury Journeys
    'lifestyle',        -- Lifestyle & Culture Tours
    'yacht',           -- Sea Holidays (Yachts & Sailing)
    'brand',           -- Brand Experience Travel
    'cool-hunting',    -- Cool Hunting Expeditions
    'storytelling',    -- Storytelling Encounters
    'corporate'        -- Corporate & Group Experiences
  )),
  region_availability TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g., ['Nordic', 'Mediterranean', 'Asia Pacific']
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  video_url TEXT,
  image_url TEXT,
  site site_type DEFAULT 'henrik' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_published ON services(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_services_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_site ON services(site);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);

COMMENT ON TABLE services IS 'Agent Henrik service types (Underground Luxury, Lifestyle Tours, etc.)';
COMMENT ON COLUMN services.service_type IS 'Primary service category';
COMMENT ON COLUMN services.region_availability IS 'Regions where this service is available';

-- ==========================================
-- 2. ENHANCE PRESS ITEMS TABLE
-- ==========================================
-- Press items table already exists for Sweden site
-- Add columns needed for Agent Henrik's press coverage

-- Add missing columns for Agent Henrik press features
ALTER TABLE press_items
  ADD COLUMN IF NOT EXISTS source TEXT,           -- e.g., 'New York Times', 'Forbes'
  ADD COLUMN IF NOT EXISTS quote TEXT,            -- Pull quote for testimonials
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,          -- Link to full article/clipping (replaces link_url for pdfs)
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;    -- B&W image that reveals color on hover

CREATE INDEX IF NOT EXISTS idx_press_published ON press_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_press_site ON press_items(site);

COMMENT ON COLUMN press_items.source IS 'Publication name (NYT, Forbes, etc.)';
COMMENT ON COLUMN press_items.quote IS 'Excerpt for testimonial display';
COMMENT ON COLUMN press_items.thumbnail_url IS 'Grayscale image for hover effect';

-- ==========================================
-- 3. CORPORATE INQUIRIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS corporate_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience_type TEXT CHECK (experience_type IN (
    'innovation-retreat',
    'trend-scouting',
    'brand-activation',
    'incentive',
    'other'
  )),
  group_size INTEGER,
  details TEXT,
  source TEXT DEFAULT 'Corporate Page',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal_sent', 'closed')),
  site site_type DEFAULT 'henrik' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_status ON corporate_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_site ON corporate_inquiries(site);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_created ON corporate_inquiries(created_at DESC);

COMMENT ON TABLE corporate_inquiries IS 'Corporate and brand experience inquiry form submissions';
COMMENT ON COLUMN corporate_inquiries.experience_type IS 'Type of corporate experience requested';

-- ==========================================
-- 4. ENHANCE DESTINATIONS TABLE
-- ==========================================

-- Add new columns for Agent Henrik global destinations
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS region TEXT,              -- Geographic region (Nordic, Mediterranean, etc.)
  ADD COLUMN IF NOT EXISTS service_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Array of service IDs
  ADD COLUMN IF NOT EXISTS video_url TEXT,           -- Cinematic intro video
  ADD COLUMN IF NOT EXISTS press_featured BOOLEAN DEFAULT false; -- Featured in press

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_destinations_press_featured ON destinations(press_featured) WHERE press_featured = true;

COMMENT ON COLUMN destinations.region IS 'Geographic region: Nordic, Mediterranean, Asia Pacific, Americas';
COMMENT ON COLUMN destinations.service_ids IS 'Array of service UUIDs this destination offers';
COMMENT ON COLUMN destinations.video_url IS 'Optional cinematic introduction video';
COMMENT ON COLUMN destinations.press_featured IS 'Highlighted in international press';

-- ==========================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Add trigger for services table
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on new tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Public read policies for services
CREATE POLICY "Anyone can view published services"
  ON services FOR SELECT
  USING (published = true);

-- Public read policies for press items
CREATE POLICY "Anyone can view press items"
  ON press_items FOR SELECT
  USING (published_at IS NOT NULL);

-- Corporate inquiries are private (admin only)
-- No public read policy - authenticated users only

-- ==========================================
-- 7. INITIAL SEED DATA PLACEHOLDER
-- ==========================================
-- Seed data will be added in separate migration: 20251107000003_seed_henrik_content.sql

-- ==========================================
-- Success Message
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Agent Henrik schema migration completed successfully!';
  RAISE NOTICE 'Created tables: services, corporate_inquiries';
  RAISE NOTICE 'Enhanced press_items with source, quote, pdf_url, thumbnail_url';
  RAISE NOTICE 'Enhanced destinations with region, service_ids, video_url, press_featured';
  RAISE NOTICE 'Ready for content seeding.';
END $$;
