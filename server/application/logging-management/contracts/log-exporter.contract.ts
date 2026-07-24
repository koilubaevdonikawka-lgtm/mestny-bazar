import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

export interface ILogExporter {
  export(entries: readonly LogEntry[]): Promise<string>;
}
