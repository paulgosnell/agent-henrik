-- Add video_url column to destinations table for hero video support
-- Used for the full-screen destination modal experience

ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN destinations.video_url IS 'Optional video URL for destination hero modal. Falls back to Ken Burns image animation if not set.';
