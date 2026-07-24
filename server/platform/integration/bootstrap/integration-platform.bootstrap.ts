import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import {
  AIProviderAdapter,
  FinikPaymentAdapter,
  ProviderRegistry,
  SupabaseStorageAdapter,
  TelegramNotificationAdapter,
  type IAIProviderAdapter,
  type IEmailProvider,
  type IMapProvider,
  type INotificationProvider,
  type IPaymentProvider,
  type ISearchProvider,
  type ISmsProvider,
  type IStorageProvider,
  ProviderIds,
} from "@server/platform/integration/integration";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { IPaymentProvider as InfrastructurePaymentProvider } from "@server/infrastructure/payments";
import type { INotificationProvider as InfrastructureNotificationProvider } from "@server/infrastructure/notifications";
import type { IStorageProvider as InfrastructureStorageProvider } from "@server/infrastructure/storage/files";
import type { IAIProvider } from "@server/platform/ai/ai/contracts";

function registerContractResolver<T>(
  registry: ServiceRegistry,
  token: symbol,
  providerId: string,
): void {
  registry.registerSingleton(token, (provider) => {
    const providerRegistry = provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry);
    const resolved = providerRegistry.get<T>(providerId);
    if (!resolved) {
      throw new Error(`Integration provider "${providerId}" is not registered.`);
    }
    return resolved;
  });
}

/** Registers the integration platform registry and contract resolvers. */
export function registerIntegrationPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(IntegrationTokens.ProviderRegistry, () => new ProviderRegistry());

  registry.registerSingleton(
    IntegrationTokens.FinikPaymentAdapter,
    (provider) =>
      new FinikPaymentAdapter(
        provider.resolve<InfrastructurePaymentProvider>(InfrastructureTokens.PaymentProvider),
      ),
  );
  registry.registerSingleton(
    IntegrationTokens.TelegramNotificationAdapter,
    (provider) =>
      new TelegramNotificationAdapter(
        provider.resolve<InfrastructureNotificationProvider>(
          InfrastructureTokens.NotificationProvider,
        ),
      ),
  );
  registry.registerSingleton(
    IntegrationTokens.SupabaseStorageAdapter,
    (provider) =>
      new SupabaseStorageAdapter(
        provider.resolve<InfrastructureStorageProvider>(InfrastructureTokens.StorageProvider),
      ),
  );
  registry.registerSingleton(IntegrationTokens.AIProviderAdapter, (provider) => {
    const aiProvider = provider.resolve<IAIProvider>(InfrastructureTokens.AIProvider);
    return new AIProviderAdapter(aiProvider);
  });

  registerContractResolver<IPaymentProvider>(
    registry,
    IntegrationTokens.PaymentProvider,
    ProviderIds.Payment,
  );
  registerContractResolver<INotificationProvider>(
    registry,
    IntegrationTokens.NotificationProvider,
    ProviderIds.Notification,
  );
  registerContractResolver<IStorageProvider>(
    registry,
    IntegrationTokens.StorageProvider,
    ProviderIds.Storage,
  );
  registerContractResolver<IAIProviderAdapter>(
    registry,
    IntegrationTokens.AIProvider,
    ProviderIds.AI,
  );
  registerContractResolver<IMapProvider>(registry, IntegrationTokens.MapProvider, ProviderIds.Map);
  registerContractResolver<ISearchProvider>(
    registry,
    IntegrationTokens.SearchProvider,
    ProviderIds.Search,
  );
  registerContractResolver<IEmailProvider>(
    registry,
    IntegrationTokens.EmailProvider,
    ProviderIds.Email,
  );
  registerContractResolver<ISmsProvider>(registry, IntegrationTokens.SmsProvider, ProviderIds.SMS);
}
