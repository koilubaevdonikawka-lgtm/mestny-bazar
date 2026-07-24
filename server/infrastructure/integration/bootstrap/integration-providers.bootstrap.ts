import type { ConfigurationProvider } from "@server/infrastructure/configuration";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import {
  AIProviderAdapter,
  FinikPaymentAdapter,
  NoopEmailProvider,
  NoopMapProvider,
  NoopSearchProvider,
  NoopSmsProvider,
  ProviderCapability,
  ProviderIds,
  ProviderRegistry,
  SupabaseStorageAdapter,
  TelegramNotificationAdapter,
  createProviderConfiguration,
  createProviderDescriptor,
  createProviderHealth,
} from "@server/platform/integration/integration";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";

function resolvePaymentVendor(configuration: ConfigurationProvider): string {
  return configuration.get("paymentProvider") === "finik" ? "finik" : "noop";
}

function resolveNotificationVendor(configuration: ConfigurationProvider): string {
  return configuration.get("notificationProvider") === "telegram" ? "telegram" : "noop";
}

function resolveStorageVendor(configuration: ConfigurationProvider): string {
  const driver = configuration.get("storageProvider");
  if (driver === "supabase") {
    return "supabase";
  }
  if (driver === "local") {
    return "local";
  }
  return "noop";
}

/** Registers concrete provider adapters in the integration registry. */
export function activateIntegrationProviders(provider: ServiceProvider): void {
  const registry = provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry);
  const configuration = provider.resolve<ConfigurationProvider>(InfrastructureTokens.Configuration);

  const paymentAdapter = provider.resolve<FinikPaymentAdapter>(
    IntegrationTokens.FinikPaymentAdapter,
  );
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.Payment,
      name: "Primary Payment Provider",
      capability: ProviderCapability.Payment,
      vendor: resolvePaymentVendor(configuration),
    }),
    paymentAdapter,
    {
      configuration: createProviderConfiguration({
        providerId: ProviderIds.Payment,
        capability: ProviderCapability.Payment,
      }),
      healthCheck: async () =>
        createProviderHealth({
          providerId: ProviderIds.Payment,
          status: "healthy",
        }),
    },
  );

  const notificationAdapter = provider.resolve<TelegramNotificationAdapter>(
    IntegrationTokens.TelegramNotificationAdapter,
  );
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.Notification,
      name: "Primary Notification Provider",
      capability: ProviderCapability.Notification,
      vendor: resolveNotificationVendor(configuration),
    }),
    notificationAdapter,
    {
      configuration: createProviderConfiguration({
        providerId: ProviderIds.Notification,
        capability: ProviderCapability.Notification,
      }),
      healthCheck: async () =>
        createProviderHealth({
          providerId: ProviderIds.Notification,
          status: "healthy",
        }),
    },
  );

  const storageAdapter = provider.resolve<SupabaseStorageAdapter>(
    IntegrationTokens.SupabaseStorageAdapter,
  );
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.Storage,
      name: "Primary Storage Provider",
      capability: ProviderCapability.Storage,
      vendor: resolveStorageVendor(configuration),
    }),
    storageAdapter,
    {
      configuration: createProviderConfiguration({
        providerId: ProviderIds.Storage,
        capability: ProviderCapability.Storage,
      }),
      healthCheck: async () =>
        createProviderHealth({
          providerId: ProviderIds.Storage,
          status: "healthy",
        }),
    },
  );

  const aiAdapter = provider.resolve<AIProviderAdapter>(IntegrationTokens.AIProviderAdapter);
  const aiDelegate = provider.resolve<IAIProvider>(InfrastructureTokens.AIProvider);
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.AI,
      name: "Primary AI Provider",
      capability: ProviderCapability.AI,
      vendor: aiDelegate.providerId,
    }),
    aiAdapter,
    {
      configuration: createProviderConfiguration({
        providerId: ProviderIds.AI,
        capability: ProviderCapability.AI,
        settings: Object.freeze({ providerId: aiDelegate.providerId }),
      }),
      healthCheck: async () =>
        createProviderHealth({
          providerId: ProviderIds.AI,
          status: "healthy",
        }),
    },
  );

  const mapProvider = new NoopMapProvider();
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.Map,
      name: "Primary Map Provider",
      capability: ProviderCapability.Map,
      vendor: "noop",
      enabled: false,
    }),
    mapProvider,
  );

  const searchProvider = new NoopSearchProvider();
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.Search,
      name: "Primary Search Provider",
      capability: ProviderCapability.Search,
      vendor: "noop",
    }),
    searchProvider,
  );

  const emailProvider = new NoopEmailProvider();
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.Email,
      name: "Primary Email Provider",
      capability: ProviderCapability.Email,
      vendor: "noop",
      enabled: false,
    }),
    emailProvider,
  );

  const smsProvider = new NoopSmsProvider();
  registry.register(
    createProviderDescriptor({
      id: ProviderIds.SMS,
      name: "Primary SMS Provider",
      capability: ProviderCapability.SMS,
      vendor: "noop",
      enabled: false,
    }),
    smsProvider,
  );
}
