import type { IOrderRepository } from "@server/application/order-management/contracts/order-repository.contract";
import type { CustomerOrder } from "@server/application/order-management/models/customer-order.model";

/** In-memory customer order store. */
export class OrderRepository implements IOrderRepository {
  private readonly orders = new Map<string, CustomerOrder>();
  private readonly ordersByCustomer = new Map<string, Set<string>>();

  async save(order: CustomerOrder): Promise<void> {
    this.orders.set(order.orderId, order);
    const customerOrders = this.ordersByCustomer.get(order.customerId) ?? new Set();
    customerOrders.add(order.orderId);
    this.ordersByCustomer.set(order.customerId, customerOrders);
  }

  async findById(orderId: string): Promise<CustomerOrder | null> {
    return this.orders.get(orderId.trim()) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<readonly CustomerOrder[]> {
    const ids = this.ordersByCustomer.get(customerId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.orders.get(id))
        .filter((order): order is CustomerOrder => order !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findAll(): Promise<readonly CustomerOrder[]> {
    return Object.freeze(
      [...this.orders.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
  }

  async update(order: CustomerOrder): Promise<void> {
    if (!(await this.findById(order.orderId))) {
      throw new Error(`Order not found: ${order.orderId}`);
    }
    this.orders.set(order.orderId, order);
  }
}
