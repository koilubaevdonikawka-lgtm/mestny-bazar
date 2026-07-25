-- order_status only had 6 values (pending, paid, preparing, delivering, delivered,
-- cancelled) while the 9-state domain OrderStatus (server/... shared/contracts/order.ts)
-- has CREATED/PAID/CONFIRMED/ASSEMBLING/READY_FOR_DELIVERY/OUT_FOR_DELIVERY/ARRIVED/
-- DELIVERED/CANCELLED. order.mapper.ts collapsed CONFIRMED->paid, READY_FOR_DELIVERY->
-- preparing and ARRIVED->delivering to fit — meaning those three states silently
-- reverted to their predecessor on every re-read from the database (order.mapper.ts
-- is fixed in the same commit as this migration; several order-lifecycle rules had
-- compensating "accept the collapsed status too" workarounds that are reverted too).
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'ready_for_delivery';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'arrived';
