-- Create storage bucket for ring images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ring-images', 'ring-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to ring images
CREATE POLICY "Public read access for ring images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ring-images');

-- Allow authenticated uploads (admin only in practice)
CREATE POLICY "Allow uploads to ring images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ring-images');

-- Allow authenticated deletes (admin only in practice)
CREATE POLICY "Allow deletes from ring images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ring-images');
