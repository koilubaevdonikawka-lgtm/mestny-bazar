import type { IHealthCheckExecutor } from "@server/application/health-monitoring-management/contracts/health-check-executor.contract";
import {
  createHealthCheckResult,
  type HealthCheckDefinition,
  type HealthCheckResult,
  type HealthStatus,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";

/** Default in-memory health check executor. */
export class DefaultHealthCheckExecutor implements IHealthCheckExecutor {
  async execute(definition: HealthCheckDefinition): Promise<HealthCheckResult> {
    const startedAt = Date.now();
    const status = this.resolveStatus(definition);
    const message = this.resolveMessage(definition, status);

    return createHealthCheckResult({
      checkId: definition.checkId,
      componentId: definition.componentId,
      name: definition.name,
      status,
      message,
      durationMs: Date.now() - startedAt,
    });
  }

  private resolveStatus(definition: HealthCheckDefinition): HealthStatus {
    const componentId = definition.componentId.toLowerCase();

    if (componentId.includes("unhealthy") || componentId.includes("fail")) {
      return "unhealthy";
    }

    if (componentId.includes("degraded") || componentId.includes("warn")) {
      return "degraded";
    }

    return "healthy";
  }

  private resolveMessage(definition: HealthCheckDefinition, status: HealthStatus): string {
    return `${definition.checkType} check for "${definition.name}" is ${status}.`;
  }
}
