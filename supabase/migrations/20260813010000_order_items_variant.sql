-- Stage 17: thread variantId through the Checkout chain, so a future stage
-- can validate/reserve variant stock (ProductVariantService/
-- VariantStockService, Stages 13-14) against the actual order line without
-- another migration. Additive/nullable only — no existing column, row, or
-- constraint is touched; every existing caller of create_order_with_items
-- that doesn't pass variant_id per item keeps working unchanged (NULLIF
-- pattern, same as discount_amount/coupon_code in 20260803010400 and
-- delivery_tariff_id/eta in 20260804050000). No reservation/movement logic
-- is added here — variant_id is only persisted, never read for stock
-- purposes by this migration or the RPC.
ALTER TABLE public.order_items
  ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;

CREATE INDEX idx_order_items_variant ON public.order_items(variant_id);

-- create_order_with_items (20260725050000, last touched 20260804050000) must
-- write the new column too.
CREATE OR REPLACE FUNCTION public.create_order_with_items(order_data jsonb, items jsonb)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id uuid;
  item jsonb;
BEGIN
  INSERT INTO public.orders (
    user_id, idempotency_key, status, payment_status, subtotal, delivery_fee,
    total, currency, customer_name, customer_phone, address_snapshot, zone_id, notes,
    discount_amount, coupon_code, delivery_tariff_id, delivery_eta_min_minutes, delivery_eta_max_minutes
  )
  VALUES (
    NULLIF(order_data->>'user_id', '')::uuid,
    order_data->>'idempotency_key',
    (order_data->>'status')::order_status,
    (order_data->>'payment_status')::payment_status,
    (order_data->>'subtotal')::numeric,
    (order_data->>'delivery_fee')::numeric,
    (order_data->>'total')::numeric,
    order_data->>'currency',
    order_data->>'customer_name',
    order_data->>'customer_phone',
    order_data->>'address_snapshot',
    NULLIF(order_data->>'zone_id', '')::uuid,
    order_data->>'notes',
    COALESCE((order_data->>'discount_amount')::numeric, 0),
    NULLIF(order_data->>'coupon_code', ''),
    NULLIF(order_data->>'delivery_tariff_id', '')::uuid,
    NULLIF(order_data->>'delivery_eta_min_minutes', '')::int,
    NULLIF(order_data->>'delivery_eta_max_minutes', '')::int
  )
  RETURNING id INTO new_order_id;

  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_name, product_image_url, unit_price, quantity, line_total
    )
    VALUES (
      new_order_id,
      NULLIF(item->>'product_id', '')::uuid,
      NULLIF(item->>'variant_id', '')::uuid,
      item->>'product_name',
      item->>'product_image_url',
      (item->>'unit_price')::numeric,
      (item->>'quantity')::int,
      (item->>'line_total')::numeric
    );
  END LOOP;

  RETURN new_order_id;
END;
$$;
