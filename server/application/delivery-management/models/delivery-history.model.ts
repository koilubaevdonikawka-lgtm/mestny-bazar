import type { Delivery, DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";

export interface DeliveryHistoryEntry {
  readonly id: string;
  readonly deliveryId: string;
  readonly status: DeliveryStatus;
  readonly previousStatus: DeliveryStatus | null;
  readonly reason: string | null;
  readonly actor: string | null;
  readonly occurredAt: string;
}

export function createDeliveryHistoryEntry(input: {
  id: string;
  deliveryId: string;
  status: DeliveryStatus;
  previousStatus?: DeliveryStatus | null;
  reason?: string | null;
  actor?: string | null;
  occurredAt?: string;
}): DeliveryHistoryEntry {
  return Object.freeze({
    id: input.id.trim(),
    deliveryId: input.deliveryId.trim(),
    status: input.status,
    previousStatus: input.previousStatus ?? null,
    reason: input.reason?.trim() ?? null,
    actor: input.actor?.trim() ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface DeliveryHistoryView {
  readonly deliveryId: string;
  readonly entries: readonly DeliveryHistoryEntry[];
}

export interface CancelDeliveryResult {
  readonly cancelled: boolean;
}

export interface AssignCourierResult {
  readonly assigned: boolean;
  readonly deliveryId: string;
  readonly courierId: string;
  readonly status: DeliveryStatus;
}

export interface DeliveriesListResult {
  readonly deliveries: readonly Delivery[];
  readonly total: number;
}
