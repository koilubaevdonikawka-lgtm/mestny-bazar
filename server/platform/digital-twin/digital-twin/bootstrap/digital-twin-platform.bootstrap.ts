import { CapabilityTokens } from "@server/platform/capabilities/capabilities/tokens";
import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { KnowledgeTokens } from "@server/platform/knowledge/knowledge/tokens";
import { LifecycleTokens } from "@server/platform/lifecycle/lifecycle/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { LifecyclePlatform } from "@server/platform/lifecycle/lifecycle/lifecycle-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";
import {
  DigitalTwinManager,
  DigitalTwinPlatform,
  DigitalTwinRegistry,
  DigitalTwinTokens,
  ProjectionEngine,
  SimulationEngine,
  SnapshotComparisonEngine,
  SnapshotEngine,
  SynchronizationEngine,
} from "@server/platform/digital-twin/digital-twin";

/** Registers digital twin platform services in the DI container. */
export function registerDigitalTwinPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(DigitalTwinTokens.DigitalTwinRegistry, () => new DigitalTwinRegistry());

  registry.registerSingleton(
    DigitalTwinTokens.SnapshotEngine,
    (provider) =>
      new SnapshotEngine(
        provider.resolve(DigitalTwinTokens.DigitalTwinRegistry),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
      ),
  );

  registry.registerSingleton(
    DigitalTwinTokens.SimulationEngine,
    (provider) =>
      new SimulationEngine(
        provider.resolve(DigitalTwinTokens.SnapshotEngine),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<LifecyclePlatform>(LifecycleTokens.LifecyclePlatform),
      ),
  );

  registry.registerSingleton(
    DigitalTwinTokens.SynchronizationEngine,
    (provider) =>
      new SynchronizationEngine(
        provider.resolve(DigitalTwinTokens.SnapshotEngine),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    DigitalTwinTokens.ProjectionEngine,
    (provider) =>
      new ProjectionEngine(
        provider.resolve(DigitalTwinTokens.SnapshotEngine),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
      ),
  );

  registry.registerSingleton(
    DigitalTwinTokens.SnapshotComparisonEngine,
    (provider) =>
      new SnapshotComparisonEngine(provider.resolve(DigitalTwinTokens.SnapshotEngine)),
  );

  registry.registerSingleton(
    DigitalTwinTokens.DigitalTwinManager,
    (provider) =>
      new DigitalTwinManager(
        provider.resolve(DigitalTwinTokens.SnapshotEngine),
        provider.resolve(DigitalTwinTokens.SimulationEngine),
        provider.resolve(DigitalTwinTokens.SynchronizationEngine),
        provider.resolve(DigitalTwinTokens.ProjectionEngine),
        provider.resolve(DigitalTwinTokens.SnapshotComparisonEngine),
      ),
  );

  registry.registerSingleton(DigitalTwinTokens.DigitalTwinPlatform, (provider) =>
    new DigitalTwinPlatform(provider.resolve(DigitalTwinTokens.DigitalTwinManager)),
  );
}
