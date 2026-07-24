import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type {
  ConfigurationProvider,
  FinikConnectionSettings,
  MarketplaceConfiguration,
} from "@server/infrastructure/configuration";
import { FinikClientProvider } from "@server/infrastructure/finik/client";
import { FinikConfiguration } from "@server/infrastructure/finik/configuration";
import { FinikHealthCheck } from "@server/infrastructure/finik/health";
import { FinikPaymentProvider } from "@server/infrastructure/finik/payments";
import { FinikWebhookHandler } from "@server/infrastructure/finik/webhooks";

export interface FinikInfrastructureBootstrapConfig {
  finik?: Partial<FinikConnectionSettings>;
}

/** Resolves Finik settings from marketplace configuration or environment. */
export function resolveFinikConfiguration(
  configuration: ConfigurationProvider,
  overrides: FinikInfrastructureBootstrapConfig = {},
): FinikConfiguration {
  const snapshot = configuration.snapshot();
  if (snapshot.finik) {
    return FinikConfiguration.create({
      ...snapshot.finik,
      ...overrides.finik,
    });
  }

  return FinikConfiguration.fromEnvironment(overrides.finik ?? {});
}

/** Registers Finik-backed payment infrastructure via existing DI tokens. */
export function registerFinikInfrastructure(
  registry: ServiceRegistry,
  config: FinikInfrastructureBootstrapConfig = {},
): void {
  registry.registerSingleton(InfrastructureTokens.FinikConfiguration, (provider) =>
    resolveFinikConfiguration(provider.resolve(InfrastructureTokens.Configuration), config),
  );

  registry.registerSingleton(
    InfrastructureTokens.FinikClientProvider,
    (provider) =>
      new FinikClientProvider(
        provider.resolve(InfrastructureTokens.FinikConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.PaymentProvider,
    (provider) =>
      new FinikPaymentProvider(
        provider.resolve(InfrastructureTokens.FinikClientProvider),
        provider.resolve(InfrastructureTokens.FinikConfiguration),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.FinikHealthCheck,
    (provider) =>
      new FinikHealthCheck(provider.resolve(InfrastructureTokens.FinikClientProvider)),
  );

  registry.registerSingleton(
    InfrastructureTokens.FinikWebhookHandler,
    (provider) =>
      new FinikWebhookHandler(
        provider.resolve(InfrastructureTokens.FinikConfiguration),
        provider.resolve(InfrastructureTokens.EventBus),
      ),
  );
}

/** Applies Finik settings to a marketplace configuration object. */
export function withFinikPayment(
  config: Partial<MarketplaceConfiguration>,
  finikOverrides: Partial<FinikConnectionSettings> = {},
): Partial<MarketplaceConfiguration> {
  const finik = FinikConfiguration.fromEnvironment(finikOverrides).toConnectionSettings();
  return {
    ...config,
    paymentProvider: "finik",
    finik,
  };
}
