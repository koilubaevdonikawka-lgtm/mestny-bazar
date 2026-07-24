import type {
  FilterLogsInput,
  LogEntry,
} from "@server/application/logging-management/models/log-entry.model";

export interface ILogFilter {
  filter(entries: readonly LogEntry[], criteria: FilterLogsInput): readonly LogEntry[];
  search(entries: readonly LogEntry[], query: string): readonly LogEntry[];
}
