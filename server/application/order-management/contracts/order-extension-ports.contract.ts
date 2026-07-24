/**
 * Future integration ports for Order Management.
 * Not implemented — reserved for payment, delivery, and fulfillment modules.
 */

/** Payment Management — payment capture after order creation. */
export interface IOrderPaymentGateway {
  initiatePayment(orderId: string, amount: number, currency: string): Promise<string>;
}

/** Delivery Management — shipping and tracking. */
export interface IOrderDeliveryProvider {
  scheduleDelivery(orderId: string): Promise<void>;
  getTrackingInfo(orderId: string): Promise<string | null>;
}

/** Warehouse Management — pick/pack/ship orchestration. */
export interface IOrderWarehouseProvider {
  allocateInventory(orderId: string): Promise<boolean>;
}

/** Notification BCM — order status notifications. */
export interface IOrderNotificationProvider {
  notifyStatusChanged(orderId: string, customerId: string, status: string): Promise<void>;
}

/** Analytics BCM — order funnel and fulfillment metrics. */
export interface IOrderAnalyticsContext {
  trackOrderFulfilled(orderId: string): Promise<void>;
}
