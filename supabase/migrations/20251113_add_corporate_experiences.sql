-- Create corporate_experiences table
CREATE TABLE IF NOT EXISTS corporate_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    liv_context TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 5 corporate experiences from homepage
INSERT INTO corporate_experiences (slug, title, description, display_order) VALUES
('leadership-retreats', 'Leadership Retreats', 'Swap the boardroom for a castle, a mirrored forest lodge, or a private island villa. Executive retreats combine strategic focus with Swedish wellness: sauna rituals, guided silence, and outdoor adventure.', 1),
('innovation-creativity', 'Innovation & Creativity', 'Bring your team into Sweden''s unicorn factory. Meet startup founders, green-tech pioneers, and design thinkers. Workshops woven into inspiring environments — from design studios to innovation labs.', 2),
('celebration-recognition', 'Celebration & Recognition', 'Business milestones deserve more than a ballroom. Celebrate with a Scandi White Party on a private island, a royal gala in a candlelit palace, or an Innovation Party Night with startup founders and Michelin catering.', 3),
('culture-purpose', 'Culture & Purpose', 'Sweden''s cultural and social legacy inspires transformation. Backstage access to Stockholm Fashion Week, private design fairs, or CSR narratives supporting Sami communities and eco-startups.', 4),
('wellness-biohacking', 'Wellness & Biohacking', 'Executive performance meets longevity. Transform your leadership team through cutting-edge wellness protocols, Nordic cold therapy, and personalized biohacking experiences in pristine Swedish nature.', 5);

COMMENT ON TABLE corporate_experiences IS 'Corporate travel offerings with LIV context instructions';
COMMENT ON COLUMN corporate_experiences.liv_context IS 'Context-specific instructions for LIV when user clicks this corporate experience. Include: group sizes, duration, pricing, venues, what to include.';

-- Enable RLS
ALTER TABLE corporate_experiences ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to corporate_experiences"
ON corporate_experiences FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Allow authenticated full access to corporate_experiences"
ON corporate_experiences FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
