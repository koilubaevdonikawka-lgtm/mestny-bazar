-- Courier Platform readiness (docs/delivery/DELIVERY_MASTER_SPEC.md §6,
-- Промпт №021 item 9): the order must snapshot which tariff/ETA actually
-- applied at checkout time, the same CD-06 pattern already used for price
-- (order_items.unit_price) and discount (orders.discount_amount) — never
-- re-derived later from tariffs that may since have changed. orders.zone_id
-- already exists (original schema) and is reused unchanged.
ALTER TABLE public.orders ADD COLUMN delivery_tariff_id UUID REFERENCES public.delivery_tariffs(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN delivery_eta_min_minutes INT;
ALTER TABLE public.orders ADD COLUMN delivery_eta_max_minutes INT;

-- create_order_with_items (20260725050000, last touched 20260803010400) must
-- write the three new columns too — COALESCE/NULLIF keep old callers (no
-- delivery fields in order_data) working unchanged, same pattern already
-- used for discount_amount/coupon_code.
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
      order_id, product_id, product_name, product_image_url, unit_price, quantity, line_total
    )
    VALUES (
      new_order_id,
      NULLIF(item->>'product_id', '')::uuid,
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
