import type { IAuditRepository } from "@server/application/audit-management/contracts/audit-repository.contract";
import type { IAuditRetentionPolicy } from "@server/application/audit-management/contracts/audit-retention-policy.contract";
import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

/** In-memory audit log store. */
export class AuditRepository implements IAuditRepository {
  private readonly entries = new Map<string, AuditEntry>();

  constructor(private readonly retentionPolicy?: IAuditRetentionPolicy) {}

  async save(entry: AuditEntry): Promise<void> {
    this.entries.set(entry.auditId, entry);
    await this.pruneIfNeeded();
  }

  async findById(auditId: string): Promise<AuditEntry | null> {
    return this.entries.get(auditId.trim()) ?? null;
  }

  async findAll(): Promise<readonly AuditEntry[]> {
    return this.sortByOccurredAt([...this.entries.values()]);
  }

  async findByUserId(userId: string): Promise<readonly AuditEntry[]> {
    const normalizedUserId = userId.trim();
    return this.sortByOccurredAt(
      [...this.entries.values()].filter((entry) => entry.userId === normalizedUserId),
    );
  }

  async findByModule(module: string): Promise<readonly AuditEntry[]> {
    const normalizedModule = module.trim();
    return this.sortByOccurredAt(
      [...this.entries.values()].filter((entry) => entry.module === normalizedModule),
    );
  }

  async findByEventType(eventType: string): Promise<readonly AuditEntry[]> {
    const normalizedEventType = eventType.trim();
    return this.sortByOccurredAt(
      [...this.entries.values()].filter((entry) => entry.eventType === normalizedEventType),
    );
  }

  async findByDateRange(from: string, to: string): Promise<readonly AuditEntry[]> {
    const fromTime = Date.parse(from);
    const toTime = Date.parse(to);
    if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
      return Object.freeze([]);
    }

    return this.sortByOccurredAt(
      [...this.entries.values()].filter((entry) => {
        const occurredAt = Date.parse(entry.occurredAt);
        return !Number.isNaN(occurredAt) && occurredAt >= fromTime && occurredAt <= toTime;
      }),
    );
  }

  private async pruneIfNeeded(): Promise<void> {
    if (!this.retentionPolicy) {
      return;
    }

    const maxEntries = this.retentionPolicy.getMaxEntries();
    if (this.entries.size <= maxEntries) {
      return;
    }

    const toRemove = this.entries.size - maxEntries;
    const oldest = [...this.entries.values()]
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
      .slice(0, toRemove);

    for (const entry of oldest) {
      this.entries.delete(entry.auditId);
    }
  }

  private sortByOccurredAt(entries: AuditEntry[]): readonly AuditEntry[] {
    return Object.freeze(
      entries.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)),
    );
  }
}
