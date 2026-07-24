import type { CustomerOrder } from "@server/application/order-management/models/customer-order.model";
import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

/** Single status change record for an order. */
export interface OrderHistoryEntry {
  readonly id: string;
  readonly orderId: string;
  readonly status: OrderManagementStatus;
  readonly previousStatus: OrderManagementStatus | null;
  readonly reason: string | null;
  readonly actor: string | null;
  readonly occurredAt: string;
}

export function createOrderHistoryEntry(input: {
  id: string;
  orderId: string;
  status: OrderManagementStatus;
  previousStatus?: OrderManagementStatus | null;
  reason?: string | null;
  actor?: string | null;
  occurredAt?: string;
}): OrderHistoryEntry {
  return Object.freeze({
    id: input.id.trim(),
    orderId: input.orderId.trim(),
    status: input.status,
    previousStatus: input.previousStatus ?? null,
    reason: input.reason?.trim() ?? null,
    actor: input.actor?.trim() ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface OrderHistoryView {
  readonly orderId: string;
  readonly entries: readonly OrderHistoryEntry[];
}

export interface CancelOrderResult {
  readonly cancelled: boolean;
}

export interface CustomerOrdersListResult {
  readonly orders: readonly CustomerOrder[];
  readonly total: number;
}
