ALTER TABLE stories
ADD COLUMN IF NOT EXISTS liv_context TEXT;

COMMENT ON COLUMN stories.liv_context IS
'Context-specific instructions for LIV about this storyteller. Include: session types, availability, pricing guidance, special requirements.';
