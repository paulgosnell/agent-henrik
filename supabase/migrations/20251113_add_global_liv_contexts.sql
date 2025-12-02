-- Create global_liv_contexts table for reusable LIV contexts
CREATE TABLE IF NOT EXISTS global_liv_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_key VARCHAR(100) UNIQUE NOT NULL,
    context_name VARCHAR(200) NOT NULL,
    context_type VARCHAR(50) NOT NULL, -- 'general', 'floating_button', etc.
    liv_context TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Hero and Floating Button contexts
INSERT INTO global_liv_contexts (context_key, context_name, context_type, description) VALUES
('hero-cta', 'Hero CTA', 'general', 'Context for the main "Design My Journey with LIV" button in the hero section'),
('floating-button', 'Floating LIV Button', 'general', 'Context for the bottom-right floating LIV button that appears on all pages');

COMMENT ON TABLE global_liv_contexts IS 'Global LIV context configurations for reusable CTAs (Hero, Floating Button, etc.)';
COMMENT ON COLUMN global_liv_contexts.context_key IS 'Unique identifier for the context (used in frontend lookups)';
COMMENT ON COLUMN global_liv_contexts.liv_context IS 'Context-specific instructions for LIV when user clicks this CTA. Tailor the greeting, approach, and initial questions.';

-- Enable RLS
ALTER TABLE global_liv_contexts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to global_liv_contexts"
ON global_liv_contexts FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Allow authenticated full access to global_liv_contexts"
ON global_liv_contexts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
