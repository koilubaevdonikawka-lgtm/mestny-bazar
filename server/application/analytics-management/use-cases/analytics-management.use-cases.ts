import type { AnalyticsManagementService } from "@server/application/analytics-management/services/analytics-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type {
  DashboardAnalytics,
  SalesAnalytics,
} from "@server/application/analytics-management/contracts/analytics-aggregator.contract";
import type { OrderAnalyticsSnapshot } from "@server/application/analytics-management/contracts/order-analytics-reader.contract";
import type { PaymentAnalyticsSnapshot } from "@server/application/analytics-management/contracts/payment-analytics-reader.contract";
import type { DeliveryAnalyticsSnapshot } from "@server/application/analytics-management/contracts/delivery-analytics-reader.contract";
import type { ProductAnalyticsSnapshot } from "@server/application/analytics-management/contracts/product-analytics-reader.contract";
import type { CustomerAnalyticsSnapshot } from "@server/application/analytics-management/contracts/customer-analytics-reader.contract";
import type { SellerAnalyticsSnapshot } from "@server/application/analytics-management/contracts/seller-analytics-reader.contract";

export class GetDashboardAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<DashboardAnalytics>> {
    return this.analytics.getDashboardAnalytics().then(useCaseResult);
  }
}

export class GetSalesAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<SalesAnalytics>> {
    return this.analytics.getSalesAnalytics().then(useCaseResult);
  }
}

export class GetOrderAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<OrderAnalyticsSnapshot>> {
    return this.analytics.getOrderAnalytics().then(useCaseResult);
  }
}

export class GetProductAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<ProductAnalyticsSnapshot>> {
    return this.analytics.getProductAnalytics().then(useCaseResult);
  }
}

export class GetCustomerAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<CustomerAnalyticsSnapshot>> {
    return this.analytics.getCustomerAnalytics().then(useCaseResult);
  }
}

export class GetSellerAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<SellerAnalyticsSnapshot>> {
    return this.analytics.getSellerAnalytics().then(useCaseResult);
  }
}

export class GetDeliveryAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<DeliveryAnalyticsSnapshot>> {
    return this.analytics.getDeliveryAnalytics().then(useCaseResult);
  }
}

export class GetPaymentAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsManagementService) {}

  execute(): Promise<UseCaseResult<PaymentAnalyticsSnapshot>> {
    return this.analytics.getPaymentAnalytics().then(useCaseResult);
  }
}
