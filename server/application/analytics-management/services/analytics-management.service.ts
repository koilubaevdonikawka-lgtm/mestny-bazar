/**
 * Analytics Management — read-only analytics aggregation.
 *
 * All data obtained via Reader contracts only.
 * Does NOT modify business data or access repositories directly.
 */
import type { IAnalyticsAggregator } from "@server/application/analytics-management/contracts/analytics-aggregator.contract";
import type { IAnalyticsCacheProvider } from "@server/application/analytics-management/contracts/analytics-cache-provider.contract";
import type {
  DashboardAnalytics,
  SalesAnalytics,
} from "@server/application/analytics-management/contracts/analytics-aggregator.contract";
import type { CustomerAnalyticsSnapshot } from "@server/application/analytics-management/contracts/customer-analytics-reader.contract";
import type { DeliveryAnalyticsSnapshot } from "@server/application/analytics-management/contracts/delivery-analytics-reader.contract";
import type { OrderAnalyticsSnapshot } from "@server/application/analytics-management/contracts/order-analytics-reader.contract";
import type { PaymentAnalyticsSnapshot } from "@server/application/analytics-management/contracts/payment-analytics-reader.contract";
import type { ProductAnalyticsSnapshot } from "@server/application/analytics-management/contracts/product-analytics-reader.contract";
import type { SellerAnalyticsSnapshot } from "@server/application/analytics-management/contracts/seller-analytics-reader.contract";

const CACHE_TTL_SECONDS = 30;

export class AnalyticsManagementService {
  constructor(
    private readonly aggregator: IAnalyticsAggregator,
    private readonly cache: IAnalyticsCacheProvider,
  ) {}

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return this.withCache("dashboard", () => this.aggregator.getDashboard());
  }

  async getSalesAnalytics(): Promise<SalesAnalytics> {
    return this.withCache("sales", () => this.aggregator.getSales());
  }

  async getOrderAnalytics(): Promise<OrderAnalyticsSnapshot> {
    return this.withCache("orders", () => this.aggregator.getOrders());
  }

  async getProductAnalytics(): Promise<ProductAnalyticsSnapshot> {
    return this.withCache("products", () => this.aggregator.getProducts());
  }

  async getCustomerAnalytics(): Promise<CustomerAnalyticsSnapshot> {
    return this.withCache("customers", () => this.aggregator.getCustomers());
  }

  async getSellerAnalytics(): Promise<SellerAnalyticsSnapshot> {
    return this.withCache("sellers", () => this.aggregator.getSellers());
  }

  async getDeliveryAnalytics(): Promise<DeliveryAnalyticsSnapshot> {
    return this.withCache("deliveries", () => this.aggregator.getDeliveries());
  }

  async getPaymentAnalytics(): Promise<PaymentAnalyticsSnapshot> {
    return this.withCache("payments", () => this.aggregator.getPayments());
  }

  private async withCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await loader();
    await this.cache.set(key, value, CACHE_TTL_SECONDS);
    return value;
  }
}
