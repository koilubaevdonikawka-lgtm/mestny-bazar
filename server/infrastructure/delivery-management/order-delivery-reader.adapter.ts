import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";
import type {
  IOrderDeliveryReader,
  OrderDeliverySnapshot,
} from "@server/application/delivery-management/contracts/order-delivery-reader.contract";

const DELIVERABLE_STATUSES = new Set<string>([
  OrderManagementStatus.Created,
  OrderManagementStatus.Confirmed,
  OrderManagementStatus.Processing,
  OrderManagementStatus.Shipped,
]);

/** Adapts Order Management to IOrderDeliveryReader — no Order Repository access. */
export class OrderDeliveryReaderAdapter implements IOrderDeliveryReader {
  constructor(private readonly orders: OrderManagementApplicationService) {}

  async getOrderForDelivery(orderId: string): Promise<OrderDeliverySnapshot | null> {
    const result = await this.orders.getOrder(orderId);
    const order = result.value;
    if (!order) {
      return null;
    }

    return Object.freeze({
      orderId: order.orderId,
      customerId: order.customerId,
      status: order.status,
      deliverable: DELIVERABLE_STATUSES.has(order.status),
    });
  }
}
