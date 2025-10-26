-- ==========================================
-- Luxury Travel Sweden - Supabase Schema
-- ==========================================
-- Run this in your Supabase SQL Editor to set up the database
--
-- Order of operations:
-- 1. Create tables
-- 2. Create indexes
-- 3. Enable Row Level Security
-- 4. Create RLS policies
-- 5. Run seed.sql for initial data

-- ==========================================
-- 1. THEMES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  highlight TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE themes IS 'Travel themes/experiences (Nature & Wellness, Design & Innovation, etc.)';

-- ==========================================
-- 2. DESTINATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('city', 'seaside', 'province', 'beach', 'ski', 'park', 'storyteller')),
  seasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  theme_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE destinations IS 'Map markers and destination details';
COMMENT ON COLUMN destinations.latitude IS 'Decimal degrees (e.g., 59.3293)';
COMMENT ON COLUMN destinations.longitude IS 'Decimal degrees (e.g., 18.0686)';
COMMENT ON COLUMN destinations.theme_ids IS 'Array of theme UUIDs this destination belongs to';
COMMENT ON COLUMN destinations.seasons IS 'Array of season names: Spring, Summer, Autumn, Winter';

-- ==========================================
-- 3. BLOG POSTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  hero_image_url TEXT,
  author TEXT DEFAULT 'LIV Team',
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  related_destination_ids UUID[] DEFAULT ARRAY[]::UUID[],
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blog_posts IS 'Blog articles and travel guides';
COMMENT ON COLUMN blog_posts.content IS 'Rich text HTML content';
COMMENT ON COLUMN blog_posts.published_at IS 'NULL = draft, future date = scheduled';

-- ==========================================
-- 4. STORIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  hero_image_url TEXT,
  category TEXT,
  author TEXT DEFAULT 'LIV Team',
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE stories IS 'Travel stories and experiences';
COMMENT ON COLUMN stories.category IS 'Story category: Experience, Culture, Travel Tips, etc.';

-- ==========================================
-- 5. STATIC CONTENT TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS static_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  section TEXT,
  description TEXT,
  content_type TEXT DEFAULT 'text',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE static_content IS 'Key-value store for inline-editable website copy';
COMMENT ON COLUMN static_content.key IS 'Dot notation key (e.g., hero.headline, modal.welcome)';
COMMENT ON COLUMN static_content.section IS 'Grouping: hero, modal, footer, etc.';
COMMENT ON COLUMN static_content.content_type IS 'text, html, or markdown';

-- ==========================================
-- 6. PRESS QUOTES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS press_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  source TEXT NOT NULL,
  author TEXT,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE press_quotes IS 'Press testimonials and media quotes';

-- ==========================================
-- 7. MEDIA TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT,
  storage_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE media IS 'Uploaded media files (images, documents)';
COMMENT ON COLUMN media.storage_path IS 'Path in Supabase Storage bucket';

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Destinations indexes
CREATE INDEX IF NOT EXISTS idx_destinations_coords ON destinations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_destinations_published ON destinations(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_published ON blog_posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_slug ON blog_posts(slug);

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);

-- Static content index
CREATE INDEX IF NOT EXISTS idx_static_content_section ON static_content(section);

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_static_content_updated_at BEFORE UPDATE ON static_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- ==========================================

-- Themes: Public can read all
CREATE POLICY "Anyone can view themes"
  ON themes FOR SELECT
  USING (true);

-- Destinations: Public can read published
CREATE POLICY "Anyone can view published destinations"
  ON destinations FOR SELECT
  USING (published = true);

-- Blog posts: Public can read published
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- Stories: Public can read published
CREATE POLICY "Anyone can view published stories"
  ON stories FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- Static content: Public can read all
CREATE POLICY "Anyone can view static content"
  ON static_content FOR SELECT
  USING (true);

-- Press quotes: Public can read published
CREATE POLICY "Anyone can view published press quotes"
  ON press_quotes FOR SELECT
  USING (published = true);

-- Media: Public can read all (URLs are public anyway)
CREATE POLICY "Anyone can view media"
  ON media FOR SELECT
  USING (true);

-- ==========================================
-- RLS POLICIES - AUTHENTICATED WRITE ACCESS
-- ==========================================

-- Themes: Authenticated users can manage
CREATE POLICY "Authenticated users can insert themes"
  ON themes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update themes"
  ON themes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete themes"
  ON themes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Destinations: Authenticated users can manage
CREATE POLICY "Authenticated users can insert destinations"
  ON destinations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update destinations"
  ON destinations FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete destinations"
  ON destinations FOR DELETE
  USING (auth.role() = 'authenticated');

-- Authenticated users can also SELECT unpublished destinations
CREATE POLICY "Authenticated users can view all destinations"
  ON destinations FOR SELECT
  USING (auth.role() = 'authenticated');

-- Blog posts: Authenticated users can manage
CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Stories: Authenticated users can manage
CREATE POLICY "Authenticated users can insert stories"
  ON stories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update stories"
  ON stories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete stories"
  ON stories FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all stories"
  ON stories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Static content: Authenticated users can manage
CREATE POLICY "Authenticated users can insert static content"
  ON static_content FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update static content"
  ON static_content FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete static content"
  ON static_content FOR DELETE
  USING (auth.role() = 'authenticated');

-- Press quotes: Authenticated users can manage
CREATE POLICY "Authenticated users can insert press quotes"
  ON press_quotes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update press quotes"
  ON press_quotes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete press quotes"
  ON press_quotes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Media: Authenticated users can manage
CREATE POLICY "Authenticated users can insert media"
  ON media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update media"
  ON media FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media"
  ON media FOR DELETE
  USING (auth.role() = 'authenticated');

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to get themes for a destination
CREATE OR REPLACE FUNCTION get_destination_themes(destination_id UUID)
RETURNS TABLE (
  id UUID,
  label TEXT,
  slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.label, t.slug
  FROM themes t
  WHERE t.id = ANY(
    SELECT unnest(theme_ids) FROM destinations WHERE destinations.id = destination_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to search destinations
CREATE OR REPLACE FUNCTION search_destinations(search_term TEXT)
RETURNS SETOF destinations AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM destinations
  WHERE published = true
    AND (
      title ILIKE '%' || search_term || '%'
      OR description ILIKE '%' || search_term || '%'
      OR slug ILIKE '%' || search_term || '%'
    )
  ORDER BY title;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Luxury Travel Sweden schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run seed.sql to populate initial data';
  RAISE NOTICE '2. Configure Storage bucket for media uploads';
  RAISE NOTICE '3. Create admin user account';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- themes';
  RAISE NOTICE '- destinations';
  RAISE NOTICE '- blog_posts';
  RAISE NOTICE '- stories';
  RAISE NOTICE '- static_content';
  RAISE NOTICE '- press_quotes';
  RAISE NOTICE '- media';
END $$;
