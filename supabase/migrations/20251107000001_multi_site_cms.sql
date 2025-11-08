-- ==========================================
-- Multi-Site CMS Migration
-- ==========================================
-- Adds 'site' column to all content tables to support
-- both Sweden and Agent Henrik sites from single database
-- Client can switch between sites in admin panel
-- ==========================================

-- Add site ENUM type
DO $$ BEGIN
  CREATE TYPE site_type AS ENUM ('sweden', 'henrik');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- Add site column to all content tables
-- ==========================================

-- Themes
ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_themes_site ON themes(site);

-- Destinations
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_destinations_site ON destinations(site);

-- Blog Posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_site ON blog_posts(site);

-- Stories
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_site ON stories(site);

-- Static Content
ALTER TABLE static_content
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_static_content_site ON static_content(site);

-- Press Quotes
ALTER TABLE press_quotes
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_press_quotes_site ON press_quotes(site);

-- Media
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_media_site ON media(site);

-- Leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_site ON leads(site);

-- Conversations
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_site ON conversations(site);

-- Booking Inquiries
ALTER TABLE booking_inquiries
  ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_inquiries_site ON booking_inquiries(site);

-- Add tables that might exist (IF NOT EXISTS prevents errors)

-- Press Items (new table for Agent Henrik)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'press_items') THEN
    ALTER TABLE press_items
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_press_items_site ON press_items(site);
  END IF;
END $$;

-- Team Members
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_team_members_site ON team_members(site);
  END IF;
END $$;

-- FAQs
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'faqs') THEN
    ALTER TABLE faqs
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_faqs_site ON faqs(site);
  END IF;
END $$;

-- Pricing Tiers
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_tiers') THEN
    ALTER TABLE pricing_tiers
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_pricing_tiers_site ON pricing_tiers(site);
  END IF;
END $$;

-- Our Story Sections
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'our_story_sections') THEN
    ALTER TABLE our_story_sections
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_our_story_sections_site ON our_story_sections(site);
  END IF;
END $$;

-- Storyteller Inquiries
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'storyteller_inquiries') THEN
    ALTER TABLE storyteller_inquiries
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_storyteller_inquiries_site ON storyteller_inquiries(site);
  END IF;
END $$;

-- LIV Instructions
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liv_instructions') THEN
    ALTER TABLE liv_instructions
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_liv_instructions_site ON liv_instructions(site);
  END IF;
END $$;

-- Instagram Settings
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'instagram_settings') THEN
    ALTER TABLE instagram_settings
      ADD COLUMN IF NOT EXISTS site site_type DEFAULT 'henrik' NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_instagram_settings_site ON instagram_settings(site);
  END IF;
END $$;

-- ==========================================
-- Update existing data to 'sweden' site
-- ==========================================
-- All existing data should be tagged as 'sweden' site
-- so that the Agent Henrik site starts fresh

UPDATE themes SET site = 'sweden' WHERE site = 'henrik';
UPDATE destinations SET site = 'sweden' WHERE site = 'henrik';
UPDATE blog_posts SET site = 'sweden' WHERE site = 'henrik';
UPDATE stories SET site = 'sweden' WHERE site = 'henrik';
UPDATE static_content SET site = 'sweden' WHERE site = 'henrik';
UPDATE press_quotes SET site = 'sweden' WHERE site = 'henrik';
UPDATE media SET site = 'sweden' WHERE site = 'henrik';
UPDATE leads SET site = 'sweden' WHERE site = 'henrik';
UPDATE conversations SET site = 'sweden' WHERE site = 'henrik';
UPDATE booking_inquiries SET site = 'sweden' WHERE site = 'henrik';

-- Optional tables (only update if they exist)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'press_items') THEN
    UPDATE press_items SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    UPDATE team_members SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'faqs') THEN
    UPDATE faqs SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_tiers') THEN
    UPDATE pricing_tiers SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'our_story_sections') THEN
    UPDATE our_story_sections SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'storyteller_inquiries') THEN
    UPDATE storyteller_inquiries SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liv_instructions') THEN
    UPDATE liv_instructions SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'instagram_settings') THEN
    UPDATE instagram_settings SET site = 'sweden' WHERE site = 'henrik';
  END IF;
END $$;

-- ==========================================
-- RLS Policies Update
-- ==========================================
-- Update RLS policies to include site filtering
-- Public users should only see content for their site

-- Drop existing public read policies
DROP POLICY IF EXISTS "Anyone can view published destinations" ON destinations;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can view published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can view themes" ON themes;

-- Create new site-aware policies
-- Note: For now, we'll keep it simple and allow all public access
-- Site filtering will be done at application level

CREATE POLICY "Anyone can view published destinations"
  ON destinations FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

CREATE POLICY "Anyone can view published stories"
  ON stories FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

CREATE POLICY "Anyone can view themes"
  ON themes FOR SELECT
  USING (true);

-- ==========================================
-- Success Message
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Multi-site CMS migration completed successfully!';
  RAISE NOTICE 'All existing data has been tagged as ''sweden'' site.';
  RAISE NOTICE 'New Agent Henrik content will use ''henrik'' site tag.';
  RAISE NOTICE 'Update your admin UI to include site selector.';
END $$;
