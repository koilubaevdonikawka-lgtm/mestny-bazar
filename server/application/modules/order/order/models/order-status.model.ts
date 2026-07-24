/** Canonical order lifecycle statuses for the Order capability module. */
export const OrderStatus = {
  Draft: "Draft",
  PendingPayment: "PendingPayment",
  Paid: "Paid",
  Preparing: "Preparing",
  ReadyForDelivery: "ReadyForDelivery",
  AssignedToCourier: "AssignedToCourier",
  CourierAccepted: "CourierAccepted",
  OnTheWay: "OnTheWay",
  Delivering: "Delivering",
  Arrived: "Arrived",
  Delivered: "Delivered",
  Completed: "Completed",
  Cancelled: "Cancelled",
  PaymentFailed: "PaymentFailed",
  Returned: "Returned",
  Refunded: "Refunded",
  Closed: "Closed",
} as const;

/** Terminal statuses — no further forward transitions except explicit close/refund paths. */
export const TERMINAL_ORDER_STATUSES = new Set<string>([
  OrderStatus.Cancelled,
  OrderStatus.PaymentFailed,
  OrderStatus.Refunded,
  OrderStatus.Closed,
]);

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return TERMINAL_ORDER_STATUSES.has(status);
}

export const ORDER_STATUS_VALUES: readonly OrderStatus[] = Object.values(OrderStatus);

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

export function assertOrderStatus(value: string): OrderStatus {
  if (!isOrderStatus(value)) {
    throw new Error(`Unknown order status: ${value}`);
  }
  return value;
}
