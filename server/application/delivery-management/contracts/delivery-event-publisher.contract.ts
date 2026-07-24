import type { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";

export interface IDeliveryEventPublisher {
  publishDeliveryCreated(deliveryId: string, orderId: string, customerId: string): Promise<void>;
  publishCourierAssigned(deliveryId: string, courierId: string): Promise<void>;
  publishDeliveryCompleted(deliveryId: string, orderId: string): Promise<void>;
  publishDeliveryCancelled(deliveryId: string, orderId: string): Promise<void>;
  publishStatusChanged(
    deliveryId: string,
    status: DeliveryStatus,
    previousStatus: DeliveryStatus | null,
  ): Promise<void>;
}
