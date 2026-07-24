import type { IDeliveryEventPublisher } from "@server/application/delivery-management/contracts/delivery-event-publisher.contract";
import type { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";

/** No-op event publisher until Notification BCM is connected. */
export class NoopDeliveryEventPublisher implements IDeliveryEventPublisher {
  async publishDeliveryCreated(
    _deliveryId: string,
    _orderId: string,
    _customerId: string,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishCourierAssigned(_deliveryId: string, _courierId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishDeliveryCompleted(_deliveryId: string, _orderId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishDeliveryCancelled(_deliveryId: string, _orderId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishStatusChanged(
    _deliveryId: string,
    _status: DeliveryStatus,
    _previousStatus: DeliveryStatus | null,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
