import type { IHealthCheckRegistry } from "@server/application/health-monitoring-management/contracts/health-check-registry.contract";
import type { IHealthCheckRepository } from "@server/application/health-monitoring-management/contracts/health-check-repository.contract";
import type { HealthCheckDefinition } from "@server/application/health-monitoring-management/models/health-monitoring.model";

/** In-memory health check registry backed by repository. */
export class HealthCheckRegistry implements IHealthCheckRegistry {
  constructor(private readonly repository: IHealthCheckRepository) {}

  async register(definition: HealthCheckDefinition): Promise<void> {
    await this.repository.save(definition);
  }

  async unregister(checkId: string): Promise<void> {
    await this.repository.delete(checkId);
  }

  async get(checkId: string): Promise<HealthCheckDefinition | null> {
    return this.repository.findById(checkId);
  }

  async list(): Promise<readonly HealthCheckDefinition[]> {
    return this.repository.findAll();
  }

  async listByComponent(componentId: string): Promise<readonly HealthCheckDefinition[]> {
    return this.repository.findByComponentId(componentId);
  }
}
