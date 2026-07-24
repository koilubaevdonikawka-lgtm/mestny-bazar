import { BootstrapTokens } from "@server/bootstrap/tokens";
import { StartupValidator } from "@server/bootstrap/startup-validator";
import type { ApiServer } from "@server/api/server/api-server";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { ConfigurationProvider } from "@server/infrastructure/configuration";
import {
  ApplicationLifecycle,
  ConfigurationService,
  DiagnosticsService,
  EnvironmentSecretProvider,
  HealthService,
  LivenessService,
  ReadinessService,
  RuntimeTokens,
} from "@server/platform/runtime/runtime";

/** Registers production readiness runtime platform services. */
export function registerRuntimePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(RuntimeTokens.SecretProvider, () => new EnvironmentSecretProvider());

  registry.registerSingleton(RuntimeTokens.ConfigurationService, (provider) =>
    new ConfigurationService(
      provider.resolve<ConfigurationProvider>(InfrastructureTokens.Configuration),
      provider.resolve(RuntimeTokens.SecretProvider),
    ),
  );

  registry.registerSingleton(RuntimeTokens.HealthService, (provider) => new HealthService(provider));

  registry.registerSingleton(RuntimeTokens.ReadinessService, (provider) =>
    new ReadinessService(provider, provider.resolve(RuntimeTokens.HealthService)),
  );

  registry.registerSingleton(RuntimeTokens.LivenessService, () => new LivenessService());

  registry.registerSingleton(RuntimeTokens.DiagnosticsService, (provider) =>
    new DiagnosticsService(
      provider,
      registry,
      provider.resolve(RuntimeTokens.ConfigurationService),
    ),
  );

  registry.registerSingleton(
    RuntimeTokens.StartupValidator,
    () => new StartupValidator(registry),
  );

  registry.registerSingleton(RuntimeTokens.ApplicationLifecycle, (provider) =>
    new ApplicationLifecycle(
      provider.resolve<ApiServer>(BootstrapTokens.ApiServer),
      provider.resolve(RuntimeTokens.StartupValidator),
    ),
  );
}
