import type { IOrderRepository } from "@server/ports/order.repository";
import type {
  SalesAnalyticsDTO,
  SalesAnalyticsParams,
  TopProductEntry,
} from "@shared/contracts/analytics";
import { OrderStatus } from "@shared/contracts/order";

const DEFAULT_PERIOD_DAYS = 30;
const TOP_PRODUCTS_LIMIT = 10;

/**
 * analytics.md — a purely consuming module (no own tables). Reads orders
 * already accumulated in Stages 2-3 and aggregates them on the fly; top-funnel
 * metrics (views, cart abandonment) need new tracking infra and are out of
 * scope. Aggregating over the full order set on every request is acceptable
 * at this platform's current scale — materialized views/periodic aggregation
 * is a documented future extension (analytics.md, "Производительность"), not
 * implemented here.
 */
export class AnalyticsService {
  constructor(private readonly orders: IOrderRepository) {}

  async getSalesAnalytics(params: SalesAnalyticsParams = {}): Promise<SalesAnalyticsDTO> {
    const periodEnd = params.periodEnd ? new Date(params.periodEnd) : new Date();
    const periodStart = params.periodStart
      ? new Date(params.periodStart)
      : new Date(periodEnd.getTime() - DEFAULT_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const orders = (
      await this.orders.listInPeriod(periodStart.toISOString(), periodEnd.toISOString())
    ).filter((order) => order.status !== OrderStatus.CANCELLED);

    const orderCount = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    const byProduct = new Map<string, TopProductEntry>();
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.productId) continue;
        const entry = byProduct.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          quantitySold: 0,
          revenue: 0,
        };
        entry.quantitySold += item.quantity;
        entry.revenue += item.lineTotal;
        byProduct.set(item.productId, entry);
      }
    }

    const topProducts = [...byProduct.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, TOP_PRODUCTS_LIMIT);

    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      orderCount,
      revenue,
      averageOrderValue,
      topProducts,
    };
  }
}
