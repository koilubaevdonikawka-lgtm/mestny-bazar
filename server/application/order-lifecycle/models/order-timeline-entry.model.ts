import type { OrderStatus } from "@server/application/modules/order/order/models";

/** Single timeline entry for an order status change. */
export interface OrderTimelineEntry {
  readonly id: string;
  readonly orderId: string;
  readonly status: OrderStatus;
  readonly previousStatus: OrderStatus | null;
  readonly label: string;
  readonly reason: string | null;
  readonly actor: string | null;
  readonly occurredAt: string;
}

export function createOrderTimelineEntry(input: {
  id: string;
  orderId: string;
  status: OrderStatus;
  previousStatus?: OrderStatus | null;
  label: string;
  reason?: string | null;
  actor?: string | null;
  occurredAt?: string;
}): OrderTimelineEntry {
  return Object.freeze({
    id: input.id.trim(),
    orderId: input.orderId.trim(),
    status: input.status,
    previousStatus: input.previousStatus ?? null,
    label: input.label.trim(),
    reason: input.reason?.trim() ?? null,
    actor: input.actor?.trim() ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface OrderTimeline {
  readonly orderId: string;
  readonly entries: readonly OrderTimelineEntry[];
}

export function createOrderTimeline(
  orderId: string,
  entries: readonly OrderTimelineEntry[],
): OrderTimeline {
  return Object.freeze({
    orderId: orderId.trim(),
    entries: Object.freeze([...entries]),
  });
}
