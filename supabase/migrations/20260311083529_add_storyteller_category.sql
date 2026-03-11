-- Add category field to storytellers for filtering
ALTER TABLE ah_storytellers ADD COLUMN IF NOT EXISTS category text;
