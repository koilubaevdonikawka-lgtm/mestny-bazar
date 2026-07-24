import type {
  ISellerAnalyticsReader,
  SellerAnalyticsRecord,
  SellerAnalyticsSnapshot,
} from "@server/application/analytics-management/contracts/seller-analytics-reader.contract";
import type { IOrderAnalyticsReader } from "@server/application/analytics-management/contracts/order-analytics-reader.contract";
import type { IProductAnalyticsReader } from "@server/application/analytics-management/contracts/product-analytics-reader.contract";

/** Derives seller analytics from order and product readers. */
export class SellerAnalyticsReaderAdapter implements ISellerAnalyticsReader {
  constructor(
    private readonly orders: IOrderAnalyticsReader,
    private readonly products: IProductAnalyticsReader,
  ) {}

  async getSellerSnapshot(): Promise<SellerAnalyticsSnapshot> {
    const [orderSnapshot, productSnapshot] = await Promise.all([
      this.orders.getOrderSnapshot(),
      this.products.getProductSnapshot(),
    ]);

    const sellerMap = new Map<string, SellerAnalyticsRecord>();

    for (const product of productSnapshot.records) {
      sellerMap.set(
        product.sellerId,
        Object.freeze({
          sellerId: product.sellerId,
          productCount: (sellerMap.get(product.sellerId)?.productCount ?? 0) + 1,
          orderCount: sellerMap.get(product.sellerId)?.orderCount ?? 0,
          revenue: sellerMap.get(product.sellerId)?.revenue ?? 0,
          currency: product.currency,
        }),
      );
    }

    for (const order of orderSnapshot.records) {
      for (const sellerId of order.sellerIds) {
        const existing = sellerMap.get(sellerId) ?? Object.freeze({
          sellerId,
          productCount: 0,
          orderCount: 0,
          revenue: 0,
          currency: order.currency,
        });

        sellerMap.set(
          sellerId,
          Object.freeze({
            ...existing,
            orderCount: existing.orderCount + 1,
            revenue: existing.revenue + order.subtotal / Math.max(order.sellerIds.length, 1),
            currency: existing.currency ?? order.currency,
          }),
        );
      }
    }

    const records = Object.freeze([...sellerMap.values()]);
    const topSellersByRevenue = Object.freeze(
      [...records].sort((left, right) => right.revenue - left.revenue).slice(0, 10),
    );

    return Object.freeze({
      totalSellers: records.length,
      topSellersByRevenue,
      records,
    });
  }
}
