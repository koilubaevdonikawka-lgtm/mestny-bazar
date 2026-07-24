import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { ICatalogCartReader } from "@server/application/cart-management/contracts/catalog-cart-reader.contract";
import type { ICartAnalyticsProvider } from "@server/application/cart-management/contracts/cart-analytics-provider.contract";
import type { ICartEventPublisher } from "@server/application/cart-management/contracts/cart-event-publisher.contract";
import type { ICartInventoryProvider } from "@server/application/cart-management/contracts/cart-inventory-provider.contract";
import type { ICartPricingProvider } from "@server/application/cart-management/contracts/cart-pricing-provider.contract";
import type { ICartRepository } from "@server/application/cart-management/contracts/cart-repository.contract";
import {
  AddProductToCartUseCase,
  CalculateCartTotalUseCase,
  CartManagementApplicationService,
  CartManagementService,
  ClearCartUseCase,
  GetCartUseCase,
  RemoveProductFromCartUseCase,
  UpdateCartItemQuantityUseCase,
  ValidateCartUseCase,
} from "@server/application/cart-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CartRepository } from "@server/infrastructure/cart/cart.repository";
import { CatalogCartReaderAdapter } from "@server/infrastructure/cart/catalog-cart-reader.adapter";
import { DefaultCartInventoryProvider } from "@server/infrastructure/cart/default-cart-inventory.provider";
import { DefaultCartPricingProvider } from "@server/infrastructure/cart/default-cart-pricing.provider";
import { NoopCartAnalyticsProvider } from "@server/infrastructure/cart/noop-cart-analytics.provider";
import { NoopCartEventPublisher } from "@server/infrastructure/cart/noop-cart-event.publisher";

/** Registers cart management services and use cases. */
export function registerCartManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CartRepository, () => new CartRepository());

  registry.registerSingleton(InfrastructureTokens.CatalogCartReader, (provider) =>
    new CatalogCartReaderAdapter(
      provider.resolve<CatalogManagementApplicationService>(
        InfrastructureTokens.CatalogManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CartPricingProvider, () =>
    new DefaultCartPricingProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.CartInventoryProvider, (provider) =>
    new DefaultCartInventoryProvider(
      provider.resolve<ICatalogCartReader>(InfrastructureTokens.CatalogCartReader),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CartEventPublisher, () =>
    new NoopCartEventPublisher(),
  );

  registry.registerSingleton(InfrastructureTokens.CartAnalyticsProvider, () =>
    new NoopCartAnalyticsProvider(),
  );

  registry.registerTransient(InfrastructureTokens.CartManagementService, (provider) =>
    new CartManagementService(
      provider.resolve<ICartRepository>(InfrastructureTokens.CartRepository),
      provider.resolve<ICatalogCartReader>(InfrastructureTokens.CatalogCartReader),
      provider.resolve<ICartPricingProvider>(InfrastructureTokens.CartPricingProvider),
      provider.resolve<ICartInventoryProvider>(InfrastructureTokens.CartInventoryProvider),
      provider.resolve<ICartEventPublisher>(InfrastructureTokens.CartEventPublisher),
      provider.resolve<ICartAnalyticsProvider>(InfrastructureTokens.CartAnalyticsProvider),
    ),
  );

  registry.registerTransient(InfrastructureTokens.AddProductToCartUseCase, (provider) =>
    new AddProductToCartUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UpdateCartItemQuantityUseCase, (provider) =>
    new UpdateCartItemQuantityUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.RemoveProductFromCartUseCase, (provider) =>
    new RemoveProductFromCartUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetCartUseCase, (provider) =>
    new GetCartUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ClearCartUseCase, (provider) =>
    new ClearCartUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CalculateCartTotalUseCase, (provider) =>
    new CalculateCartTotalUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ValidateCartUseCase, (provider) =>
    new ValidateCartUseCase(
      provider.resolve<CartManagementService>(InfrastructureTokens.CartManagementService),
    ),
  );

  registry.registerTransient(InfrastructureTokens.CartManagementApplicationService, (provider) =>
    new CartManagementApplicationService(
      provider.resolve<AddProductToCartUseCase>(InfrastructureTokens.AddProductToCartUseCase),
      provider.resolve<UpdateCartItemQuantityUseCase>(
        InfrastructureTokens.UpdateCartItemQuantityUseCase,
      ),
      provider.resolve<RemoveProductFromCartUseCase>(
        InfrastructureTokens.RemoveProductFromCartUseCase,
      ),
      provider.resolve<GetCartUseCase>(InfrastructureTokens.GetCartUseCase),
      provider.resolve<ClearCartUseCase>(InfrastructureTokens.ClearCartUseCase),
      provider.resolve<CalculateCartTotalUseCase>(
        InfrastructureTokens.CalculateCartTotalUseCase,
      ),
      provider.resolve<ValidateCartUseCase>(InfrastructureTokens.ValidateCartUseCase),
    ),
  );
}
