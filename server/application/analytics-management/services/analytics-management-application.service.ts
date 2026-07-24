import {
  GetCustomerAnalyticsUseCase,
  GetDashboardAnalyticsUseCase,
  GetDeliveryAnalyticsUseCase,
  GetOrderAnalyticsUseCase,
  GetPaymentAnalyticsUseCase,
  GetProductAnalyticsUseCase,
  GetSalesAnalyticsUseCase,
  GetSellerAnalyticsUseCase,
} from "@server/application/analytics-management/use-cases/analytics-management.use-cases";

/** Application facade for analytics management scenario. */
export class AnalyticsManagementApplicationService {
  constructor(
    private readonly getDashboardAnalyticsUseCase: GetDashboardAnalyticsUseCase,
    private readonly getSalesAnalyticsUseCase: GetSalesAnalyticsUseCase,
    private readonly getOrderAnalyticsUseCase: GetOrderAnalyticsUseCase,
    private readonly getProductAnalyticsUseCase: GetProductAnalyticsUseCase,
    private readonly getCustomerAnalyticsUseCase: GetCustomerAnalyticsUseCase,
    private readonly getSellerAnalyticsUseCase: GetSellerAnalyticsUseCase,
    private readonly getDeliveryAnalyticsUseCase: GetDeliveryAnalyticsUseCase,
    private readonly getPaymentAnalyticsUseCase: GetPaymentAnalyticsUseCase,
  ) {}

  getDashboard() {
    return this.getDashboardAnalyticsUseCase.execute();
  }

  getSales() {
    return this.getSalesAnalyticsUseCase.execute();
  }

  getOrders() {
    return this.getOrderAnalyticsUseCase.execute();
  }

  getProducts() {
    return this.getProductAnalyticsUseCase.execute();
  }

  getCustomers() {
    return this.getCustomerAnalyticsUseCase.execute();
  }

  getSellers() {
    return this.getSellerAnalyticsUseCase.execute();
  }

  getDeliveries() {
    return this.getDeliveryAnalyticsUseCase.execute();
  }

  getPayments() {
    return this.getPaymentAnalyticsUseCase.execute();
  }
}
