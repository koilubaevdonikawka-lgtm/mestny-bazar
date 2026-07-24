import type { ISimulationEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISnapshotEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import {
  createSimulationResult,
  type SimulationKind,
  type SimulationResult,
} from "@server/platform/digital-twin/digital-twin/models";
import { createSimulationExecutedEvent } from "@server/platform/digital-twin/digital-twin/events";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { LifecyclePlatform } from "@server/platform/lifecycle/lifecycle/lifecycle-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";

/** Simulates platform changes without affecting the real system. */
export class SimulationEngine implements ISimulationEngine {
  constructor(
    private readonly snapshotEngine: ISnapshotEngine,
    private readonly documentation: DocumentationPlatform,
    private readonly capabilityPlatform: CapabilityPlatform,
    private readonly knowledgePlatform: KnowledgePlatform,
    private readonly lifecyclePlatform: LifecyclePlatform,
  ) {}

  simulate(snapshotId: string, kind: SimulationKind): SimulationResult {
    const snapshot = this.snapshotEngine.load(snapshotId);
    const findings = snapshot ? this.runSimulation(kind, snapshot.payload) : ["Snapshot not found"];
    const result = createSimulationResult({
      kind,
      snapshotId,
      success: Boolean(snapshot),
      findings,
      metadata: Object.freeze({ simulated: true, sideEffects: false }),
    });
    createSimulationExecutedEvent(result);
    return result;
  }

  private runSimulation(
    kind: SimulationKind,
    payload: Readonly<Record<string, unknown>>,
  ): readonly string[] {
    switch (kind) {
      case "architecture": {
        const documentation = this.documentation.generateDocumentation();
        return Object.freeze([
          `Simulated ${documentation.summary.platformCount} platform nodes`,
          `Simulated ${documentation.summary.moduleCount} module nodes`,
          `Simulated ${documentation.summary.dependencyCount} dependency edges`,
        ]);
      }
      case "dependency": {
        const graph = this.knowledgePlatform.generateGraph();
        return Object.freeze([
          `Simulated ${graph.relationCount} dependency relations`,
          `Snapshot payload keys: ${Object.keys(payload).join(", ")}`,
        ]);
      }
      case "capability": {
        const capabilities = this.capabilityPlatform.listCapabilities();
        return Object.freeze([
          `Simulated ${capabilities.length} capabilities`,
          ...capabilities.slice(0, 5).map((capability) => `Capability: ${capability.name}`),
        ]);
      }
      case "lifecycle": {
        const status = this.lifecyclePlatform.status();
        const summary =
          "total" in status
            ? `components=${status.total}, running=${status.running}`
            : `state=${status.state}`;
        return Object.freeze([`Simulated lifecycle: ${summary}`]);
      }
      default:
        return Object.freeze([]);
    }
  }
}
