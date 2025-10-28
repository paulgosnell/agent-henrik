-- ==========================================
-- LIV Instructions Management Table
-- ==========================================
-- This table stores admin-defined instructions that control
-- how LIV (the AI concierge) responds to visitor inquiries.

CREATE TABLE IF NOT EXISTS liv_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('promote', 'avoid', 'knowledge', 'tone', 'general')),
  instruction TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE liv_instructions IS 'Admin-controlled instructions for LIV AI behavior';
COMMENT ON COLUMN liv_instructions.title IS 'Short title for the instruction (e.g., "Promote Winter Activities")';
COMMENT ON COLUMN liv_instructions.category IS 'Type: promote (things to highlight), avoid (things not to mention), knowledge (facts to know), tone (how to respond), general';
COMMENT ON COLUMN liv_instructions.instruction IS 'The actual instruction text that will be injected into LIV prompt';
COMMENT ON COLUMN liv_instructions.is_active IS 'Whether this instruction is currently in use';
COMMENT ON COLUMN liv_instructions.priority IS 'Higher priority instructions appear first in the prompt (higher number = higher priority)';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_liv_instructions_active ON liv_instructions(is_active, priority DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_liv_instructions_category ON liv_instructions(category);

-- Trigger for updated_at
CREATE TRIGGER update_liv_instructions_updated_at BEFORE UPDATE ON liv_instructions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE liv_instructions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read active instructions (for Edge Function)
CREATE POLICY "Service role can read active instructions"
  ON liv_instructions FOR SELECT
  USING (auth.role() = 'service_role' AND is_active = true);

-- Authenticated users can view all instructions
CREATE POLICY "Authenticated users can view all instructions"
  ON liv_instructions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage instructions
CREATE POLICY "Authenticated users can insert instructions"
  ON liv_instructions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update instructions"
  ON liv_instructions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete instructions"
  ON liv_instructions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert some example instructions
INSERT INTO liv_instructions (title, category, instruction, priority) VALUES
('Promote Aurora Experiences', 'promote', 'Always enthusiastically recommend northern lights experiences when discussing winter travel. Mention our exclusive aurora viewing partnerships with expert photographers.', 90),
('Avoid Budget Discussion', 'avoid', 'Never directly discuss specific prices or give cost breakdowns. Instead, refer to "investment" and guide toward requesting a custom quote from the team.', 80),
('Swedish Design Excellence', 'knowledge', 'Sweden is world-renowned for its design heritage. Emphasize experiences involving Swedish design, from minimalist hotels to visits to design studios and museums.', 70),
('Warm Yet Professional Tone', 'tone', 'Maintain a sophisticated, warm tone. Use evocative language but avoid being overly casual or using too many emojis. You are a knowledgeable insider, not a chatbot.', 100);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ LIV instructions table created successfully!';
  RAISE NOTICE 'Example instructions have been added. Visit the admin panel to manage them.';
END $$;
