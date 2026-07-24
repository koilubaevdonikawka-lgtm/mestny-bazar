import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createDigitalTwin,
  DigitalTwinTokens,
  type DigitalTwinPlatform,
  type DigitalTwinRegistry,
} from "@server/platform/digital-twin/digital-twin";

/** Activates digital twin platform metadata and default twin catalog. */
export function activateDigitalTwinPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-digital-twin",
      name: "Digital Twin Platform",
      path: "server/platform/digital-twin",
      components: [
        "DigitalTwinPlatform",
        "DigitalTwinManager",
        "DigitalTwinRegistry",
        "SnapshotEngine",
        "SimulationEngine",
        "SynchronizationEngine",
        "ProjectionEngine",
        "SnapshotComparisonEngine",
      ],
      dependencies: [
        "platform-knowledge",
        "platform-capabilities",
        "platform-lifecycle",
        "platform-documentation",
        "platform-runtime",
        "platform-integration",
      ],
    }),
  });

  const digitalTwinPlatform = provider.resolve<DigitalTwinPlatform>(
    DigitalTwinTokens.DigitalTwinPlatform,
  );
  const twinRegistry = provider.resolve<DigitalTwinRegistry>(
    DigitalTwinTokens.DigitalTwinRegistry,
  );

  twinRegistry.register(
    createDigitalTwin({
      id: "twin-platform-core",
      name: "Platform Core Twin",
      kind: "platform",
      sourceId: "platform-digital-twin",
      description: "Digital twin of the platform core",
    }),
  );

  const snapshots = digitalTwinPlatform.synchronize();
  if (snapshots.length > 0) {
    digitalTwinPlatform.simulate(snapshots[0].id, "architecture");
    digitalTwinPlatform.generateProjection(snapshots[0].id, "future-state");
  }
}
