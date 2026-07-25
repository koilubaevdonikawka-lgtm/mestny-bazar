-- Checkout idempotency: a duplicate submission with the same client-generated
-- idempotencyKey must return the original order instead of creating a second one.
ALTER TABLE public.orders ADD COLUMN idempotency_key TEXT;
CREATE UNIQUE INDEX idx_orders_idempotency_key ON public.orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
