ALTER TABLE pillars
ADD COLUMN IF NOT EXISTS liv_context TEXT;

COMMENT ON COLUMN pillars.liv_context IS
'Context-specific instructions for LIV when user clicks this experience pillar. Include: whether single/multi-day, price ranges, partner venues, seasonal notes.';
