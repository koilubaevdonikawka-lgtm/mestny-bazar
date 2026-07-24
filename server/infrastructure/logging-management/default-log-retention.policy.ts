import type { ILogRetentionPolicy } from "@server/application/logging-management/contracts/log-retention-policy.contract";
import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

const DEFAULT_MAX_ENTRIES = 10_000;

/** Default retention policy — accepts all levels, limits total stored entries. */
export class DefaultLogRetentionPolicy implements ILogRetentionPolicy {
  constructor(private readonly maxEntries: number = DEFAULT_MAX_ENTRIES) {}

  shouldRetain(_entry: LogEntry): boolean {
    return true;
  }

  getMaxEntries(): number {
    return this.maxEntries;
  }
}
