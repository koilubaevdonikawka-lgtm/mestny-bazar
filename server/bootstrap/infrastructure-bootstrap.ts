import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import {
  ConfigurationProvider,
  type MarketplaceConfiguration,
  type NotificationProviderDriver,
  type PaymentProviderDriver,
  type PersistenceDriver,
  type StorageProviderDriver,
} from "@server/infrastructure/configuration";
import { registerFinikInfrastructure } from "@server/infrastructure/finik/bootstrap";
import { NoopPaymentProvider } from "@server/infrastructure/payments";
import type { FinikWebhookHandler } from "@server/infrastructure/finik/webhooks";
import { registerTelegramInfrastructure } from "@server/infrastructure/telegram/bootstrap";
import { NoopNotificationProvider } from "@server/infrastructure/notifications";
import { registerStorageInfrastructure } from "@server/infrastructure/storage/bootstrap";
import { NoopStorageProvider } from "@server/infrastructure/storage/files";
import { registerMarketplaceInfrastructure } from "@server/infrastructure/marketplace/bootstrap";
import { SystemClock } from "@server/infrastructure/clock";
import { InMemoryEventBus } from "@server/infrastructure/event-bus";
import { UuidGenerator } from "@server/infrastructure/id-generator";
import { ConsoleLogger, StructuredLogger } from "@server/infrastructure/logging";
import {
  InMemoryCatalogRepository,
  InMemoryCategoryRepository,
  InMemoryOrderRepository,
  InMemoryProductRepository,
  InMemorySellerRepository,
} from "@server/infrastructure/repositories";
import { registerSupabaseInfrastructure } from "@server/infrastructure/supabase/bootstrap";
import {
  DefaultTransactionManager,
  DefaultUnitOfWork,
} from "@server/infrastructure/transactions";

export type InfrastructureBootstrapConfig = Partial<MarketplaceConfiguration>;

function registerInMemoryPersistence(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.EventBus, () => new InMemoryEventBus());
  registry.registerSingleton(InfrastructureTokens.UnitOfWork, () => new DefaultUnitOfWork());
  registry.registerSingleton(
    InfrastructureTokens.TransactionManager,
    (provider) => new DefaultTransactionManager(provider.resolve(InfrastructureTokens.UnitOfWork)),
  );

  registry.registerSingleton(
    InfrastructureTokens.ProductRepository,
    () => new InMemoryProductRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.SellerRepository,
    () => new InMemorySellerRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.CatalogRepository,
    () => new InMemoryCatalogRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.CategoryRepository,
    () => new InMemoryCategoryRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.OrderRepository,
    () => new InMemoryOrderRepository(),
  );
}

function resolvePersistenceDriver(config: InfrastructureBootstrapConfig): PersistenceDriver {
  return config.persistence ?? "memory";
}

function resolvePaymentProviderDriver(
  config: InfrastructureBootstrapConfig,
): PaymentProviderDriver {
  return config.paymentProvider ?? "noop";
}

function registerPaymentInfrastructure(
  registry: ServiceRegistry,
  config: InfrastructureBootstrapConfig,
): void {
  if (resolvePaymentProviderDriver(config) === "finik") {
    registerFinikInfrastructure(registry, { finik: config.finik });
    return;
  }

  registry.registerSingleton(
    InfrastructureTokens.PaymentProvider,
    () => new NoopPaymentProvider(),
  );

  registry.registerSingleton(
    InfrastructureTokens.FinikWebhookHandler,
    () =>
      ({
        parsePayload: (rawBody: string) => JSON.parse(rawBody),
        handle: () => Object.freeze({ verified: false, events: Object.freeze([]) }),
        handleAndPublish: async () =>
          Object.freeze({ verified: false, events: Object.freeze([]) }),
      }) satisfies Pick<FinikWebhookHandler, "parsePayload" | "handle" | "handleAndPublish"> as FinikWebhookHandler,
  );
}

function resolveNotificationProviderDriver(
  config: InfrastructureBootstrapConfig,
): NotificationProviderDriver {
  return config.notificationProvider ?? "noop";
}

function registerNotificationInfrastructure(
  registry: ServiceRegistry,
  config: InfrastructureBootstrapConfig,
): void {
  if (resolveNotificationProviderDriver(config) === "telegram") {
    registerTelegramInfrastructure(registry, { telegram: config.telegram });
    return;
  }

  registry.registerSingleton(
    InfrastructureTokens.NotificationProvider,
    () => new NoopNotificationProvider(),
  );
}

function resolveStorageProviderDriver(
  config: InfrastructureBootstrapConfig,
): StorageProviderDriver {
  return config.storageProvider ?? "noop";
}

function registerStorageInfrastructureServices(
  registry: ServiceRegistry,
  config: InfrastructureBootstrapConfig,
): void {
  const driver = resolveStorageProviderDriver(config);
  if (driver === "noop") {
    registry.registerSingleton(
      InfrastructureTokens.StorageProvider,
      () => new NoopStorageProvider(),
    );
    return;
  }

  registerStorageInfrastructure(registry, {
    storage: {
      ...config.storage,
      provider: driver,
    },
  });
}

/** Registers infrastructure adapters and platform services. */
export function registerInfrastructure(
  registry: ServiceRegistry,
  config: InfrastructureBootstrapConfig = {},
): void {
  registry.registerSingleton(InfrastructureTokens.Configuration, () =>
    new ConfigurationProvider(config),
  );

  registry.registerSingleton(InfrastructureTokens.Logger, () =>
    new StructuredLogger(new ConsoleLogger("marketplace"), {
      layer: "infrastructure",
    }),
  );

  registry.registerSingleton(InfrastructureTokens.Clock, () => new SystemClock());
  registry.registerSingleton(InfrastructureTokens.IdGenerator, () => new UuidGenerator());

  if (resolvePersistenceDriver(config) === "supabase") {
    registerSupabaseInfrastructure(registry, { supabase: config.supabase });
    registerMarketplaceInfrastructure(registry, { persistence: "supabase" });
  } else {
    registerInMemoryPersistence(registry);
    registerMarketplaceInfrastructure(registry, { persistence: "memory" });
  }

  registerPaymentInfrastructure(registry, config);
  registerNotificationInfrastructure(registry, config);
  registerStorageInfrastructureServices(registry, config);
}
