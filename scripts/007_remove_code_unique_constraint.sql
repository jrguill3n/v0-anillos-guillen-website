-- Remove unique constraint on code field
-- This allows the same ring code to exist temporarily during imports
-- The slug field is the primary unique identifier

ALTER TABLE rings DROP CONSTRAINT IF EXISTS rings_code_key;
