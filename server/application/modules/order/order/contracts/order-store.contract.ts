import type { Order } from "@server/application/modules/order/order/models";

/** Order persistence contract — implemented by infrastructure adapters. */
export interface IOrderStore {
  saveOrder(order: Order): Promise<void>;
  updateOrder(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<readonly Order[]>;
}
