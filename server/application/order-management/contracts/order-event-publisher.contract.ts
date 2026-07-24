import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

/** Order lifecycle events — replace with Notification BCM later. */
export interface IOrderEventPublisher {
  publishOrderCreated(orderId: string, customerId: string): Promise<void>;
  publishStatusChanged(
    orderId: string,
    status: OrderManagementStatus,
    previousStatus: OrderManagementStatus | null,
  ): Promise<void>;
  publishOrderCancelled(orderId: string, customerId: string): Promise<void>;
}
