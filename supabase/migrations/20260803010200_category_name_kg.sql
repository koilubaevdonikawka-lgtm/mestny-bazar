-- design.md: replaces the hardcoded KG_NAME_BY_SLUG map in src/routes/index.tsx
-- with a real, admin-editable column. Schema-only change — no data backfill,
-- so a category with no name_kg set continues to fall back to the existing
-- frontend dictionary until an admin edits it via /admin/catalog.
ALTER TABLE public.categories ADD COLUMN name_kg TEXT;
