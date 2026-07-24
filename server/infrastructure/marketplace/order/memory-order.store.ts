import type { IOrderStore } from "@server/application/modules/order/order/contracts";
import type { Order } from "@server/application/modules/order/order/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory order store for development and tests. */
export class MemoryOrderStore implements IOrderStore {
  private readonly byId = new InMemoryStore<Order>((order) => order.id);
  private readonly byOrderNumber = new Map<string, string>();

  async saveOrder(order: Order): Promise<void> {
    this.byId.set(order);
    this.byOrderNumber.set(order.orderNumber, order.id);
  }

  async updateOrder(order: Order): Promise<void> {
    if (!(await this.findById(order.id))) {
      throw new Error(`Order not found: ${order.id}`);
    }
    this.byId.set(order);
    this.byOrderNumber.set(order.orderNumber, order.id);
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.byId.get(orderId) ?? null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const id = this.byOrderNumber.get(orderNumber);
    return id ? this.findById(id) : null;
  }

  async findByCustomerId(customerId: string): Promise<readonly Order[]> {
    return this.byId.find((order) => order.customerId === customerId.trim());
  }
}
