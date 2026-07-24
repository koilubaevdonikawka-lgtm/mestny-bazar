import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

/** Order status transition rules — extensible for Delivery/Warehouse modules. */
export interface IOrderStatusProvider {
  canTransition(from: OrderManagementStatus, to: OrderManagementStatus): boolean;
  getAllowedTransitions(from: OrderManagementStatus): readonly OrderManagementStatus[];
  isTerminal(status: OrderManagementStatus): boolean;
}
