import type {
  DashboardAnalytics,
  IAnalyticsAggregator,
  SalesAnalytics,
} from "@server/application/analytics-management/contracts/analytics-aggregator.contract";
import type { ICustomerAnalyticsReader } from "@server/application/analytics-management/contracts/customer-analytics-reader.contract";
import type { IDeliveryAnalyticsReader } from "@server/application/analytics-management/contracts/delivery-analytics-reader.contract";
import type { IOrderAnalyticsReader } from "@server/application/analytics-management/contracts/order-analytics-reader.contract";
import type { IPaymentAnalyticsReader } from "@server/application/analytics-management/contracts/payment-analytics-reader.contract";
import type { IProductAnalyticsReader } from "@server/application/analytics-management/contracts/product-analytics-reader.contract";
import type { ISellerAnalyticsReader } from "@server/application/analytics-management/contracts/seller-analytics-reader.contract";

/** Default in-memory analytics aggregator — no ClickHouse, Elasticsearch, or external BI. */
export class DefaultAnalyticsAggregator implements IAnalyticsAggregator {
  constructor(
    private readonly orders: IOrderAnalyticsReader,
    private readonly payments: IPaymentAnalyticsReader,
    private readonly deliveries: IDeliveryAnalyticsReader,
    private readonly products: IProductAnalyticsReader,
    private readonly customers: ICustomerAnalyticsReader,
    private readonly sellers: ISellerAnalyticsReader,
  ) {}

  async getDashboard(): Promise<DashboardAnalytics> {
    const [orders, payments, deliveries, products, customers, sellers] = await Promise.all([
      this.orders.getOrderSnapshot(),
      this.payments.getPaymentSnapshot(),
      this.deliveries.getDeliverySnapshot(),
      this.products.getProductSnapshot(),
      this.customers.getCustomerSnapshot(),
      this.sellers.getSellerSnapshot(),
    ]);

    return Object.freeze({
      generatedAt: new Date().toISOString(),
      orders: Object.freeze({
        totalOrders: orders.totalOrders,
        totalRevenue: orders.totalRevenue,
        currency: orders.currency,
        ordersByStatus: orders.ordersByStatus,
      }),
      payments: Object.freeze({
        totalPayments: payments.totalPayments,
        totalAmount: payments.totalAmount,
        succeededAmount: payments.succeededAmount,
        paymentsByStatus: payments.paymentsByStatus,
      }),
      deliveries: Object.freeze({
        totalDeliveries: deliveries.totalDeliveries,
        deliveriesByStatus: deliveries.deliveriesByStatus,
        assignedCount: deliveries.assignedCount,
      }),
      products: Object.freeze({
        totalProducts: products.totalProducts,
        availableProducts: products.availableProducts,
      }),
      customers: Object.freeze({
        totalCustomers: customers.totalCustomers,
        activeCustomers: customers.activeCustomers,
      }),
      sellers: Object.freeze({
        totalSellers: sellers.totalSellers,
      }),
    });
  }

  async getSales(): Promise<SalesAnalytics> {
    const [orders, payments] = await Promise.all([
      this.orders.getOrderSnapshot(),
      this.payments.getPaymentSnapshot(),
    ]);

    const revenueByStatus = { ...orders.ordersByStatus };
    const averageOrderValue =
      orders.totalOrders > 0 ? orders.totalRevenue / orders.totalOrders : 0;

    return Object.freeze({
      generatedAt: new Date().toISOString(),
      totalRevenue: orders.totalRevenue,
      succeededPayments: payments.succeededAmount,
      averageOrderValue,
      currency: orders.currency ?? payments.currency,
      revenueByStatus: Object.freeze(revenueByStatus),
    });
  }

  getOrders() {
    return this.orders.getOrderSnapshot();
  }

  getProducts() {
    return this.products.getProductSnapshot();
  }

  getCustomers() {
    return this.customers.getCustomerSnapshot();
  }

  getSellers() {
    return this.sellers.getSellerSnapshot();
  }

  getDeliveries() {
    return this.deliveries.getDeliverySnapshot();
  }

  getPayments() {
    return this.payments.getPaymentSnapshot();
  }
}
