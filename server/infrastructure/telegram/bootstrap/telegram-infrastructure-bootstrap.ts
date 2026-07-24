import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type {
  ConfigurationProvider,
  MarketplaceConfiguration,
  TelegramConnectionSettings,
} from "@server/infrastructure/configuration";
import { TelegramClientProvider } from "@server/infrastructure/telegram/client";
import { TelegramConfiguration } from "@server/infrastructure/telegram/configuration";
import { TelegramHealthCheck } from "@server/infrastructure/telegram/health";
import { TelegramNotificationProvider } from "@server/infrastructure/telegram/notifications";

export interface TelegramInfrastructureBootstrapConfig {
  telegram?: Partial<TelegramConnectionSettings>;
}

/** Resolves Telegram settings from marketplace configuration or environment. */
export function resolveTelegramConfiguration(
  configuration: ConfigurationProvider,
  overrides: TelegramInfrastructureBootstrapConfig = {},
): TelegramConfiguration {
  const snapshot = configuration.snapshot();
  if (snapshot.telegram) {
    return TelegramConfiguration.create({
      ...snapshot.telegram,
      ...overrides.telegram,
    });
  }

  return TelegramConfiguration.fromEnvironment(overrides.telegram ?? {});
}

/** Registers Telegram-backed notification infrastructure via existing DI tokens. */
export function registerTelegramInfrastructure(
  registry: ServiceRegistry,
  config: TelegramInfrastructureBootstrapConfig = {},
): void {
  registry.registerSingleton(InfrastructureTokens.TelegramConfiguration, (provider) =>
    resolveTelegramConfiguration(provider.resolve(InfrastructureTokens.Configuration), config),
  );

  registry.registerSingleton(
    InfrastructureTokens.TelegramClientProvider,
    (provider) =>
      new TelegramClientProvider(
        provider.resolve(InfrastructureTokens.TelegramConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.NotificationProvider,
    (provider) =>
      new TelegramNotificationProvider(
        provider.resolve(InfrastructureTokens.TelegramClientProvider),
        provider.resolve(InfrastructureTokens.TelegramConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.TelegramHealthCheck,
    (provider) =>
      new TelegramHealthCheck(provider.resolve(InfrastructureTokens.TelegramClientProvider)),
  );
}

/** Applies Telegram settings to a marketplace configuration object. */
export function withTelegramNotifications(
  config: Partial<MarketplaceConfiguration>,
  telegramOverrides: Partial<TelegramConnectionSettings> = {},
): Partial<MarketplaceConfiguration> {
  const telegram = TelegramConfiguration.fromEnvironment(telegramOverrides).toConnectionSettings();
  return {
    ...config,
    notificationProvider: "telegram",
    telegram,
  };
}
