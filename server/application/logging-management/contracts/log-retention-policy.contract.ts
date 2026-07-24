import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

export interface ILogRetentionPolicy {
  shouldRetain(entry: LogEntry): boolean;
  getMaxEntries(): number;
}
