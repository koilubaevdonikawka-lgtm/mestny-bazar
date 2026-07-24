import type { IAnalyticsAggregator } from "@server/application/analytics-management/contracts/analytics-aggregator.contract";
import type { IAnalyticsCacheProvider } from "@server/application/analytics-management/contracts/analytics-cache-provider.contract";
import type { ICustomerAnalyticsReader } from "@server/application/analytics-management/contracts/customer-analytics-reader.contract";
import type { IDeliveryAnalyticsReader } from "@server/application/analytics-management/contracts/delivery-analytics-reader.contract";
import type { IOrderAnalyticsReader } from "@server/application/analytics-management/contracts/order-analytics-reader.contract";
import type { IPaymentAnalyticsReader } from "@server/application/analytics-management/contracts/payment-analytics-reader.contract";
import type { IProductAnalyticsReader } from "@server/application/analytics-management/contracts/product-analytics-reader.contract";
import type { ISellerAnalyticsReader } from "@server/application/analytics-management/contracts/seller-analytics-reader.contract";
import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { DeliveryManagementService } from "@server/application/delivery-management/services/delivery-management.service";
import type { OrderManagementService } from "@server/application/order-management/services/order-management.service";
import type { PaymentManagementService } from "@server/application/payment-management/services/payment-management.service";
import {
  AnalyticsManagementApplicationService,
  AnalyticsManagementService,
  GetCustomerAnalyticsUseCase,
  GetDashboardAnalyticsUseCase,
  GetDeliveryAnalyticsUseCase,
  GetOrderAnalyticsUseCase,
  GetPaymentAnalyticsUseCase,
  GetProductAnalyticsUseCase,
  GetSalesAnalyticsUseCase,
  GetSellerAnalyticsUseCase,
} from "@server/application/analytics-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CustomerAnalyticsReaderAdapter } from "@server/infrastructure/analytics-management/customer-analytics-reader.adapter";
import { DefaultAnalyticsAggregator } from "@server/infrastructure/analytics-management/default-analytics.aggregator";
import { DeliveryAnalyticsReaderAdapter } from "@server/infrastructure/analytics-management/delivery-analytics-reader.adapter";
import { NoopAnalyticsCacheProvider } from "@server/infrastructure/analytics-management/noop-analytics-cache.provider";
import { OrderAnalyticsReaderAdapter } from "@server/infrastructure/analytics-management/order-analytics-reader.adapter";
import { PaymentAnalyticsReaderAdapter } from "@server/infrastructure/analytics-management/payment-analytics-reader.adapter";
import { ProductAnalyticsReaderAdapter } from "@server/infrastructure/analytics-management/product-analytics-reader.adapter";
import { SellerAnalyticsReaderAdapter } from "@server/infrastructure/analytics-management/seller-analytics-reader.adapter";

/** Registers analytics management services and use cases. */
export function registerAnalyticsManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.OrderAnalyticsReader, (provider) =>
    new OrderAnalyticsReaderAdapter(
      provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.PaymentAnalyticsReader, (provider) =>
    new PaymentAnalyticsReaderAdapter(
      provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.DeliveryAnalyticsReader, (provider) =>
    new DeliveryAnalyticsReaderAdapter(
      provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.ProductAnalyticsReader, (provider) =>
    new ProductAnalyticsReaderAdapter(
      provider.resolve<CatalogManagementApplicationService>(
        InfrastructureTokens.CatalogManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CustomerAnalyticsReader, (provider) =>
    new CustomerAnalyticsReaderAdapter(
      provider.resolve<IOrderAnalyticsReader>(InfrastructureTokens.OrderAnalyticsReader),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.SellerAnalyticsReader, (provider) =>
    new SellerAnalyticsReaderAdapter(
      provider.resolve<IOrderAnalyticsReader>(InfrastructureTokens.OrderAnalyticsReader),
      provider.resolve<IProductAnalyticsReader>(InfrastructureTokens.ProductAnalyticsReader),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.AnalyticsAggregator, (provider) =>
    new DefaultAnalyticsAggregator(
      provider.resolve<IOrderAnalyticsReader>(InfrastructureTokens.OrderAnalyticsReader),
      provider.resolve<IPaymentAnalyticsReader>(InfrastructureTokens.PaymentAnalyticsReader),
      provider.resolve<IDeliveryAnalyticsReader>(InfrastructureTokens.DeliveryAnalyticsReader),
      provider.resolve<IProductAnalyticsReader>(InfrastructureTokens.ProductAnalyticsReader),
      provider.resolve<ICustomerAnalyticsReader>(InfrastructureTokens.CustomerAnalyticsReader),
      provider.resolve<ISellerAnalyticsReader>(InfrastructureTokens.SellerAnalyticsReader),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.AnalyticsCacheProvider, () =>
    new NoopAnalyticsCacheProvider(),
  );

  registry.registerTransient(InfrastructureTokens.AnalyticsManagementService, (provider) =>
    new AnalyticsManagementService(
      provider.resolve<IAnalyticsAggregator>(InfrastructureTokens.AnalyticsAggregator),
      provider.resolve<IAnalyticsCacheProvider>(InfrastructureTokens.AnalyticsCacheProvider),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetDashboardAnalyticsUseCase,
    (provider) =>
      new GetDashboardAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetSalesAnalyticsUseCase,
    (provider) =>
      new GetSalesAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetOrderAnalyticsUseCase,
    (provider) =>
      new GetOrderAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetProductAnalyticsUseCase,
    (provider) =>
      new GetProductAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetCustomerAnalyticsUseCase,
    (provider) =>
      new GetCustomerAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetSellerAnalyticsUseCase,
    (provider) =>
      new GetSellerAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetDeliveryAnalyticsUseCase,
    (provider) =>
      new GetDeliveryAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementGetPaymentAnalyticsUseCase,
    (provider) =>
      new GetPaymentAnalyticsUseCase(
        provider.resolve<AnalyticsManagementService>(InfrastructureTokens.AnalyticsManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AnalyticsManagementApplicationService,
    (provider) =>
      new AnalyticsManagementApplicationService(
        provider.resolve<GetDashboardAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetDashboardAnalyticsUseCase,
        ),
        provider.resolve<GetSalesAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetSalesAnalyticsUseCase,
        ),
        provider.resolve<GetOrderAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetOrderAnalyticsUseCase,
        ),
        provider.resolve<GetProductAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetProductAnalyticsUseCase,
        ),
        provider.resolve<GetCustomerAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetCustomerAnalyticsUseCase,
        ),
        provider.resolve<GetSellerAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetSellerAnalyticsUseCase,
        ),
        provider.resolve<GetDeliveryAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetDeliveryAnalyticsUseCase,
        ),
        provider.resolve<GetPaymentAnalyticsUseCase>(
          InfrastructureTokens.AnalyticsManagementGetPaymentAnalyticsUseCase,
        ),
      ),
  );
}
