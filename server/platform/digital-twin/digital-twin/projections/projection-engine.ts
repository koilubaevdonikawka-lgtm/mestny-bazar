import type { IProjectionEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISnapshotEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import {
  createProjectionResult,
  type ProjectionKind,
  type ProjectionResult,
} from "@server/platform/digital-twin/digital-twin/models";
import { createProjectionGeneratedEvent } from "@server/platform/digital-twin/digital-twin/events";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";

/** Projects future platform states from snapshot metadata. */
export class ProjectionEngine implements IProjectionEngine {
  constructor(
    private readonly snapshotEngine: ISnapshotEngine,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
  ) {}

  generate(snapshotId: string, kind: ProjectionKind): ProjectionResult {
    const snapshot = this.snapshotEngine.load(snapshotId);
    const projections = snapshot ? this.buildProjections(kind, snapshot.payload) : ["Snapshot not found"];
    const result = createProjectionResult({
      kind,
      baseSnapshotId: snapshotId,
      projections,
      metadata: Object.freeze({ projected: true }),
    });
    createProjectionGeneratedEvent(result);
    return result;
  }

  private buildProjections(
    kind: ProjectionKind,
    payload: Readonly<Record<string, unknown>>,
  ): readonly string[] {
    switch (kind) {
      case "future-state":
        return Object.freeze([
          "Projected future platform topology",
          `Base payload keys: ${Object.keys(payload).join(", ")}`,
        ]);
      case "impact":
        return Object.freeze([
          "Projected impact on dependent components",
          `Capability count baseline: ${this.capabilityPlatform.listCapabilities().length}`,
        ]);
      case "dependency":
        return Object.freeze([
          `Projected dependency graph size: ${this.knowledgePlatform.generateGraph().relationCount}`,
        ]);
      case "version":
        return Object.freeze([
          "Projected version rollout sequence",
          ...this.capabilityPlatform.listCapabilities().slice(0, 3).map(
            (capability) => `Version path: ${capability.name}@${capability.version}`,
          ),
        ]);
      default:
        return Object.freeze([]);
    }
  }
}
