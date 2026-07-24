import type { DeliveryHistoryEntry } from "@server/application/delivery-management/models/delivery-history.model";

export interface IDeliveryHistoryRepository {
  append(entry: DeliveryHistoryEntry): Promise<void>;
  findByDeliveryId(deliveryId: string): Promise<readonly DeliveryHistoryEntry[]>;
}
