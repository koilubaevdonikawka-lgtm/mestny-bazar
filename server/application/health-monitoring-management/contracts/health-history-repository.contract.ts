import type { HealthHistoryEntry } from "@server/application/health-monitoring-management/models/health-monitoring.model";

export interface IHealthHistoryRepository {
  save(entry: HealthHistoryEntry): Promise<void>;
  findByCheckId(checkId: string): Promise<readonly HealthHistoryEntry[]>;
  findByComponentId(componentId: string): Promise<readonly HealthHistoryEntry[]>;
  findAll(): Promise<readonly HealthHistoryEntry[]>;
}
