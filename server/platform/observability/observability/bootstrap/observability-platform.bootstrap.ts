import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GatewayTokens } from "@server/platform/gateway/gateway/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { SDKTokens } from "@server/platform/sdk/sdk/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { SDKPlatform } from "@server/platform/sdk/sdk/sdk-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IHealthService, IDiagnosticsService } from "@server/platform/runtime/runtime/contracts";
import {
  CorrelationManager,
  LoggingRegistry,
  MetricsCollector,
  ObservabilityManager,
  ObservabilityPlatform,
  ObservabilityTokens,
  SamplingPolicyEngine,
  TelemetryRegistry,
  TracingEngine,
} from "@server/platform/observability/observability";

/** Registers observability platform services in the DI container. */
export function registerObservabilityPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(ObservabilityTokens.TelemetryRegistry, () => new TelemetryRegistry());
  registry.registerSingleton(ObservabilityTokens.SamplingPolicyEngine, () => new SamplingPolicyEngine());
  registry.registerSingleton(ObservabilityTokens.LoggingRegistry, () => new LoggingRegistry());
  registry.registerSingleton(ObservabilityTokens.CorrelationManager, () => new CorrelationManager());

  registry.registerSingleton(
    ObservabilityTokens.TracingEngine,
    (provider) =>
      new TracingEngine(provider.resolve(ObservabilityTokens.SamplingPolicyEngine)),
  );

  registry.registerSingleton(
    ObservabilityTokens.MetricsCollector,
    (provider) =>
      new MetricsCollector(
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
        provider.resolve<IDiagnosticsService>(RuntimeTokens.DiagnosticsService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<GatewayPlatform>(GatewayTokens.GatewayPlatform),
        provider.resolve<SDKPlatform>(SDKTokens.SDKPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    ObservabilityTokens.ObservabilityManager,
    (provider) =>
      new ObservabilityManager(
        provider.resolve(ObservabilityTokens.MetricsCollector),
        provider.resolve(ObservabilityTokens.TracingEngine),
        provider.resolve(ObservabilityTokens.CorrelationManager),
        provider.resolve(ObservabilityTokens.LoggingRegistry),
      ),
  );

  registry.registerSingleton(ObservabilityTokens.ObservabilityPlatform, (provider) =>
    new ObservabilityPlatform(provider.resolve(ObservabilityTokens.ObservabilityManager)),
  );
}
