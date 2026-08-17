-- Unified image upload (Промпт №068): a second Storage bucket for everything
-- other than categories (which keep using the existing category-images
-- bucket). Path-prefixed by context: products/, banners/, couriers/.
-- Mirrors 20260730160000_category_images_bucket.sql exactly.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-media',
  'marketplace-media',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;
