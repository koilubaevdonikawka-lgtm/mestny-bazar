import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type {
  ConfigurationProvider,
  MarketplaceConfiguration,
  StorageConnectionSettings,
} from "@server/infrastructure/configuration";
import { StorageClientProvider } from "@server/infrastructure/storage/client";
import { StorageConfiguration } from "@server/infrastructure/storage/configuration";
import { StorageFileProvider } from "@server/infrastructure/storage/files";
import { StorageHealthCheck } from "@server/infrastructure/storage/health";
import { ImageOptimizer, ImageProcessor } from "@server/infrastructure/storage/images";

export interface StorageInfrastructureBootstrapConfig {
  storage?: Partial<StorageConnectionSettings>;
}

/** Resolves storage settings from marketplace configuration or environment. */
export function resolveStorageConfiguration(
  configuration: ConfigurationProvider,
  overrides: StorageInfrastructureBootstrapConfig = {},
): StorageConfiguration {
  const snapshot = configuration.snapshot();
  if (snapshot.storage) {
    return StorageConfiguration.create({
      ...snapshot.storage,
      ...overrides.storage,
    });
  }

  return StorageConfiguration.fromEnvironment(overrides.storage ?? {});
}

/** Registers storage-backed infrastructure adapters via existing DI tokens. */
export function registerStorageInfrastructure(
  registry: ServiceRegistry,
  config: StorageInfrastructureBootstrapConfig = {},
): void {
  registry.registerSingleton(InfrastructureTokens.StorageConfiguration, (provider) =>
    resolveStorageConfiguration(provider.resolve(InfrastructureTokens.Configuration), config),
  );

  registry.registerSingleton(
    InfrastructureTokens.StorageClientProvider,
    (provider) =>
      new StorageClientProvider(
        provider.resolve(InfrastructureTokens.StorageConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.StorageProvider,
    (provider) =>
      new StorageFileProvider(
        provider.resolve(InfrastructureTokens.StorageClientProvider),
        provider.resolve(InfrastructureTokens.StorageConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.StorageHealthCheck,
    (provider) =>
      new StorageHealthCheck(provider.resolve(InfrastructureTokens.StorageClientProvider)),
  );

  registry.registerSingleton(InfrastructureTokens.ImageProcessor, (provider) =>
    new ImageProcessor(
      provider.resolve(InfrastructureTokens.StorageProvider),
      new ImageOptimizer(),
    ),
  );
}

/** Applies storage settings to a marketplace configuration object. */
export function withStorageProvider(
  config: Partial<MarketplaceConfiguration>,
  storageOverrides: Partial<StorageConnectionSettings> = {},
): Partial<MarketplaceConfiguration> {
  const provider =
    storageOverrides.provider ??
    (process.env.STORAGE_PROVIDER as StorageConnectionSettings["provider"] | undefined) ??
    "local";
  const storage = StorageConfiguration.fromEnvironment({
    ...storageOverrides,
    provider,
  }).toConnectionSettings();

  return {
    ...config,
    storageProvider: provider,
    storage,
  };
}
