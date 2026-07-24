import type { IInspector } from "@server/platform/developer/developer/contracts";
import {
  createInspectionResult,
  type InspectionResult,
} from "@server/platform/developer/developer/models";
import { createInspectionCompletedEvent } from "@server/platform/developer/developer/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";

/** Inspects dependency graph integrity from documentation metadata. */
export class DependencyInspector implements IInspector {
  readonly id = "dependency-inspector";

  constructor(private readonly documentation: DocumentationPlatform) {}

  inspect(): InspectionResult {
    const bundle = this.documentation.generateDocumentation();
    const nodeIds = new Set(bundle.dependencyGraph.nodes.map((node) => node.id));
    const findings = bundle.dependencyGraph.edges
      .filter((edge) => !nodeIds.has(edge.to))
      .map((edge) => ({
        code: "MISSING_DEPENDENCY_TARGET",
        message: `Dependency target "${edge.to}" is not registered.`,
        target: edge.from,
      }));

    const result = createInspectionResult({
      inspectorId: this.id,
      passed: findings.length === 0,
      findings,
    });
    createInspectionCompletedEvent(result);
    return result;
  }
}
