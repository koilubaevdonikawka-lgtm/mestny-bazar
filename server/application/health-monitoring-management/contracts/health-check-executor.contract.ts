import type {
  HealthCheckDefinition,
  HealthCheckResult,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";

export interface IHealthCheckExecutor {
  execute(definition: HealthCheckDefinition): Promise<HealthCheckResult>;
}
