import type { ISnapshotEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { IDigitalTwinRegistry } from "@server/platform/digital-twin/digital-twin/contracts";
import {
  createPlatformSnapshot,
  type PlatformSnapshot,
  type SnapshotKind,
} from "@server/platform/digital-twin/digital-twin/models";
import { createSnapshotCreatedEvent } from "@server/platform/digital-twin/digital-twin/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";

/** Captures immutable platform snapshots (metadata only). */
export class SnapshotEngine implements ISnapshotEngine {
  private readonly snapshots = new Map<string, PlatformSnapshot>();

  constructor(
    private readonly twinRegistry: IDigitalTwinRegistry,
    private readonly documentation: DocumentationPlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly configuration: IConfigurationProvider,
  ) {}

  capture(kind: SnapshotKind): PlatformSnapshot {
    const payload = this.buildPayload(kind);
    const snapshot = createPlatformSnapshot({
      kind,
      label: `${kind}-snapshot-${Date.now()}`,
      payload,
      twinIds: this.twinRegistry.list().map((twin) => twin.id),
      metadata: Object.freeze({ source: "snapshot-engine", readOnly: true }),
    });
    this.snapshots.set(snapshot.id, snapshot);
    createSnapshotCreatedEvent(snapshot);
    return snapshot;
  }

  load(snapshotId: string): PlatformSnapshot | undefined {
    return this.snapshots.get(snapshotId.trim());
  }

  list(kind?: SnapshotKind): readonly PlatformSnapshot[] {
    const values = [...this.snapshots.values()];
    const filtered = kind ? values.filter((snapshot) => snapshot.kind === kind) : values;
    return Object.freeze([...filtered]);
  }

  private buildPayload(kind: SnapshotKind): Readonly<Record<string, unknown>> {
    switch (kind) {
      case "platform": {
        const documentation = this.documentation.generateDocumentation();
        return Object.freeze({
          platformCount: documentation.summary.platformCount,
          moduleCount: documentation.summary.moduleCount,
          dependencyCount: documentation.summary.dependencyCount,
          platforms: documentation.platformCatalog.platforms.map((platform) => platform.id),
        });
      }
      case "capability": {
        const catalog = this.capabilityPlatform.generateCatalog();
        return Object.freeze({
          capabilityCount: catalog.entries.length,
          capabilities: catalog.entries.map((entry) => entry.capability.id),
        });
      }
      case "knowledge": {
        const graph = this.knowledgePlatform.generateGraph();
        return Object.freeze({
          nodeCount: graph.nodeCount,
          relationCount: graph.relationCount,
          nodes: graph.nodes.map((node) => node.id),
          relations: graph.relations.map((relation) => relation.id),
        });
      }
      case "configuration": {
        const snapshot = this.configuration.snapshot();
        return Object.freeze({
          loadedAt: snapshot.loadedAt,
          source: snapshot.source,
          keys: Object.keys(snapshot.values),
          values: snapshot.values,
        });
      }
      default:
        return Object.freeze({});
    }
  }
}
