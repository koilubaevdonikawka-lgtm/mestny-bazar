-- Add indexes matching the actual query shapes the app runs, instead of only
-- single-column indexes on the filter that happen to exist. None of these are
-- reachable from real usage yet (empty tables), but every one of them backs a
-- query already shipped in this codebase.

-- SupabaseProductRepository.list(): the buyer catalog's primary read —
-- WHERE publication_status = 'PUBLISHED' ORDER BY created_at DESC — had no
-- supporting index at all (publication_status replaced is_active as the
-- buyer-facing filter but never got its own index).
CREATE INDEX idx_products_publication_status_created
  ON public.products(publication_status, created_at DESC);

-- CourierOrderService.listDeliveryOrders() / WarehouseOrderService
-- .listAssemblyOrders(): WHERE status IN (...) ORDER BY created_at DESC.
-- Supersedes idx_orders_status (a compound index's leading column serves
-- status-only lookups just as well; keeping both would just double the
-- per-write index-maintenance cost for no query benefit).
DROP INDEX IF EXISTS public.idx_orders_status;
CREATE INDEX idx_orders_status_created ON public.orders(status, created_at DESC);

-- AdminOrderService.listOrders(): unfiltered, ORDER BY created_at DESC, range().
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
