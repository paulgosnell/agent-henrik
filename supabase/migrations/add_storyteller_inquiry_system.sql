-- ==========================================
-- Storyteller Inquiry System
-- ==========================================
-- Extends stories table and adds storyteller-specific inquiry tracking

-- Add storyteller-specific fields to stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS specialty_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS activity_types TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS availability_notes TEXT;

COMMENT ON COLUMN stories.specialty_topics IS 'Storyteller specialties: film, music, performance, fashion, design, art, writing, photography, digital_media, technology, wellness';
COMMENT ON COLUMN stories.activity_types IS 'Available activities: meet_and_greet, workshop, creative_activity, consultation, performance, tour';
COMMENT ON COLUMN stories.bio IS 'Full biography/background of the storyteller';

-- Create storyteller inquiries table
CREATE TABLE IF NOT EXISTS storyteller_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Contact info
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,

  -- Inquiry details
  selected_storyteller_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  storyteller_name TEXT,
  topic_of_interest TEXT NOT NULL, -- film, music, performance, etc.
  activity_type TEXT NOT NULL, -- meet_and_greet, workshop, creative_activity

  -- Event details
  inquiry_type TEXT DEFAULT 'private' CHECK (inquiry_type IN ('private', 'corporate')),
  group_size INTEGER,
  preferred_dates TEXT,
  budget_range TEXT,
  special_requests TEXT,

  -- Conversation context
  conversation_summary TEXT,
  ai_suggestions TEXT[], -- List of storyteller names/IDs suggested by AI

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'contacted_storyteller', 'confirmed', 'declined', 'completed')),
  internal_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ
);

COMMENT ON TABLE storyteller_inquiries IS 'Booking inquiries for storyteller meetings, workshops, and activities';
COMMENT ON COLUMN storyteller_inquiries.topic_of_interest IS 'Category: film, music, performance, fashion, design, art, writing, photography, digital_media, technology, wellness';
COMMENT ON COLUMN storyteller_inquiries.activity_type IS 'Type: meet_and_greet, workshop, creative_activity';
COMMENT ON COLUMN storyteller_inquiries.ai_suggestions IS 'Storytellers suggested by LIV AI during conversation';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_storyteller_inquiries_lead ON storyteller_inquiries(lead_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_inquiries_status ON storyteller_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_storyteller_inquiries_storyteller ON storyteller_inquiries(selected_storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_inquiries_created ON storyteller_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_specialty ON stories(specialty_topics) WHERE category = 'Storyteller';

-- Triggers
CREATE TRIGGER update_storyteller_inquiries_updated_at
BEFORE UPDATE ON storyteller_inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE storyteller_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert storyteller inquiries"
  ON storyteller_inquiries FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view all storyteller inquiries"
  ON storyteller_inquiries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update storyteller inquiries"
  ON storyteller_inquiries FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete storyteller inquiries"
  ON storyteller_inquiries FOR DELETE
  USING (auth.role() = 'authenticated');

-- Update existing storytellers with specialty data
UPDATE stories
SET
  specialty_topics = ARRAY['culinary', 'writing', 'performance']::TEXT[],
  activity_types = ARRAY['meet_and_greet', 'workshop']::TEXT[],
  bio = excerpt
WHERE slug = 'mogens-lena-historical-mansion';

UPDATE stories
SET
  specialty_topics = ARRAY['music', 'performance', 'design']::TEXT[],
  activity_types = ARRAY['meet_and_greet', 'performance']::TEXT[],
  bio = excerpt
WHERE slug = 'robert-mikael-the-villa';

UPDATE stories
SET
  specialty_topics = ARRAY['design', 'fashion', 'art']::TEXT[],
  activity_types = ARRAY['tour', 'workshop', 'consultation']::TEXT[],
  bio = excerpt
WHERE slug = 'trend-stefan-stockholm-design';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storyteller inquiry system created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables updated:';
  RAISE NOTICE '- stories (added specialty_topics, activity_types, bio)';
  RAISE NOTICE '- storyteller_inquiries (created)';
  RAISE NOTICE '';
  RAISE NOTICE 'Existing storytellers updated with specialty data';
END $$;
