import type { CustomerOrder } from "@server/application/order-management/models/customer-order.model";

/** Persists customer orders — Order Management owned storage. */
export interface IOrderRepository {
  save(order: CustomerOrder): Promise<void>;
  findById(orderId: string): Promise<CustomerOrder | null>;
  findByCustomerId(customerId: string): Promise<readonly CustomerOrder[]>;
  findAll(): Promise<readonly CustomerOrder[]>;
  update(order: CustomerOrder): Promise<void>;
}
