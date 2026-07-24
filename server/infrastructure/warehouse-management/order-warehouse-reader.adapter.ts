import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";
import type {
  IOrderWarehouseReader,
  OrderWarehouseSnapshot,
} from "@server/application/warehouse-management/contracts/order-warehouse-reader.contract";

const PICKABLE_STATUSES = new Set<string>([
  OrderManagementStatus.Confirmed,
  OrderManagementStatus.Processing,
  OrderManagementStatus.Shipped,
]);

/** Adapts Order Management to IOrderWarehouseReader — no Order Repository access. */
export class OrderWarehouseReaderAdapter implements IOrderWarehouseReader {
  constructor(private readonly orders: OrderManagementApplicationService) {}

  async getOrderForPicking(orderId: string): Promise<OrderWarehouseSnapshot | null> {
    const result = await this.orders.getOrder(orderId);
    const order = result.value;
    if (!order) {
      return null;
    }

    return Object.freeze({
      orderId: order.orderId,
      customerId: order.customerId,
      status: order.status,
      pickable: PICKABLE_STATUSES.has(order.status),
    });
  }
}
