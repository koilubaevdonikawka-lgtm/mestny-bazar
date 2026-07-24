import type { Order } from "@server/domain/order";
import type { OrderReadModel } from "@server/domain/order";

/** Order persistence port — implementation lives in adapters. */
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findSnapshotById(id: string): Promise<OrderReadModel | null>;
  findSnapshotByOrderNumber(orderNumber: string): Promise<OrderReadModel | null>;
  exists(id: string): Promise<boolean>;
}
