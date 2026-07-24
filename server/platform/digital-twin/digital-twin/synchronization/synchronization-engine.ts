import type { ISynchronizationEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISnapshotEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { PlatformSnapshot } from "@server/platform/digital-twin/digital-twin/models";
import { createSynchronizationCompletedEvent } from "@server/platform/digital-twin/digital-twin/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Synchronizes digital twin snapshots from platform metadata. */
export class SynchronizationEngine implements ISynchronizationEngine {
  constructor(
    private readonly snapshotEngine: ISnapshotEngine,
    private readonly documentation: DocumentationPlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  synchronize(): readonly PlatformSnapshot[] {
    void this.documentation.generateDocumentation();
    void this.capabilityPlatform.generateCatalog();
    void this.knowledgePlatform.generateGraph();
    void this.providerRegistry.list();

    const snapshots = [
      this.snapshotEngine.capture("platform"),
      this.snapshotEngine.capture("capability"),
      this.snapshotEngine.capture("knowledge"),
      this.snapshotEngine.capture("configuration"),
    ];
    createSynchronizationCompletedEvent(snapshots);
    return Object.freeze([...snapshots]);
  }
}
