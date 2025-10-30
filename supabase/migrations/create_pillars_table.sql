-- ==========================================
-- Create Pillars Table for Experiences and Corporate Content
-- ==========================================

CREATE TABLE IF NOT EXISTS pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  hero_image_url TEXT,
  icon_name TEXT,
  section TEXT NOT NULL CHECK (section IN ('experiences', 'corporate')),
  category TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  cta_text TEXT DEFAULT 'Design with LIV',
  liv_context_type TEXT DEFAULT 'experience',
  liv_context_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pillars IS 'Content pillars for Experiences and Corporate & Incentives sections';
COMMENT ON COLUMN pillars.slug IS 'URL-friendly identifier (e.g., "nature-wellness")';
COMMENT ON COLUMN pillars.section IS 'Which homepage section: experiences or corporate';
COMMENT ON COLUMN pillars.icon_name IS 'Lucide icon name (e.g., "leaf", "mountain")';
COMMENT ON COLUMN pillars.category IS 'Pillar category for filtering';
COMMENT ON COLUMN pillars.liv_context_type IS 'LIV AI context type';
COMMENT ON COLUMN pillars.liv_context_name IS 'LIV AI context name for personalization';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pillars_section ON pillars(section, display_order);
CREATE INDEX IF NOT EXISTS idx_pillars_published ON pillars(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_pillars_slug ON pillars(slug);

-- Trigger for updated_at
CREATE TRIGGER update_pillars_updated_at BEFORE UPDATE ON pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;

-- Public can read published pillars
CREATE POLICY "Anyone can view published pillars"
  ON pillars FOR SELECT
  USING (published = true);

-- Authenticated users can manage pillars
CREATE POLICY "Authenticated users can insert pillars"
  ON pillars FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update pillars"
  ON pillars FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete pillars"
  ON pillars FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all pillars"
  ON pillars FOR SELECT
  USING (auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Pillars table created successfully!';
END $$;
