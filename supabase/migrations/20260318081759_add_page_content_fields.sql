-- Add body content, subtitle, and image fields to ah_page_meta
-- so about/legal pages can pull content from CMS instead of being hardcoded

ALTER TABLE ah_page_meta
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS image_url text;
