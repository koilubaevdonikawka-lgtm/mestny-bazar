import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import {
  ProviderIds,
  ProviderRegistry,
  type INotificationProvider as PlatformNotificationProvider,
  type IPaymentProvider as PlatformPaymentProvider,
} from "@server/platform/integration/integration";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { IPaymentProvider as InfrastructurePaymentProvider } from "@server/infrastructure/payments";
import type { INotificationProvider as InfrastructureNotificationProvider } from "@server/infrastructure/notifications";
import type { IStorageProvider as InfrastructureStorageProvider } from "@server/infrastructure/storage/files";

function resolveFromRegistry<T>(provider: ServiceProvider, providerId: string): T | null {
  const registry = provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry);
  return registry.get<T>(providerId);
}

/** Resolves the infrastructure payment provider through the integration registry. */
export function resolveInfrastructurePaymentProvider(
  provider: ServiceProvider,
): InfrastructurePaymentProvider {
  const platformProvider = resolveFromRegistry<PlatformPaymentProvider>(
    provider,
    ProviderIds.Payment,
  );
  if (platformProvider) {
    return platformProvider as unknown as InfrastructurePaymentProvider;
  }

  return provider.resolve<InfrastructurePaymentProvider>(InfrastructureTokens.PaymentProvider);
}

/** Resolves the infrastructure notification provider through the integration registry. */
export function resolveInfrastructureNotificationProvider(
  provider: ServiceProvider,
): InfrastructureNotificationProvider {
  const platformProvider = resolveFromRegistry<PlatformNotificationProvider>(
    provider,
    ProviderIds.Notification,
  );
  if (platformProvider) {
    return platformProvider as unknown as InfrastructureNotificationProvider;
  }

  return provider.resolve<InfrastructureNotificationProvider>(
    InfrastructureTokens.NotificationProvider,
  );
}

/** Resolves the infrastructure storage provider through the integration registry. */
export function resolveInfrastructureStorageProvider(
  provider: ServiceProvider,
): InfrastructureStorageProvider {
  const platformProvider = resolveFromRegistry<InfrastructureStorageProvider>(
    provider,
    ProviderIds.Storage,
  );
  if (platformProvider) {
    return platformProvider;
  }

  return provider.resolve<InfrastructureStorageProvider>(InfrastructureTokens.StorageProvider);
}
