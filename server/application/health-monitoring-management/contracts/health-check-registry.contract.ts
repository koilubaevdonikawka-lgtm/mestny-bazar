import type { HealthCheckDefinition } from "@server/application/health-monitoring-management/models/health-monitoring.model";

export interface IHealthCheckRegistry {
  register(definition: HealthCheckDefinition): Promise<void>;
  unregister(checkId: string): Promise<void>;
  get(checkId: string): Promise<HealthCheckDefinition | null>;
  list(): Promise<readonly HealthCheckDefinition[]>;
  listByComponent(componentId: string): Promise<readonly HealthCheckDefinition[]>;
}
