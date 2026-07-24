/**
 * Health Monitoring Management — component health checks only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IHealthCheckExecutor } from "@server/application/health-monitoring-management/contracts/health-check-executor.contract";
import type { IHealthCheckRegistry } from "@server/application/health-monitoring-management/contracts/health-check-registry.contract";
import type { IHealthCheckRepository } from "@server/application/health-monitoring-management/contracts/health-check-repository.contract";
import type { IHealthHistoryRepository } from "@server/application/health-monitoring-management/contracts/health-history-repository.contract";
import type { IHealthStatusAggregator } from "@server/application/health-monitoring-management/contracts/health-status-aggregator.contract";
import {
  createHealthCheckDefinition,
  createHealthCheckResult,
  createHealthHistoryEntry,
  type ComponentHealthResult,
  type HealthCheckDefinition,
  type HealthCheckResult,
  type HealthHistoryResult,
  type ListHealthChecksResult,
  type RegisterHealthCheckInput,
  type SystemHealthResult,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";
import type { IIdGenerator } from "@server/application/ports";

export class HealthMonitoringManagementService {
  constructor(
    private readonly checkRepository: IHealthCheckRepository,
    private readonly checkRegistry: IHealthCheckRegistry,
    private readonly checkExecutor: IHealthCheckExecutor,
    private readonly statusAggregator: IHealthStatusAggregator,
    private readonly historyRepository: IHealthHistoryRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerCheck(input: RegisterHealthCheckInput): Promise<HealthCheckDefinition> {
    const definition = createHealthCheckDefinition({
      checkId: this.idGenerator.generate(),
      componentId: input.componentId,
      name: input.name,
      checkType: input.checkType,
    });

    await this.checkRepository.save(definition);
    await this.checkRegistry.register(definition);
    return definition;
  }

  async removeCheck(checkId: string): Promise<{ checkId: string; removed: boolean }> {
    const normalizedCheckId = checkId.trim();
    const definition = await this.checkRepository.findById(normalizedCheckId);
    if (!definition) {
      throw new Error(`Health check not found: ${normalizedCheckId}`);
    }

    await this.checkRegistry.unregister(normalizedCheckId);
    await this.checkRepository.delete(normalizedCheckId);

    return Object.freeze({ checkId: normalizedCheckId, removed: true });
  }

  async runCheck(checkId: string): Promise<HealthCheckResult> {
    const definition = await this.requireCheck(checkId);
    return this.executeAndRecord(definition);
  }

  async runAllChecks(): Promise<SystemHealthResult> {
    const definitions = await this.checkRegistry.list();
    const results = await Promise.all(definitions.map((definition) => this.executeAndRecord(definition)));
    return this.statusAggregator.aggregateSystem(results);
  }

  async getComponentHealth(componentId: string): Promise<ComponentHealthResult> {
    const definitions = await this.checkRegistry.listByComponent(componentId.trim());
    const results = await Promise.all(definitions.map((definition) => this.executeAndRecord(definition)));
    return this.statusAggregator.aggregateComponent(componentId.trim(), results);
  }

  async getSystemHealth(): Promise<SystemHealthResult> {
    const definitions = await this.checkRegistry.list();
    if (definitions.length === 0) {
      return this.statusAggregator.aggregateSystem([]);
    }

    const latestResults = await this.getLatestResultsForDefinitions(definitions);
    return this.statusAggregator.aggregateSystem(latestResults);
  }

  async getHealthHistory(checkId?: string, componentId?: string): Promise<HealthHistoryResult> {
    let entries;

    if (checkId?.trim()) {
      entries = await this.historyRepository.findByCheckId(checkId.trim());
    } else if (componentId?.trim()) {
      entries = await this.historyRepository.findByComponentId(componentId.trim());
    } else {
      entries = await this.historyRepository.findAll();
    }

    const sorted = Object.freeze(
      [...entries].sort((left, right) => right.checkedAt.localeCompare(left.checkedAt)),
    );

    return Object.freeze({ entries: sorted, total: sorted.length });
  }

  async listChecks(): Promise<ListHealthChecksResult> {
    const checks = await this.checkRegistry.list();
    return Object.freeze({
      checks: Object.freeze(
        [...checks].sort((left, right) => left.name.localeCompare(right.name)),
      ),
      total: checks.length,
    });
  }

  private async executeAndRecord(definition: HealthCheckDefinition): Promise<HealthCheckResult> {
    const result = await this.checkExecutor.execute(definition);

    await this.historyRepository.save(
      createHealthHistoryEntry({
        historyId: this.idGenerator.generate(),
        checkId: result.checkId,
        componentId: result.componentId,
        status: result.status,
        message: result.message,
        checkedAt: result.checkedAt,
        durationMs: result.durationMs,
      }),
    );

    return result;
  }

  private async getLatestResultsForDefinitions(
    definitions: readonly HealthCheckDefinition[],
  ): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    for (const definition of definitions) {
      const history = await this.historyRepository.findByCheckId(definition.checkId);
      const latest = history[0];
      if (latest) {
        results.push(
          createHealthCheckResult({
            checkId: latest.checkId,
            componentId: latest.componentId,
            name: definition.name,
            status: latest.status,
            message: latest.message,
            checkedAt: latest.checkedAt,
            durationMs: latest.durationMs,
          }),
        );
      } else {
        results.push(await this.executeAndRecord(definition));
      }
    }

    return results;
  }

  private async requireCheck(checkId: string): Promise<HealthCheckDefinition> {
    const definition = await this.checkRepository.findById(checkId.trim());
    if (!definition) {
      throw new Error(`Health check not found: ${checkId}`);
    }
    return definition;
  }
}
