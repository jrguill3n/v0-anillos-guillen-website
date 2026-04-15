-- Add new diamond fields to rings table to support main and side diamonds
-- Backwards compatible: existing diamond_points becomes main_diamond_points

ALTER TABLE rings 
ADD COLUMN IF NOT EXISTS main_diamond_points NUMERIC,
ADD COLUMN IF NOT EXISTS side_diamond_points NUMERIC;

-- Migrate existing data: copy diamond_points to main_diamond_points
UPDATE rings 
SET main_diamond_points = diamond_points 
WHERE main_diamond_points IS NULL AND diamond_points IS NOT NULL;

-- For rings where main_diamond_points is still null, set a default of 0
UPDATE rings 
SET main_diamond_points = 0 
WHERE main_diamond_points IS NULL;

-- Make main_diamond_points NOT NULL after migration
ALTER TABLE rings 
ALTER COLUMN main_diamond_points SET NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN rings.main_diamond_points IS 'The primary/center diamond points';
COMMENT ON COLUMN rings.side_diamond_points IS 'Total combined points of side diamonds (optional)';
