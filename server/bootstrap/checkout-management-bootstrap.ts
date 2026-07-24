import type { CartManagementApplicationService } from "@server/application/cart-management/services/cart-management-application.service";
import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { ICartCheckoutReader } from "@server/application/checkout-management/contracts/cart-checkout-reader.contract";
import type { ICatalogCheckoutReader } from "@server/application/checkout-management/contracts/catalog-checkout-reader.contract";
import type { ICheckoutEventPublisher } from "@server/application/checkout-management/contracts/checkout-event-publisher.contract";
import type { ICheckoutPricingProvider } from "@server/application/checkout-management/contracts/checkout-pricing-provider.contract";
import type { ICheckoutRepository } from "@server/application/checkout-management/contracts/checkout-repository.contract";
import type { ICheckoutValidationProvider } from "@server/application/checkout-management/contracts/checkout-validation-provider.contract";
import {
  CancelCheckoutUseCase,
  CheckoutManagementApplicationService,
  CheckoutManagementService,
  CreateCheckoutUseCase,
  GetCheckoutSummaryUseCase,
  RefreshCheckoutUseCase,
  ValidateCheckoutUseCase,
} from "@server/application/checkout-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CartCheckoutReaderAdapter } from "@server/infrastructure/checkout/cart-checkout-reader.adapter";
import { CatalogCheckoutReaderAdapter } from "@server/infrastructure/checkout/catalog-checkout-reader.adapter";
import { CheckoutRepository } from "@server/infrastructure/checkout/checkout.repository";
import { DefaultCheckoutPricingProvider } from "@server/infrastructure/checkout/default-checkout-pricing.provider";
import { DefaultCheckoutValidationProvider } from "@server/infrastructure/checkout/default-checkout-validation.provider";
import { NoopCheckoutEventPublisher } from "@server/infrastructure/checkout/noop-checkout-event.publisher";

/** Registers checkout management services and use cases. */
export function registerCheckoutManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CheckoutRepository, () => new CheckoutRepository());

  registry.registerSingleton(InfrastructureTokens.CartCheckoutReader, (provider) =>
    new CartCheckoutReaderAdapter(
      provider.resolve<CartManagementApplicationService>(
        InfrastructureTokens.CartManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CatalogCheckoutReader, (provider) =>
    new CatalogCheckoutReaderAdapter(
      provider.resolve<CatalogManagementApplicationService>(
        InfrastructureTokens.CatalogManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CheckoutPricingProvider, () =>
    new DefaultCheckoutPricingProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.CheckoutValidationProvider, (provider) =>
    new DefaultCheckoutValidationProvider(
      provider.resolve<ICatalogCheckoutReader>(InfrastructureTokens.CatalogCheckoutReader),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CheckoutEventPublisher, () =>
    new NoopCheckoutEventPublisher(),
  );

  registry.registerTransient(InfrastructureTokens.CheckoutManagementService, (provider) =>
    new CheckoutManagementService(
      provider.resolve<ICheckoutRepository>(InfrastructureTokens.CheckoutRepository),
      provider.resolve<ICartCheckoutReader>(InfrastructureTokens.CartCheckoutReader),
      provider.resolve<ICatalogCheckoutReader>(InfrastructureTokens.CatalogCheckoutReader),
      provider.resolve<ICheckoutPricingProvider>(InfrastructureTokens.CheckoutPricingProvider),
      provider.resolve<ICheckoutValidationProvider>(InfrastructureTokens.CheckoutValidationProvider),
      provider.resolve<ICheckoutEventPublisher>(InfrastructureTokens.CheckoutEventPublisher),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(InfrastructureTokens.CreateCheckoutUseCase, (provider) =>
    new CreateCheckoutUseCase(
      provider.resolve<CheckoutManagementService>(InfrastructureTokens.CheckoutManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ValidateCheckoutUseCase, (provider) =>
    new ValidateCheckoutUseCase(
      provider.resolve<CheckoutManagementService>(InfrastructureTokens.CheckoutManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetCheckoutSummaryUseCase, (provider) =>
    new GetCheckoutSummaryUseCase(
      provider.resolve<CheckoutManagementService>(InfrastructureTokens.CheckoutManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.RefreshCheckoutUseCase, (provider) =>
    new RefreshCheckoutUseCase(
      provider.resolve<CheckoutManagementService>(InfrastructureTokens.CheckoutManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CancelCheckoutUseCase, (provider) =>
    new CancelCheckoutUseCase(
      provider.resolve<CheckoutManagementService>(InfrastructureTokens.CheckoutManagementService),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.CheckoutManagementApplicationService,
    (provider) =>
      new CheckoutManagementApplicationService(
        provider.resolve<CreateCheckoutUseCase>(InfrastructureTokens.CreateCheckoutUseCase),
        provider.resolve<ValidateCheckoutUseCase>(InfrastructureTokens.ValidateCheckoutUseCase),
        provider.resolve<GetCheckoutSummaryUseCase>(
          InfrastructureTokens.GetCheckoutSummaryUseCase,
        ),
        provider.resolve<RefreshCheckoutUseCase>(InfrastructureTokens.RefreshCheckoutUseCase),
        provider.resolve<CancelCheckoutUseCase>(InfrastructureTokens.CancelCheckoutUseCase),
      ),
  );
}
