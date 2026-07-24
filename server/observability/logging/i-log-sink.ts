import type { LogEntry } from "@server/observability/logging/log-entry";

/** Receives structured log entries for persistence or output. */
export interface ILogSink {
  write(entry: LogEntry, formatted?: string): void | Promise<void>;
  flush?(): void | Promise<void>;
}
