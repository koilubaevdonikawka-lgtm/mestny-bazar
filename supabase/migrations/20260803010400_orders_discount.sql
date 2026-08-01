-- marketing.md coupon support — orders must persist what discount was actually
-- applied at checkout time, not just the current coupon state (which may
-- change or expire later). Additive columns only, both nullable-safe with
-- defaults so existing rows/readers are unaffected.
ALTER TABLE public.orders ADD COLUMN discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;

-- create_order_with_items (20260725050000) must write the two new columns too —
-- COALESCE keeps old callers (no discount fields in order_data) working unchanged.
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
    discount_amount, coupon_code
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
    NULLIF(order_data->>'coupon_code', '')
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
