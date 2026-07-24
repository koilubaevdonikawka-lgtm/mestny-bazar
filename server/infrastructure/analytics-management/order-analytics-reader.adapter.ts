import type { OrderManagementService } from "@server/application/order-management/services/order-management.service";
import type {
  IOrderAnalyticsReader,
  OrderAnalyticsRecord,
  OrderAnalyticsSnapshot,
} from "@server/application/analytics-management/contracts/order-analytics-reader.contract";

/** Adapts Order Management to IOrderAnalyticsReader — no Order Repository access. */
export class OrderAnalyticsReaderAdapter implements IOrderAnalyticsReader {
  constructor(private readonly orders: OrderManagementService) {}

  async getOrderSnapshot(): Promise<OrderAnalyticsSnapshot> {
    const orders = await this.orders.getAllOrders();
    const records: OrderAnalyticsRecord[] = orders.map((order) =>
      Object.freeze({
        orderId: order.orderId,
        customerId: order.customerId,
        status: order.status,
        subtotal: order.subtotal,
        currency: order.currency,
        lineCount: order.lines.length,
        sellerIds: Object.freeze([...new Set(order.lines.map((line) => line.sellerId))]),
        createdAt: order.createdAt,
      }),
    );

    const ordersByStatus: Record<string, number> = {};
    let totalRevenue = 0;
    let currency: string | null = null;

    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
      totalRevenue += order.subtotal;
      currency ??= order.currency;
    }

    return Object.freeze({
      totalOrders: orders.length,
      totalRevenue,
      currency,
      ordersByStatus: Object.freeze(ordersByStatus),
      records: Object.freeze(records),
    });
  }
}
