import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type {
  ConfigurationProvider,
  MarketplaceConfiguration,
  SupabaseConnectionSettings,
} from "@server/infrastructure/configuration";
import { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { SupabaseClientProvider } from "@server/infrastructure/supabase/client";
import { SupabaseEventPublisher } from "@server/infrastructure/supabase/event-bus";
import { SupabaseHealthCheck } from "@server/infrastructure/supabase/health";
import {
  SupabaseCatalogRepository,
  SupabaseCategoryRepository,
  SupabaseOrderRepository,
  SupabaseProductRepository,
  SupabaseSellerRepository,
} from "@server/infrastructure/supabase/repositories";
import { SupabaseTransactionManager } from "@server/infrastructure/supabase/transactions";
import { DefaultUnitOfWork } from "@server/infrastructure/transactions";

export interface SupabaseInfrastructureBootstrapConfig {
  supabase?: Partial<SupabaseConnectionSettings>;
}

/** Resolves Supabase settings from marketplace configuration or environment. */
export function resolveSupabaseConfiguration(
  configuration: ConfigurationProvider,
  overrides: SupabaseInfrastructureBootstrapConfig = {},
): SupabaseConfiguration {
  const snapshot = configuration.snapshot();
  if (snapshot.supabase) {
    return SupabaseConfiguration.create({
      ...snapshot.supabase,
      ...overrides.supabase,
    });
  }

  return SupabaseConfiguration.fromEnvironment(overrides.supabase ?? {});
}

/** Registers Supabase-backed infrastructure adapters via existing DI tokens. */
export function registerSupabaseInfrastructure(
  registry: ServiceRegistry,
  config: SupabaseInfrastructureBootstrapConfig = {},
): void {
  registry.registerSingleton(InfrastructureTokens.SupabaseConfiguration, (provider) =>
    resolveSupabaseConfiguration(provider.resolve(InfrastructureTokens.Configuration), config),
  );

  registry.registerSingleton(
    InfrastructureTokens.SupabaseClientProvider,
    (provider) =>
      new SupabaseClientProvider(
        provider.resolve<SupabaseConfiguration>(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(InfrastructureTokens.UnitOfWork, () => new DefaultUnitOfWork());

  registry.registerSingleton(
    InfrastructureTokens.TransactionManager,
    (provider) =>
      new SupabaseTransactionManager(provider.resolve(InfrastructureTokens.UnitOfWork)),
  );

  registry.registerSingleton(
    InfrastructureTokens.EventBus,
    (provider) =>
      new SupabaseEventPublisher(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.ProductRepository,
    (provider) =>
      new SupabaseProductRepository(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.SellerRepository,
    (provider) =>
      new SupabaseSellerRepository(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.CatalogRepository,
    (provider) =>
      new SupabaseCatalogRepository(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.CategoryRepository,
    (provider) =>
      new SupabaseCategoryRepository(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.OrderRepository,
    (provider) =>
      new SupabaseOrderRepository(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.SupabaseHealthCheck,
    (provider) =>
      new SupabaseHealthCheck(
        provider.resolve(InfrastructureTokens.SupabaseClientProvider),
        provider.resolve(InfrastructureTokens.SupabaseConfiguration),
      ),
  );
}

/** Applies Supabase settings to a marketplace configuration object. */
export function withSupabasePersistence(
  config: Partial<MarketplaceConfiguration>,
  supabaseOverrides: Partial<SupabaseConnectionSettings> = {},
): Partial<MarketplaceConfiguration> {
  const supabase = SupabaseConfiguration.fromEnvironment(supabaseOverrides).toConnectionSettings();
  return {
    ...config,
    persistence: "supabase",
    supabase,
  };
}
