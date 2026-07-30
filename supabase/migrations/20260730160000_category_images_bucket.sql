-- Public Storage bucket for category thumbnail images. Read is public (bucket-level,
-- no per-object RLS needed); only service_role (used by SupabaseCategoryRepository's
-- admin client) can write. No UI upload flow yet — images are set via image_url on
-- public.categories, pointing at objects placed in this bucket out of band.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;
