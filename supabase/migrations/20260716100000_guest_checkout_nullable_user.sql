-- Allow guest (unauthenticated) ONLINE checkout: orders may have no user_id.
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
