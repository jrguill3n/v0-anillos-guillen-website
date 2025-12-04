-- Add order_index column for drag-and-drop ordering
ALTER TABLE rings ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Add is_active column (renamed from is_available for clarity)
ALTER TABLE rings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update order_index for existing rings based on created_at
UPDATE rings SET order_index = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at) - 1
  FROM rings r2
  WHERE r2.id = rings.id
) WHERE order_index = 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rings_order_index ON rings(order_index);
CREATE INDEX IF NOT EXISTS idx_rings_is_active ON rings(is_active);
