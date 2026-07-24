import type { Delivery } from "@server/application/delivery-management/models/delivery.model";

export interface IDeliveryRepository {
  save(delivery: Delivery): Promise<void>;
  findById(deliveryId: string): Promise<Delivery | null>;
  findByOrderId(orderId: string): Promise<readonly Delivery[]>;
  findByCustomerId(customerId: string): Promise<readonly Delivery[]>;
  findAll(): Promise<readonly Delivery[]>;
  update(delivery: Delivery): Promise<void>;
}
