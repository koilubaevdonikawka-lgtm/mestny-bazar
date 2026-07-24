import type { OrderTimelineEntry } from "@server/application/order-lifecycle/models/order-timeline-entry.model";

/** Persistence contract for order status timeline entries. */
export interface IOrderTimelineStore {
  appendEntry(entry: OrderTimelineEntry): Promise<void>;
  findByOrderId(orderId: string): Promise<readonly OrderTimelineEntry[]>;
}
