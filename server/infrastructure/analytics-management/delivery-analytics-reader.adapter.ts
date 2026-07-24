import type { DeliveryManagementService } from "@server/application/delivery-management/services/delivery-management.service";
import type {
  DeliveryAnalyticsRecord,
  DeliveryAnalyticsSnapshot,
  IDeliveryAnalyticsReader,
} from "@server/application/analytics-management/contracts/delivery-analytics-reader.contract";

/** Adapts Delivery Management to IDeliveryAnalyticsReader — no Delivery Repository access. */
export class DeliveryAnalyticsReaderAdapter implements IDeliveryAnalyticsReader {
  constructor(private readonly deliveries: DeliveryManagementService) {}

  async getDeliverySnapshot(): Promise<DeliveryAnalyticsSnapshot> {
    const { deliveries } = await this.deliveries.getAllDeliveries();
    const records: DeliveryAnalyticsRecord[] = deliveries.map((delivery) =>
      Object.freeze({
        deliveryId: delivery.deliveryId,
        orderId: delivery.orderId,
        customerId: delivery.customerId,
        status: delivery.status,
        courierId: delivery.courierId,
        createdAt: delivery.createdAt,
      }),
    );

    const deliveriesByStatus: Record<string, number> = {};
    let assignedCount = 0;

    for (const delivery of deliveries) {
      deliveriesByStatus[delivery.status] = (deliveriesByStatus[delivery.status] ?? 0) + 1;
      if (delivery.courierId) {
        assignedCount += 1;
      }
    }

    return Object.freeze({
      totalDeliveries: deliveries.length,
      deliveriesByStatus: Object.freeze(deliveriesByStatus),
      assignedCount,
      records: Object.freeze(records),
    });
  }
}
