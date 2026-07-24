import type { IOrderTimelineStore } from "@server/application/order-lifecycle/contracts/order-timeline-store.contract";
import type { OrderTimelineEntry } from "@server/application/order-lifecycle/models/order-timeline-entry.model";

/** In-memory order timeline store for development and tests. */
export class MemoryOrderTimelineStore implements IOrderTimelineStore {
  private readonly entriesByOrderId = new Map<string, OrderTimelineEntry[]>();

  async appendEntry(entry: OrderTimelineEntry): Promise<void> {
    const existing = this.entriesByOrderId.get(entry.orderId) ?? [];
    this.entriesByOrderId.set(entry.orderId, [...existing, entry]);
  }

  async findByOrderId(orderId: string): Promise<readonly OrderTimelineEntry[]> {
    const entries = this.entriesByOrderId.get(orderId.trim()) ?? [];
    return Object.freeze([...entries]);
  }
}
