import type { OrderStatusValue } from "@server/application/modules/order/order/models";

/** Raised when a new order is created by the Order capability module. */
export interface OrderCreatedEvent {
  readonly type: "OrderCreated";
  readonly orderId: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: OrderStatusValue;
  readonly itemCount: number;
  readonly totalAmount: number;
  readonly currency: string;
  readonly occurredAt: string;
}

export function createOrderCreatedEvent(input: {
  orderId: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatusValue;
  itemCount: number;
  totalAmount: number;
  currency: string;
}): OrderCreatedEvent {
  return Object.freeze({
    type: "OrderCreated",
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    customerId: input.customerId,
    status: input.status,
    itemCount: input.itemCount,
    totalAmount: input.totalAmount,
    currency: input.currency,
    occurredAt: new Date().toISOString(),
  });
}
