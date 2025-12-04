-- Add slug column to rings table for URL-friendly identifiers
ALTER TABLE public.rings ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_rings_slug ON public.rings(slug);

-- Update existing rows to generate slugs from codes (if any exist)
UPDATE public.rings 
SET slug = LOWER(REPLACE(REPLACE(code, ' ', '-'), 'Anillo', 'anillo'))
WHERE slug IS NULL;
