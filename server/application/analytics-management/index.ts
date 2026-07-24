export type {
  OrderAnalyticsRecord,
  OrderAnalyticsSnapshot,
  IOrderAnalyticsReader,
} from "./contracts/order-analytics-reader.contract";
export type {
  PaymentAnalyticsRecord,
  PaymentAnalyticsSnapshot,
  IPaymentAnalyticsReader,
} from "./contracts/payment-analytics-reader.contract";
export type {
  DeliveryAnalyticsRecord,
  DeliveryAnalyticsSnapshot,
  IDeliveryAnalyticsReader,
} from "./contracts/delivery-analytics-reader.contract";
export type {
  ProductAnalyticsRecord,
  ProductAnalyticsSnapshot,
  IProductAnalyticsReader,
} from "./contracts/product-analytics-reader.contract";
export type {
  CustomerAnalyticsRecord,
  CustomerAnalyticsSnapshot,
  ICustomerAnalyticsReader,
} from "./contracts/customer-analytics-reader.contract";
export type {
  SellerAnalyticsRecord,
  SellerAnalyticsSnapshot,
  ISellerAnalyticsReader,
} from "./contracts/seller-analytics-reader.contract";
export type {
  DashboardAnalytics,
  SalesAnalytics,
  IAnalyticsAggregator,
} from "./contracts/analytics-aggregator.contract";
export type { IAnalyticsCacheProvider } from "./contracts/analytics-cache-provider.contract";
export type {
  IBiEngine,
  IDataWarehouse,
  IForecastEngine,
  IRecommendationEngine,
  IMachineLearning,
  IRealTimeAnalytics,
} from "./contracts/analytics-extension-ports.contract";
export { AnalyticsManagementService } from "./services/analytics-management.service";
export { AnalyticsManagementApplicationService } from "./services/analytics-management-application.service";
export {
  GetDashboardAnalyticsUseCase,
  GetSalesAnalyticsUseCase,
  GetOrderAnalyticsUseCase,
  GetProductAnalyticsUseCase,
  GetCustomerAnalyticsUseCase,
  GetSellerAnalyticsUseCase,
  GetDeliveryAnalyticsUseCase,
  GetPaymentAnalyticsUseCase,
} from "./use-cases/analytics-management.use-cases";
