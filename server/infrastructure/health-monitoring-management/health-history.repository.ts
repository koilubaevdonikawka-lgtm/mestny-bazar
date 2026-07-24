import type { IHealthHistoryRepository } from "@server/application/health-monitoring-management/contracts/health-history-repository.contract";
import type { HealthHistoryEntry } from "@server/application/health-monitoring-management/models/health-monitoring.model";

/** In-memory health check history store. */
export class HealthHistoryRepository implements IHealthHistoryRepository {
  private readonly entries = new Map<string, HealthHistoryEntry>();
  private readonly entriesByCheck = new Map<string, Set<string>>();
  private readonly entriesByComponent = new Map<string, Set<string>>();

  async save(entry: HealthHistoryEntry): Promise<void> {
    this.entries.set(entry.historyId, entry);

    const checkEntries = this.entriesByCheck.get(entry.checkId) ?? new Set<string>();
    checkEntries.add(entry.historyId);
    this.entriesByCheck.set(entry.checkId, checkEntries);

    const componentEntries = this.entriesByComponent.get(entry.componentId) ?? new Set<string>();
    componentEntries.add(entry.historyId);
    this.entriesByComponent.set(entry.componentId, componentEntries);
  }

  async findByCheckId(checkId: string): Promise<readonly HealthHistoryEntry[]> {
    return this.sortEntries(this.entriesByCheck.get(checkId.trim()));
  }

  async findByComponentId(componentId: string): Promise<readonly HealthHistoryEntry[]> {
    return this.sortEntries(this.entriesByComponent.get(componentId.trim()));
  }

  async findAll(): Promise<readonly HealthHistoryEntry[]> {
    return Object.freeze(
      [...this.entries.values()].sort((left, right) =>
        right.checkedAt.localeCompare(left.checkedAt),
      ),
    );
  }

  private sortEntries(ids: Set<string> | undefined): readonly HealthHistoryEntry[] {
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.entries.get(id))
        .filter((entry): entry is HealthHistoryEntry => entry !== undefined)
        .sort((left, right) => right.checkedAt.localeCompare(left.checkedAt)),
    );
  }
}
