import type { CustomerAnalyticsSnapshot } from "./customer-analytics-reader.contract";
import type { DeliveryAnalyticsSnapshot } from "./delivery-analytics-reader.contract";
import type { OrderAnalyticsSnapshot } from "./order-analytics-reader.contract";
import type { PaymentAnalyticsSnapshot } from "./payment-analytics-reader.contract";
import type { ProductAnalyticsSnapshot } from "./product-analytics-reader.contract";
import type { SellerAnalyticsSnapshot } from "./seller-analytics-reader.contract";

export interface DashboardAnalytics {
  readonly generatedAt: string;
  readonly orders: Pick<OrderAnalyticsSnapshot, "totalOrders" | "totalRevenue" | "currency" | "ordersByStatus">;
  readonly payments: Pick<
    PaymentAnalyticsSnapshot,
    "totalPayments" | "totalAmount" | "succeededAmount" | "paymentsByStatus"
  >;
  readonly deliveries: Pick<DeliveryAnalyticsSnapshot, "totalDeliveries" | "deliveriesByStatus" | "assignedCount">;
  readonly products: Pick<ProductAnalyticsSnapshot, "totalProducts" | "availableProducts">;
  readonly customers: Pick<CustomerAnalyticsSnapshot, "totalCustomers" | "activeCustomers">;
  readonly sellers: Pick<SellerAnalyticsSnapshot, "totalSellers">;
}

export interface SalesAnalytics {
  readonly generatedAt: string;
  readonly totalRevenue: number;
  readonly succeededPayments: number;
  readonly averageOrderValue: number;
  readonly currency: string | null;
  readonly revenueByStatus: Readonly<Record<string, number>>;
}

export interface IAnalyticsAggregator {
  getDashboard(): Promise<DashboardAnalytics>;
  getSales(): Promise<SalesAnalytics>;
  getOrders(): Promise<OrderAnalyticsSnapshot>;
  getProducts(): Promise<ProductAnalyticsSnapshot>;
  getCustomers(): Promise<CustomerAnalyticsSnapshot>;
  getSellers(): Promise<SellerAnalyticsSnapshot>;
  getDeliveries(): Promise<DeliveryAnalyticsSnapshot>;
  getPayments(): Promise<PaymentAnalyticsSnapshot>;
}
