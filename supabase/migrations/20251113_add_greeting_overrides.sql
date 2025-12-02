-- Add greeting_override column to all content tables

-- Destinations
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS greeting_override TEXT;

COMMENT ON COLUMN destinations.greeting_override IS 'Custom greeting message when user clicks this destination. If set, overrides default greetings.';

-- Pillars
ALTER TABLE pillars
ADD COLUMN IF NOT EXISTS greeting_override TEXT;

COMMENT ON COLUMN pillars.greeting_override IS 'Custom greeting message when user clicks this pillar/experience. If set, overrides default greetings.';

-- Stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS greeting_override TEXT;

COMMENT ON COLUMN stories.greeting_override IS 'Custom greeting message when user clicks this storyteller. If set, overrides default greetings.';

-- Corporate Experiences
ALTER TABLE corporate_experiences
ADD COLUMN IF NOT EXISTS greeting_override TEXT;

COMMENT ON COLUMN corporate_experiences.greeting_override IS 'Custom greeting message when user clicks this corporate experience. If set, overrides default greetings.';

-- Global LIV Contexts
ALTER TABLE global_liv_contexts
ADD COLUMN IF NOT EXISTS greeting_override TEXT;

COMMENT ON COLUMN global_liv_contexts.greeting_override IS 'Custom greeting message for this global context (Hero, Floating Button). If set, overrides default greetings.';
