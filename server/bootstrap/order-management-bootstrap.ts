import type { CheckoutManagementApplicationService } from "@server/application/checkout-management/services/checkout-management-application.service";
import type { ICheckoutOrderReader } from "@server/application/order-management/contracts/checkout-order-reader.contract";
import type { IOrderAnalyticsProvider } from "@server/application/order-management/contracts/order-analytics-provider.contract";
import type { IOrderEventPublisher } from "@server/application/order-management/contracts/order-event-publisher.contract";
import type { IOrderHistoryRepository } from "@server/application/order-management/contracts/order-history-repository.contract";
import type { IOrderRepository } from "@server/application/order-management/contracts/order-repository.contract";
import type { IOrderStatusProvider } from "@server/application/order-management/contracts/order-status-provider.contract";
import {
  CancelOrderUseCase,
  CreateOrderUseCase,
  GetCustomerOrdersUseCase,
  GetOrderHistoryUseCase,
  GetOrderUseCase,
  OrderManagementApplicationService,
  OrderManagementService,
  UpdateOrderStatusUseCase,
} from "@server/application/order-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CheckoutOrderReaderAdapter } from "@server/infrastructure/order-management/checkout-order-reader.adapter";
import { DefaultOrderStatusProvider } from "@server/infrastructure/order-management/default-order-status.provider";
import { NoopOrderAnalyticsProvider } from "@server/infrastructure/order-management/noop-order-analytics.provider";
import { NoopOrderEventPublisher } from "@server/infrastructure/order-management/noop-order-event.publisher";
import { OrderHistoryRepository } from "@server/infrastructure/order-management/order-history.repository";
import { OrderRepository } from "@server/infrastructure/order-management/order.repository";

/** Registers order management services and use cases. */
export function registerOrderManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.OrderManagementRepository, () => new OrderRepository());

  registry.registerSingleton(InfrastructureTokens.OrderHistoryRepository, () =>
    new OrderHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.CheckoutOrderReader, (provider) =>
    new CheckoutOrderReaderAdapter(
      provider.resolve<CheckoutManagementApplicationService>(
        InfrastructureTokens.CheckoutManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.OrderStatusProvider, () =>
    new DefaultOrderStatusProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.OrderEventPublisher, () =>
    new NoopOrderEventPublisher(),
  );

  registry.registerSingleton(InfrastructureTokens.OrderAnalyticsProvider, () =>
    new NoopOrderAnalyticsProvider(),
  );

  registry.registerTransient(InfrastructureTokens.OrderManagementService, (provider) =>
    new OrderManagementService(
      provider.resolve<IOrderRepository>(InfrastructureTokens.OrderManagementRepository),
      provider.resolve<ICheckoutOrderReader>(InfrastructureTokens.CheckoutOrderReader),
      provider.resolve<IOrderStatusProvider>(InfrastructureTokens.OrderStatusProvider),
      provider.resolve<IOrderHistoryRepository>(InfrastructureTokens.OrderHistoryRepository),
      provider.resolve<IOrderEventPublisher>(InfrastructureTokens.OrderEventPublisher),
      provider.resolve<IOrderAnalyticsProvider>(InfrastructureTokens.OrderAnalyticsProvider),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(InfrastructureTokens.OrderManagementCreateOrderUseCase, (provider) =>
    new CreateOrderUseCase(
      provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.OrderManagementGetOrderUseCase, (provider) =>
    new GetOrderUseCase(
      provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
    ),
  );
  registry.registerTransient(
    InfrastructureTokens.OrderManagementGetCustomerOrdersUseCase,
    (provider) =>
      new GetCustomerOrdersUseCase(
        provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.OrderManagementUpdateOrderStatusUseCase,
    (provider) =>
      new UpdateOrderStatusUseCase(
        provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
      ),
  );
  registry.registerTransient(InfrastructureTokens.OrderManagementCancelOrderUseCase, (provider) =>
    new CancelOrderUseCase(
      provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.OrderManagementGetOrderHistoryUseCase, (provider) =>
    new GetOrderHistoryUseCase(
      provider.resolve<OrderManagementService>(InfrastructureTokens.OrderManagementService),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.OrderManagementApplicationService,
    (provider) =>
      new OrderManagementApplicationService(
        provider.resolve<CreateOrderUseCase>(InfrastructureTokens.OrderManagementCreateOrderUseCase),
        provider.resolve<GetOrderUseCase>(InfrastructureTokens.OrderManagementGetOrderUseCase),
        provider.resolve<GetCustomerOrdersUseCase>(
          InfrastructureTokens.OrderManagementGetCustomerOrdersUseCase,
        ),
        provider.resolve<UpdateOrderStatusUseCase>(
          InfrastructureTokens.OrderManagementUpdateOrderStatusUseCase,
        ),
        provider.resolve<CancelOrderUseCase>(InfrastructureTokens.OrderManagementCancelOrderUseCase),
        provider.resolve<GetOrderHistoryUseCase>(
          InfrastructureTokens.OrderManagementGetOrderHistoryUseCase,
        ),
      ),
  );
}
