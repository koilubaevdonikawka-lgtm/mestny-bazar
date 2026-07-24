import type { IOrderEventPublisher } from "@server/application/order-management/contracts/order-event-publisher.contract";
import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

/** No-op event publisher until Notification BCM is connected. */
export class NoopOrderEventPublisher implements IOrderEventPublisher {
  async publishOrderCreated(_orderId: string, _customerId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishStatusChanged(
    _orderId: string,
    _status: OrderManagementStatus,
    _previousStatus: OrderManagementStatus | null,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishOrderCancelled(_orderId: string, _customerId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
