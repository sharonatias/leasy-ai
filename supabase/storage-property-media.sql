-- Storage: property-media bucket (MVP-0, development only)
-- Run manually in Supabase SQL Editor
--
-- TODO: Before production, replace these open policies with
-- authenticated upload policies tied to property ownership.

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true);

CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-media');

CREATE POLICY "Allow public insert access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-media');

CREATE POLICY "Allow public update access"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-media');

CREATE POLICY "Allow public delete access"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-media');
