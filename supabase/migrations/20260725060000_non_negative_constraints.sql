-- Defense-in-depth: stock and money columns were only ever guarded by
-- application-level validation (SellerProductService.validateStock,
-- PricingService's calculations always starting from non-negative inputs).
-- products.price and order_items.quantity already have DB-level CHECK
-- constraints; these columns didn't. A future bug in pricing/inventory logic
-- (or any code path that writes these tables outside today's application
-- code) should not be able to silently persist a negative stock count or a
-- negative order total — it should fail loudly at the database instead.
ALTER TABLE public.products
  ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);

ALTER TABLE public.orders
  ADD CONSTRAINT orders_subtotal_non_negative CHECK (subtotal >= 0),
  ADD CONSTRAINT orders_delivery_fee_non_negative CHECK (delivery_fee >= 0),
  ADD CONSTRAINT orders_total_non_negative CHECK (total >= 0);

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price >= 0),
  ADD CONSTRAINT order_items_line_total_non_negative CHECK (line_total >= 0);
