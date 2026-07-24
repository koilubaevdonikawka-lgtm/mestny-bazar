import type { IOrderHistoryRepository } from "@server/application/order-management/contracts/order-history-repository.contract";
import type { OrderHistoryEntry } from "@server/application/order-management/models/order-history.model";

/** In-memory order status history store. */
export class OrderHistoryRepository implements IOrderHistoryRepository {
  private readonly entriesByOrder = new Map<string, OrderHistoryEntry[]>();

  async append(entry: OrderHistoryEntry): Promise<void> {
    const entries = this.entriesByOrder.get(entry.orderId) ?? [];
    entries.push(entry);
    this.entriesByOrder.set(entry.orderId, entries);
  }

  async findByOrderId(orderId: string): Promise<readonly OrderHistoryEntry[]> {
    const entries = this.entriesByOrder.get(orderId.trim()) ?? [];
    return Object.freeze(
      [...entries].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt)),
    );
  }
}
