import { OrderLifecycleViolationError } from "@server/domain/order/exceptions/order.errors";

/** Canonical order lifecycle statuses. */
export const OrderLifecycleStatus = {
  Draft: "Draft",
  PendingPayment: "PendingPayment",
  Paid: "Paid",
  Preparing: "Preparing",
  ReadyForDelivery: "ReadyForDelivery",
  Delivering: "Delivering",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
  Closed: "Closed",
} as const;

export type OrderLifecycleStatus =
  (typeof OrderLifecycleStatus)[keyof typeof OrderLifecycleStatus];

export const ORDER_LIFECYCLE_STATUS_VALUES: readonly OrderLifecycleStatus[] =
  Object.values(OrderLifecycleStatus);

export function isOrderLifecycleStatus(value: string): value is OrderLifecycleStatus {
  return ORDER_LIFECYCLE_STATUS_VALUES.includes(value as OrderLifecycleStatus);
}

export function assertOrderLifecycleStatus(value: string): OrderLifecycleStatus {
  if (!isOrderLifecycleStatus(value)) {
    throw new OrderLifecycleViolationError(`Unknown order status: ${value}`, value, value);
  }
  return value;
}

export function isTerminalOrderStatus(status: OrderLifecycleStatus): boolean {
  return (
    status === OrderLifecycleStatus.Cancelled ||
    status === OrderLifecycleStatus.Refunded ||
    status === OrderLifecycleStatus.Closed
  );
}

export function isModifiableOrderStatus(status: OrderLifecycleStatus): boolean {
  return status === OrderLifecycleStatus.Draft;
}

export function isActiveOrderStatus(status: OrderLifecycleStatus): boolean {
  return !isTerminalOrderStatus(status) && status !== OrderLifecycleStatus.Completed;
}
