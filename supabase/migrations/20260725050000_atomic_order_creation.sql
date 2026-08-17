-- SupabaseOrderRepository.create() did two separate INSERTs (orders, then
-- order_items) and manually compensated with a DELETE on the orders row if the
-- second insert failed. If that compensating DELETE itself failed (transient
-- network error, etc.), the result was an orphaned order header with no line
-- items and no automated recovery. One function call is one transaction —
-- either both inserts land or neither does, no manual compensation needed.
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
    total, currency, customer_name, customer_phone, address_snapshot, zone_id, notes
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
    order_data->>'notes'
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

GRANT EXECUTE ON FUNCTION public.create_order_with_items(jsonb, jsonb) TO service_role;
