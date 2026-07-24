import type { IHealthCheckRepository } from "@server/application/health-monitoring-management/contracts/health-check-repository.contract";
import type { HealthCheckDefinition } from "@server/application/health-monitoring-management/models/health-monitoring.model";

/** In-memory health check definition store. */
export class HealthCheckRepository implements IHealthCheckRepository {
  private readonly checks = new Map<string, HealthCheckDefinition>();
  private readonly checksByComponent = new Map<string, Set<string>>();

  constructor() {
    this.seedDefaults();
  }

  async save(definition: HealthCheckDefinition): Promise<void> {
    this.checks.set(definition.checkId, definition);

    const componentChecks =
      this.checksByComponent.get(definition.componentId) ?? new Set<string>();
    componentChecks.add(definition.checkId);
    this.checksByComponent.set(definition.componentId, componentChecks);
  }

  async findById(checkId: string): Promise<HealthCheckDefinition | null> {
    return this.checks.get(checkId.trim()) ?? null;
  }

  async delete(checkId: string): Promise<void> {
    const definition = await this.findById(checkId);
    if (!definition) {
      return;
    }

    this.checks.delete(definition.checkId);
    const componentChecks = this.checksByComponent.get(definition.componentId);
    componentChecks?.delete(definition.checkId);
  }

  async findAll(): Promise<readonly HealthCheckDefinition[]> {
    return Object.freeze([...this.checks.values()]);
  }

  async findByComponentId(componentId: string): Promise<readonly HealthCheckDefinition[]> {
    const ids = this.checksByComponent.get(componentId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.checks.get(id))
        .filter((check): check is HealthCheckDefinition => check !== undefined),
    );
  }

  private seedDefaults(): void {
    const now = new Date().toISOString();
    const defaults: HealthCheckDefinition[] = [
      Object.freeze({
        checkId: "health-api-liveness",
        componentId: "api-server",
        name: "API Server Liveness",
        checkType: "liveness",
        createdAt: now,
      }),
      Object.freeze({
        checkId: "health-api-readiness",
        componentId: "api-server",
        name: "API Server Readiness",
        checkType: "readiness",
        createdAt: now,
      }),
      Object.freeze({
        checkId: "health-storage-ping",
        componentId: "storage",
        name: "Storage Ping",
        checkType: "ping",
        createdAt: now,
      }),
    ];

    for (const definition of defaults) {
      this.checks.set(definition.checkId, definition);
      const componentChecks =
        this.checksByComponent.get(definition.componentId) ?? new Set<string>();
      componentChecks.add(definition.checkId);
      this.checksByComponent.set(definition.componentId, componentChecks);
    }
  }
}
