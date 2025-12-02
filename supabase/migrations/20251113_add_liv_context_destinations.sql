ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS liv_context TEXT;

COMMENT ON COLUMN destinations.liv_context IS
'Context-specific instructions for LIV when user clicks this destination. Include: duration, seasonality, prerequisites, price range, unique features.';
