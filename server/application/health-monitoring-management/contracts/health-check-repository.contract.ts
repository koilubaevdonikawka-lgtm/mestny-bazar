import type { HealthCheckDefinition } from "@server/application/health-monitoring-management/models/health-monitoring.model";

export interface IHealthCheckRepository {
  save(definition: HealthCheckDefinition): Promise<void>;
  findById(checkId: string): Promise<HealthCheckDefinition | null>;
  delete(checkId: string): Promise<void>;
  findAll(): Promise<readonly HealthCheckDefinition[]>;
  findByComponentId(componentId: string): Promise<readonly HealthCheckDefinition[]>;
}
