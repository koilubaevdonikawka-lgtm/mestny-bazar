import type {
  CustomerAnalyticsRecord,
  CustomerAnalyticsSnapshot,
  ICustomerAnalyticsReader,
} from "@server/application/analytics-management/contracts/customer-analytics-reader.contract";
import type { IOrderAnalyticsReader } from "@server/application/analytics-management/contracts/order-analytics-reader.contract";

/** Derives customer analytics from order reader — no direct customer repository access. */
export class CustomerAnalyticsReaderAdapter implements ICustomerAnalyticsReader {
  constructor(private readonly orders: IOrderAnalyticsReader) {}

  async getCustomerSnapshot(): Promise<CustomerAnalyticsSnapshot> {
    const orderSnapshot = await this.orders.getOrderSnapshot();
    const customerMap = new Map<string, CustomerAnalyticsRecord>();

    for (const order of orderSnapshot.records) {
      const existing = customerMap.get(order.customerId);
      if (!existing) {
        customerMap.set(
          order.customerId,
          Object.freeze({
            customerId: order.customerId,
            orderCount: 1,
            totalSpent: order.subtotal,
            currency: order.currency,
            lastOrderAt: order.createdAt,
          }),
        );
        continue;
      }

      customerMap.set(
        order.customerId,
        Object.freeze({
          customerId: order.customerId,
          orderCount: existing.orderCount + 1,
          totalSpent: existing.totalSpent + order.subtotal,
          currency: existing.currency ?? order.currency,
          lastOrderAt:
            existing.lastOrderAt && existing.lastOrderAt > order.createdAt
              ? existing.lastOrderAt
              : order.createdAt,
        }),
      );
    }

    const records = Object.freeze([...customerMap.values()]);
    const totalCustomers = records.length;
    const activeCustomers = records.filter((record) => record.orderCount > 0).length;
    const averageOrdersPerCustomer =
      totalCustomers > 0
        ? records.reduce((sum, record) => sum + record.orderCount, 0) / totalCustomers
        : 0;

    return Object.freeze({
      totalCustomers,
      activeCustomers,
      averageOrdersPerCustomer,
      records,
    });
  }
}
