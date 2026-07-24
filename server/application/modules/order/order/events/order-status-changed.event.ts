import type { OrderStatusValue } from "@server/application/modules/order/order/models";

/** Raised when an order status changes within the Order capability module. */
export interface OrderStatusChangedEvent {
  readonly type: "OrderStatusChanged";
  readonly orderId: string;
  readonly previousStatus: OrderStatusValue;
  readonly newStatus: OrderStatusValue;
  readonly occurredAt: string;
}

export function createOrderStatusChangedEvent(input: {
  orderId: string;
  previousStatus: OrderStatusValue;
  newStatus: OrderStatusValue;
}): OrderStatusChangedEvent {
  return Object.freeze({
    type: "OrderStatusChanged",
    orderId: input.orderId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    occurredAt: new Date().toISOString(),
  });
}
