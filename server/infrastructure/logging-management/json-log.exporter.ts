import type { ILogExporter } from "@server/application/logging-management/contracts/log-exporter.contract";
import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

/** JSON log exporter — serializes log entries to JSON array. */
export class JsonLogExporter implements ILogExporter {
  async export(entries: readonly LogEntry[]): Promise<string> {
    return JSON.stringify(entries, null, 2);
  }
}
