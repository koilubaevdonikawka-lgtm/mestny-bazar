import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

/** Order analytics — replace with Analytics BCM later. */
export interface IOrderAnalyticsProvider {
  trackOrderCreated(orderId: string, customerId: string, subtotal: number): Promise<void>;
  trackStatusChanged(orderId: string, status: OrderManagementStatus): Promise<void>;
  trackOrderCancelled(orderId: string, customerId: string): Promise<void>;
}
