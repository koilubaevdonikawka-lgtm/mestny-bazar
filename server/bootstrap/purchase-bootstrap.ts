import {
  AddToCartUseCase,
  BrowseCatalogUseCase,
  CheckoutUseCase,
  NotifyCourierUseCase,
  NotifyWarehouseUseCase,
  PayOrderUseCase,
  PurchaseCreateOrderUseCase,
  UpdateCartUseCase,
  ViewProductUseCase,
} from "@server/application/purchase/use-cases";
import {
  PurchaseApplicationService,
  PurchaseFlowService,
} from "@server/application/purchase/services";
import type {
  CartModule,
  CheckoutModule,
  NotificationModule,
  OrderFulfillmentModule,
  OrderModule,
  PaymentModule,
  ProductModule,
  SearchModule,
} from "@server/application/modules";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";

/** Registers purchase vertical slice use cases and application services. */
export function registerPurchaseApplication(registry: ServiceRegistry): void {
  registry.registerTransient(InfrastructureTokens.BrowseCatalogUseCase, (provider) =>
    new BrowseCatalogUseCase(provider.resolve<SearchModule>(BootstrapTokens.SearchModule)),
  );

  registry.registerTransient(InfrastructureTokens.ViewProductUseCase, (provider) =>
    new ViewProductUseCase(provider.resolve<ProductModule>(BootstrapTokens.ProductModule)),
  );

  registry.registerTransient(InfrastructureTokens.AddToCartUseCase, (provider) =>
    new AddToCartUseCase(provider.resolve<CartModule>(BootstrapTokens.CartModule)),
  );

  registry.registerTransient(InfrastructureTokens.UpdateCartUseCase, (provider) =>
    new UpdateCartUseCase(provider.resolve<CartModule>(BootstrapTokens.CartModule)),
  );

  registry.registerTransient(InfrastructureTokens.CheckoutUseCase, (provider) =>
    new CheckoutUseCase(provider.resolve<CheckoutModule>(BootstrapTokens.CheckoutModule)),
  );

  registry.registerTransient(InfrastructureTokens.PurchaseCreateOrderUseCase, (provider) =>
    new PurchaseCreateOrderUseCase(
      provider.resolve<CheckoutModule>(BootstrapTokens.CheckoutModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.PayOrderUseCase, (provider) =>
    new PayOrderUseCase(provider.resolve<PaymentModule>(BootstrapTokens.PaymentModule)),
  );

  registry.registerTransient(InfrastructureTokens.NotifyWarehouseUseCase, (provider) =>
    new NotifyWarehouseUseCase(
      provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.NotifyCourierUseCase, (provider) =>
    new NotifyCourierUseCase(
      provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.PurchaseFlowService, (provider) =>
    new PurchaseFlowService(
      provider.resolve<PurchaseCreateOrderUseCase>(InfrastructureTokens.PurchaseCreateOrderUseCase),
      provider.resolve<PayOrderUseCase>(InfrastructureTokens.PayOrderUseCase),
      provider.resolve<NotifyWarehouseUseCase>(InfrastructureTokens.NotifyWarehouseUseCase),
      provider.resolve<NotifyCourierUseCase>(InfrastructureTokens.NotifyCourierUseCase),
      provider.resolve<OrderFulfillmentModule>(BootstrapTokens.OrderFulfillmentModule),
      provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
      provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.PurchaseApplicationService, (provider) =>
    new PurchaseApplicationService(
      provider.resolve<BrowseCatalogUseCase>(InfrastructureTokens.BrowseCatalogUseCase),
      provider.resolve<ViewProductUseCase>(InfrastructureTokens.ViewProductUseCase),
      provider.resolve<AddToCartUseCase>(InfrastructureTokens.AddToCartUseCase),
      provider.resolve<UpdateCartUseCase>(InfrastructureTokens.UpdateCartUseCase),
      provider.resolve<CheckoutUseCase>(InfrastructureTokens.CheckoutUseCase),
      provider.resolve<PurchaseCreateOrderUseCase>(InfrastructureTokens.PurchaseCreateOrderUseCase),
      provider.resolve<PayOrderUseCase>(InfrastructureTokens.PayOrderUseCase),
      provider.resolve<NotifyWarehouseUseCase>(InfrastructureTokens.NotifyWarehouseUseCase),
      provider.resolve<NotifyCourierUseCase>(InfrastructureTokens.NotifyCourierUseCase),
      provider.resolve<PurchaseFlowService>(InfrastructureTokens.PurchaseFlowService),
    ),
  );
}
