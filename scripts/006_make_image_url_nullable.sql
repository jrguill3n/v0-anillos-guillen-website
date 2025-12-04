-- Make image_url nullable so rings can be imported even if images fail
-- This allows the import process to continue even when image downloads fail

ALTER TABLE rings 
ALTER COLUMN image_url DROP NOT NULL;

-- Add a comment explaining why it's nullable
COMMENT ON COLUMN rings.image_url IS 'URL to the ring image in Supabase Storage. Can be null if image import fails.';
