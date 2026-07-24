import type { IDeliveryRepository } from "@server/application/delivery-management/contracts/delivery-repository.contract";
import type { Delivery } from "@server/application/delivery-management/models/delivery.model";

/** In-memory delivery store. */
export class DeliveryRepository implements IDeliveryRepository {
  private readonly deliveries = new Map<string, Delivery>();
  private readonly deliveriesByOrder = new Map<string, Set<string>>();
  private readonly deliveriesByCustomer = new Map<string, Set<string>>();

  async save(delivery: Delivery): Promise<void> {
    this.deliveries.set(delivery.deliveryId, delivery);

    const orderDeliveries = this.deliveriesByOrder.get(delivery.orderId) ?? new Set();
    orderDeliveries.add(delivery.deliveryId);
    this.deliveriesByOrder.set(delivery.orderId, orderDeliveries);

    const customerDeliveries = this.deliveriesByCustomer.get(delivery.customerId) ?? new Set();
    customerDeliveries.add(delivery.deliveryId);
    this.deliveriesByCustomer.set(delivery.customerId, customerDeliveries);
  }

  async findById(deliveryId: string): Promise<Delivery | null> {
    return this.deliveries.get(deliveryId.trim()) ?? null;
  }

  async findByOrderId(orderId: string): Promise<readonly Delivery[]> {
    const ids = this.deliveriesByOrder.get(orderId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.deliveries.get(id))
        .filter((delivery): delivery is Delivery => delivery !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findByCustomerId(customerId: string): Promise<readonly Delivery[]> {
    const ids = this.deliveriesByCustomer.get(customerId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.deliveries.get(id))
        .filter((delivery): delivery is Delivery => delivery !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findAll(): Promise<readonly Delivery[]> {
    return Object.freeze(
      [...this.deliveries.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
  }

  async update(delivery: Delivery): Promise<void> {
    if (!(await this.findById(delivery.deliveryId))) {
      throw new Error(`Delivery not found: ${delivery.deliveryId}`);
    }
    this.deliveries.set(delivery.deliveryId, delivery);
  }
}
