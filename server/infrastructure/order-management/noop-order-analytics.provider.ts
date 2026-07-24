import type { IOrderAnalyticsProvider } from "@server/application/order-management/contracts/order-analytics-provider.contract";
import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

/** No-op analytics provider until Analytics BCM is connected. */
export class NoopOrderAnalyticsProvider implements IOrderAnalyticsProvider {
  async trackOrderCreated(
    _orderId: string,
    _customerId: string,
    _subtotal: number,
  ): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackStatusChanged(_orderId: string, _status: OrderManagementStatus): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackOrderCancelled(_orderId: string, _customerId: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }
}
