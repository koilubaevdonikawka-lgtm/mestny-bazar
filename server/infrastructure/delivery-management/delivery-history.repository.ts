import type { IDeliveryHistoryRepository } from "@server/application/delivery-management/contracts/delivery-history-repository.contract";
import type { DeliveryHistoryEntry } from "@server/application/delivery-management/models/delivery-history.model";

/** In-memory delivery history store. */
export class DeliveryHistoryRepository implements IDeliveryHistoryRepository {
  private readonly entriesByDelivery = new Map<string, DeliveryHistoryEntry[]>();

  async append(entry: DeliveryHistoryEntry): Promise<void> {
    const entries = this.entriesByDelivery.get(entry.deliveryId) ?? [];
    entries.push(entry);
    this.entriesByDelivery.set(entry.deliveryId, entries);
  }

  async findByDeliveryId(deliveryId: string): Promise<readonly DeliveryHistoryEntry[]> {
    const entries = this.entriesByDelivery.get(deliveryId.trim()) ?? [];
    return Object.freeze(
      [...entries].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt)),
    );
  }
}
