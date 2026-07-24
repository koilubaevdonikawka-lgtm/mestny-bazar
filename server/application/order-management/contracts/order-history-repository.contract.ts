import type { OrderHistoryEntry } from "@server/application/order-management/models/order-history.model";

/** Order status history persistence. */
export interface IOrderHistoryRepository {
  append(entry: OrderHistoryEntry): Promise<void>;
  findByOrderId(orderId: string): Promise<readonly OrderHistoryEntry[]>;
}
