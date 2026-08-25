-- Задача №151 — precise courier navigation. addressSnapshot is free text,
-- unreliable for rural/village addresses poorly indexed by map providers
-- (Задача №146). Additive/nullable only, matching the delivery_tariff_id/
-- eta pattern from 20260804050000: every existing row and every existing
-- caller of create_order_with_items that doesn't pass these two keys keeps
-- working unchanged (NULLIF, same as that migration and 20260813010000).
-- NUMERIC(9,6) matches the existing lat/lng precision on public.stores
-- (20260804010000).
ALTER TABLE public.orders
  ADD COLUMN delivery_latitude NUMERIC(9,6),
  ADD COLUMN delivery_longitude NUMERIC(9,6);

-- create_order_with_items (20260725050000, last touched 20260813010000) must
-- write the two new columns too.
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
    total, currency, customer_name, customer_phone, address_snapshot,
    delivery_latitude, delivery_longitude, zone_id, notes,
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
    NULLIF(order_data->>'delivery_latitude', '')::numeric,
    NULLIF(order_data->>'delivery_longitude', '')::numeric,
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
