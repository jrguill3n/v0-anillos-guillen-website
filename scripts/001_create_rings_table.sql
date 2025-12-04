-- Create rings table for jewelry catalog
CREATE TABLE IF NOT EXISTS public.rings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  metal_type VARCHAR(50) NOT NULL,
  metal_karat VARCHAR(10),
  metal_color VARCHAR(50),
  diamond_points DECIMAL(4,2),
  diamond_clarity VARCHAR(20),
  diamond_color VARCHAR(20),
  price DECIMAL(10,2),
  image_url TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_rings_code ON public.rings(code);
CREATE INDEX IF NOT EXISTS idx_rings_featured ON public.rings(featured);
CREATE INDEX IF NOT EXISTS idx_rings_available ON public.rings(is_available);

-- Enable Row Level Security
ALTER TABLE public.rings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (no auth required for viewing catalog)
CREATE POLICY "Allow public read access to rings"
  ON public.rings
  FOR SELECT
  USING (true);

-- For future: admin-only policies for insert/update/delete
-- CREATE POLICY "Allow admin insert" ON public.rings FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
-- CREATE POLICY "Allow admin update" ON public.rings FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
-- CREATE POLICY "Allow admin delete" ON public.rings FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
