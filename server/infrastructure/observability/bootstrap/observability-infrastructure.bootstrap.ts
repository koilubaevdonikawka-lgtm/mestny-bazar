import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createLogCategory,
  ObservabilityTokens,
  type LoggingRegistry,
  type MetricsCollector,
  type TelemetryRegistry,
} from "@server/platform/observability/observability";

/** Activates observability platform metadata and default telemetry registrations. */
export function activateObservabilityPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-observability",
      name: "Observability Platform",
      path: "server/platform/observability",
      components: [
        "ObservabilityPlatform",
        "ObservabilityManager",
        "TelemetryRegistry",
        "MetricsCollector",
        "TracingEngine",
        "LoggingRegistry",
        "CorrelationManager",
        "SamplingPolicyEngine",
      ],
      dependencies: [
        "platform-runtime",
        "platform-gateway",
        "platform-sdk",
        "platform-documentation",
        "platform-governance",
        "platform-integration",
      ],
    }),
  });

  const telemetryRegistry = provider.resolve<TelemetryRegistry>(
    ObservabilityTokens.TelemetryRegistry,
  );

  telemetryRegistry.registerMetric({ name: "platform.modules.count", source: "platform" });
  telemetryRegistry.registerMetric({ name: "provider.registry.count", source: "provider" });
  telemetryRegistry.registerMetric({ name: "runtime.health.integrated", source: "runtime" });
  telemetryRegistry.registerMetric({ name: "gateway.versions.count", source: "gateway" });
  telemetryRegistry.registerMetric({ name: "sdk.platform.integrated", source: "sdk" });
  telemetryRegistry.registerMetric({ name: "testing.documented.modules", source: "testing" });

  telemetryRegistry.registerTraceType({ name: "platform-request", description: "Platform request trace" });
  telemetryRegistry.registerTraceType({ name: "gateway-dispatch", description: "Gateway dispatch trace" });

  telemetryRegistry.registerLogCategory({ category: "telemetry-event", severity: "info" });
  telemetryRegistry.registerLogCategory({ category: "platform-metric", severity: "debug" });

  telemetryRegistry.registerCorrelationType({ type: "correlation-id" });
  telemetryRegistry.registerCorrelationType({ type: "request-id" });
  telemetryRegistry.registerCorrelationType({ type: "operation-id" });
  telemetryRegistry.registerCorrelationType({ type: "session-id" });

  telemetryRegistry.registerSource({ id: "observability-platform", platform: "platform-observability" });

  const loggingRegistry = provider.resolve<LoggingRegistry>(ObservabilityTokens.LoggingRegistry);
  loggingRegistry.registerCategory(createLogCategory("telemetry-event", "info", ["source", "name"]));
  loggingRegistry.registerCategory(createLogCategory("platform-metric", "debug", ["metric", "value"]));

  const metricsCollector = provider.resolve<MetricsCollector>(ObservabilityTokens.MetricsCollector);
  metricsCollector.collect();
}
