import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { PersistenceDriver } from "@server/infrastructure/configuration";
import {
  MemoryCartStore,
  SupabaseCartStore,
} from "@server/infrastructure/marketplace/cart";
import {
  MemoryFavoritesStore,
  SupabaseFavoritesStore,
} from "@server/infrastructure/marketplace/favorites";
import {
  MemoryReviewStore,
  SupabaseReviewStore,
} from "@server/infrastructure/marketplace/reviews";
import {
  MemorySearchCatalogProvider,
  SupabaseSearchCatalogProvider,
} from "@server/infrastructure/marketplace/search";
import { MemoryOrderTimelineStore } from "@server/infrastructure/marketplace/order-lifecycle";
import {
  MemoryOrderStore,
  SupabaseOrderStore,
} from "@server/infrastructure/marketplace/order";
import {
  MemoryPaymentStore,
  ProviderPaymentGateway,
  SupabasePaymentStore,
} from "@server/infrastructure/marketplace/payment";
import {
  MemoryProductStore,
  SupabaseProductStore,
} from "@server/infrastructure/marketplace/product";
import {
  MemoryInventoryStore,
  SupabaseInventoryStore,
} from "@server/infrastructure/marketplace/inventory";
import { ProviderNotificationProvider } from "@server/infrastructure/marketplace/notification";
import {
  MemoryWarehouseStore,
  SupabaseWarehouseStore,
} from "@server/infrastructure/marketplace/warehouse";
import {
  MemoryCourierStore,
  SupabaseCourierStore,
} from "@server/infrastructure/marketplace/courier";
import {
  MemoryCustomerStore,
  SupabaseCustomerStore,
} from "@server/infrastructure/marketplace/customer";
import {
  MemorySellerStore,
  SupabaseSellerStore,
} from "@server/infrastructure/marketplace/seller";
import {
  MemoryCatalogStore,
  SupabaseCatalogStore,
} from "@server/infrastructure/marketplace/catalog";
import {
  MemoryPricingStore,
  SupabasePricingStore,
} from "@server/infrastructure/marketplace/pricing";
import {
  MemoryMarketplaceStore,
  SupabaseMarketplaceStore,
} from "@server/infrastructure/marketplace/marketplace";
import {
  MemoryModerationStore,
  SupabaseModerationStore,
} from "@server/infrastructure/marketplace/moderation";
import {
  MemorySupportStore,
  SupabaseSupportStore,
} from "@server/infrastructure/marketplace/support";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import {
  resolveInfrastructureNotificationProvider,
  resolveInfrastructurePaymentProvider,
} from "@server/infrastructure/integration";
import {
  registerAnalyticsInfrastructure,
  registerSupabaseAnalyticsInfrastructure,
} from "@server/infrastructure/analytics/bootstrap/analytics-infrastructure.bootstrap";
import {
  MemoryAdministrationStore,
  SupabaseAdministrationStore,
} from "@server/infrastructure/marketplace/administration";

export interface MarketplaceInfrastructureBootstrapConfig {
  persistence?: PersistenceDriver;
}

function registerInMemoryMarketplaceStores(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CartStore, () => new MemoryCartStore());
  registry.registerSingleton(
    InfrastructureTokens.FavoritesStore,
    () => new MemoryFavoritesStore(),
  );
  registry.registerSingleton(InfrastructureTokens.ReviewStore, () => new MemoryReviewStore());
  registry.registerSingleton(
    InfrastructureTokens.SearchCatalogProvider,
    () => new MemorySearchCatalogProvider(),
  );
  registry.registerSingleton(InfrastructureTokens.OrderStore, () => new MemoryOrderStore());
  registry.registerSingleton(
    InfrastructureTokens.OrderTimelineStore,
    () => new MemoryOrderTimelineStore(),
  );
  registry.registerSingleton(InfrastructureTokens.PaymentStore, () => new MemoryPaymentStore());
  registry.registerSingleton(InfrastructureTokens.ProductStore, () => new MemoryProductStore());
  registry.registerSingleton(InfrastructureTokens.InventoryStore, () => new MemoryInventoryStore());
  registry.registerSingleton(
    InfrastructureTokens.PaymentGateway,
    (provider) =>
      new ProviderPaymentGateway(resolveInfrastructurePaymentProvider(provider)),
  );
  registry.registerSingleton(
    InfrastructureTokens.NotificationModuleProvider,
    (provider) =>
      new ProviderNotificationProvider(resolveInfrastructureNotificationProvider(provider)),
  );
  registry.registerSingleton(InfrastructureTokens.WarehouseStore, () => new MemoryWarehouseStore());
  registry.registerSingleton(InfrastructureTokens.CourierStore, () => new MemoryCourierStore());
  registry.registerSingleton(InfrastructureTokens.CustomerStore, () => new MemoryCustomerStore());
  registry.registerSingleton(InfrastructureTokens.SellerStore, () => new MemorySellerStore());
  registry.registerSingleton(InfrastructureTokens.CatalogStore, () => new MemoryCatalogStore());
  registry.registerSingleton(InfrastructureTokens.PricingStore, () => new MemoryPricingStore());
  registry.registerSingleton(
    InfrastructureTokens.MarketplaceStore,
    () => new MemoryMarketplaceStore(),
  );
  registry.registerSingleton(
    InfrastructureTokens.ModerationStore,
    () => new MemoryModerationStore(),
  );
  registry.registerSingleton(
    InfrastructureTokens.SupportStore,
    () => new MemorySupportStore(),
  );
  registerAnalyticsInfrastructure(registry);
  registry.registerSingleton(
    InfrastructureTokens.AdministrationStore,
    () => new MemoryAdministrationStore(),
  );
}

function registerSupabaseMarketplaceStores(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.CartStore,
    (provider) =>
      new SupabaseCartStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.FavoritesStore,
    (provider) =>
      new SupabaseFavoritesStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.ReviewStore,
    (provider) =>
      new SupabaseReviewStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.SearchCatalogProvider,
    (provider) =>
      new SupabaseSearchCatalogProvider(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.OrderStore,
    (provider) =>
      new SupabaseOrderStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.OrderTimelineStore,
    () => new MemoryOrderTimelineStore(),
  );

  registry.registerSingleton(
    InfrastructureTokens.PaymentStore,
    (provider) =>
      new SupabasePaymentStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.ProductStore,
    (provider) =>
      new SupabaseProductStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.InventoryStore,
    (provider) =>
      new SupabaseInventoryStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.PaymentGateway,
    (provider) =>
      new ProviderPaymentGateway(resolveInfrastructurePaymentProvider(provider)),
  );
  registry.registerSingleton(
    InfrastructureTokens.NotificationModuleProvider,
    (provider) =>
      new ProviderNotificationProvider(resolveInfrastructureNotificationProvider(provider)),
  );
  registry.registerSingleton(
    InfrastructureTokens.WarehouseStore,
    (provider) =>
      new SupabaseWarehouseStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.CourierStore,
    (provider) =>
      new SupabaseCourierStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.CustomerStore,
    (provider) =>
      new SupabaseCustomerStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.SellerStore,
    (provider) =>
      new SupabaseSellerStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.CatalogStore,
    (provider) =>
      new SupabaseCatalogStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.PricingStore,
    (provider) =>
      new SupabasePricingStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.MarketplaceStore,
    (provider) =>
      new SupabaseMarketplaceStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.ModerationStore,
    (provider) =>
      new SupabaseModerationStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registry.registerSingleton(
    InfrastructureTokens.SupportStore,
    (provider) =>
      new SupabaseSupportStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
  registerSupabaseAnalyticsInfrastructure(registry);
  registry.registerSingleton(
    InfrastructureTokens.AdministrationStore,
    (provider) =>
      new SupabaseAdministrationStore(
        provider.resolve<ISupabaseClientProvider>(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
}

/** Registers marketplace module persistence adapters via existing DI tokens. */
export function registerMarketplaceInfrastructure(
  registry: ServiceRegistry,
  config: MarketplaceInfrastructureBootstrapConfig = {},
): void {
  const persistence = config.persistence ?? "memory";
  if (persistence === "supabase") {
    registerSupabaseMarketplaceStores(registry);
    return;
  }

  registerInMemoryMarketplaceStores(registry);
}

export {
  MemoryCartStore,
  SupabaseCartStore,
  MemoryFavoritesStore,
  SupabaseFavoritesStore,
  MemoryReviewStore,
  SupabaseReviewStore,
  MemorySearchCatalogProvider,
  SupabaseSearchCatalogProvider,
  MemoryOrderStore,
  SupabaseOrderStore,
  MemoryPaymentStore,
  SupabasePaymentStore,
  ProviderPaymentGateway,
  MemoryProductStore,
  SupabaseProductStore,
  MemoryInventoryStore,
  SupabaseInventoryStore,
  ProviderNotificationProvider,
  MemoryWarehouseStore,
  SupabaseWarehouseStore,
  MemoryCourierStore,
  SupabaseCourierStore,
  MemoryCustomerStore,
  SupabaseCustomerStore,
  MemorySellerStore,
  SupabaseSellerStore,
  MemoryCatalogStore,
  SupabaseCatalogStore,
  MemoryPricingStore,
  SupabasePricingStore,
  MemoryMarketplaceStore,
  SupabaseMarketplaceStore,
  MemoryModerationStore,
  SupabaseModerationStore,
  MemorySupportStore,
  SupabaseSupportStore,
  MemoryAdministrationStore,
  SupabaseAdministrationStore,
};
