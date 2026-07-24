import type { IOrderRepository } from "@server/application/ports";
import type { Order, OrderReadModel } from "@server/domain/order";
import { InMemoryStore, reconstituteOrder } from "@server/infrastructure/shared";

/** In-memory order repository — replaceable with persistent adapter. */
export class InMemoryOrderRepository implements IOrderRepository {
  private readonly byId = new InMemoryStore<OrderReadModel>((item) => item.id);
  private readonly byOrderNumber = new Map<string, string>();

  async save(order: Order): Promise<void> {
    const snapshot = order.snapshot().toJSON();
    this.byId.set(snapshot);
    this.byOrderNumber.set(snapshot.orderNumber, snapshot.id);
  }

  async findById(id: string): Promise<Order | null> {
    const model = this.byId.get(id);
    return model ? reconstituteOrder(model) : null;
  }

  async findSnapshotById(id: string): Promise<OrderReadModel | null> {
    return this.byId.get(id) ?? null;
  }

  async findSnapshotByOrderNumber(orderNumber: string): Promise<OrderReadModel | null> {
    const id = this.byOrderNumber.get(orderNumber);
    return id ? this.findSnapshotById(id) : null;
  }

  async exists(id: string): Promise<boolean> {
    return this.byId.has(id);
  }
}
