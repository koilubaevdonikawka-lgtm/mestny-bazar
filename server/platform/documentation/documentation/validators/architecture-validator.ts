import type { IArchitectureRegistry, IArchitectureValidator } from "@server/platform/documentation/documentation/contracts";
import type { ValidationResult, ValidationViolation } from "@server/platform/documentation/documentation/models";
import { ArchitectureLayer } from "@server/platform/documentation/documentation/models";
import { createValidationCompletedEvent } from "@server/platform/documentation/documentation/events";

const FORBIDDEN_EDGES: readonly { fromLayer: string; toLayer: string; code: string }[] =
  Object.freeze([
    {
      fromLayer: ArchitectureLayer.Application,
      toLayer: ArchitectureLayer.Infrastructure,
      code: "DEPENDENCY_RULE_VIOLATION",
    },
    {
      fromLayer: ArchitectureLayer.Application,
      toLayer: ArchitectureLayer.Integration,
      code: "HEXAGONAL_VIOLATION",
    },
    {
      fromLayer: ArchitectureLayer.Platform,
      toLayer: ArchitectureLayer.Application,
      code: "PLATFORM_BOUNDARY_VIOLATION",
    },
  ]);

/** Validates registered architecture against platform rules. */
export class ArchitectureValidator implements IArchitectureValidator {
  constructor(private readonly registry: IArchitectureRegistry) {}

  validate(): ValidationResult {
    const violations: ValidationViolation[] = [
      ...this.validateForbiddenDependencies(),
      ...this.validateCycles(),
      ...this.validateModuleApiCoverage(),
    ];

    const result: ValidationResult = Object.freeze({
      valid: violations.length === 0,
      completedAt: new Date().toISOString(),
      violations: Object.freeze(violations),
    });

    createValidationCompletedEvent({
      valid: result.valid,
      violationCount: violations.length,
    });

    return result;
  }

  private validateForbiddenDependencies(): ValidationViolation[] {
    const nodes = new Map(this.registry.listNodes().map((node) => [node.id, node]));
    const violations: ValidationViolation[] = [];

    for (const edge of this.registry.listDependencies()) {
      const from = nodes.get(edge.from);
      const to = nodes.get(edge.to);
      if (!from || !to) {
        continue;
      }

      for (const rule of FORBIDDEN_EDGES) {
        if (from.layer === rule.fromLayer && to.layer === rule.toLayer) {
          violations.push(
            Object.freeze({
              code: rule.code,
              message: `Forbidden dependency from ${from.id} (${from.layer}) to ${to.id} (${to.layer})`,
              sourceId: from.id,
              targetId: to.id,
            }),
          );
        }
      }

      if (from.kind === "business-capability-module" && to.kind === "business-capability-module") {
        violations.push(
          Object.freeze({
            code: "BCM_DIRECT_DEPENDENCY",
            message: `Business modules must communicate through Module API, not direct dependency: ${from.id} -> ${to.id}`,
            sourceId: from.id,
            targetId: to.id,
          }),
        );
      }
    }

    return violations;
  }

  private validateCycles(): ValidationViolation[] {
    const graph = new Map<string, string[]>();
    for (const edge of this.registry.listDependencies()) {
      const next = graph.get(edge.from) ?? [];
      next.push(edge.to);
      graph.set(edge.from, next);
    }

    const visited = new Set<string>();
    const stack = new Set<string>();
    const violations: ValidationViolation[] = [];

    const visit = (nodeId: string): void => {
      if (stack.has(nodeId)) {
        violations.push(
          Object.freeze({
            code: "CYCLIC_DEPENDENCY",
            message: `Cyclic dependency detected involving ${nodeId}`,
            sourceId: nodeId,
          }),
        );
        return;
      }
      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      stack.add(nodeId);
      for (const next of graph.get(nodeId) ?? []) {
        visit(next);
      }
      stack.delete(nodeId);
    };

    for (const nodeId of graph.keys()) {
      visit(nodeId);
    }

    return violations;
  }

  private validateModuleApiCoverage(): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    for (const module of this.registry.listModules()) {
      if (module.publicMethods.length === 0) {
        violations.push(
          Object.freeze({
            code: "MODULE_API_MISSING",
            message: `Module ${module.id} has no documented public API methods`,
            sourceId: module.id,
          }),
        );
      }
    }
    return violations;
  }
}
